/**
 * supabase/functions/compare-prices/index.ts
 *
 * Global price comparison engine powered by Gemini 1.5 Flash with
 * Google Search Grounding. Identifies the 3 top local retailers for any
 * country, fetches real-time prices in local currency, and returns
 * structured JSON the frontend can render without additional parsing.
 *
 * Input:  { product_title: string, country: string, currency: string }
 * Output: GlobalComparisonResult JSON
 */

// @ts-ignore Deno ESM import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: {
  env: { get(key: string): string | undefined }
  serve(handler: (req: Request) => Promise<Response>): void
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComparisonResult {
  store: string
  price: number
  formatted_price: string
  url: string
  is_best_deal: boolean
  confidence_score: 'high' | 'medium' | 'low'
}

interface GlobalComparisonResponse {
  product_name: string
  currency_display: string
  results: ComparisonResult[]
  global_avg_price: number
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    const { product_title, country, currency } = body

    if (!product_title || typeof product_title !== 'string') {
      return jsonError('product_title is required', 400)
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) return jsonError('Comparison service is not configured.', 500)

    const targetCountry = String(country || 'United States').trim()
    const targetCurrency = String(currency || 'USD').trim()

    console.log(`[compare-prices] "${product_title}" → ${targetCountry} (${targetCurrency})`)

    const result = await searchWithGemini(product_title, targetCountry, targetCurrency, geminiKey)

    if (!result) {
      return jsonError('Could not find price comparison data for this product. Try again.', 503)
    }

    return jsonOk(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[compare-prices] ERROR:', msg)

    // Surface 429 explicitly so frontend can handle circuit breaker
    if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
      return jsonError('API_QUOTA_EXCEEDED', 429)
    }

    return jsonError("Comparison unavailable right now. Please try again in a moment.", 503)
  }
})

// ─── Gemini search with Google Search Grounding ───────────────────────────────

async function searchWithGemini(
  productTitle: string,
  country: string,
  currency: string,
  apiKey: string,
): Promise<GlobalComparisonResponse | null> {
  const systemInstruction = `Actúa como un motor de búsqueda de productos global especializado en comparación de precios en tiempo real.

Tu objetivo es encontrar el producto en el país especificado y devolver una comparativa de las tiendas líderes locales EXCLUYENDO Amazon (se rastrea por separado).

Reglas estrictas:
1. Solo devuelves coincidencias EXACTAS (mismo modelo, mismas especificaciones, producto nuevo).
2. NUNCA incluyas Amazon en los resultados.
3. Para United States: busca en HASTA estas 5 tiendas: Walmart (walmart.com), Best Buy (bestbuy.com), Target (target.com), eBay (ebay.com) y Costco (costco.com). Incluye todas las que tengan el producto disponible.
4. Para otros países: identifica hasta 5 retailers más relevantes excluyendo Amazon.
5. Las URLs DEBEN ser URLs reales y funcionales que el usuario pueda abrir en su navegador.
   Usa Google Search para encontrar la URL real de cada producto en cada tienda.
   Formatos válidos por tienda:
   - Walmart USA (producto directo): https://www.walmart.com/ip/PRODUCT-SLUG/ITEM_ID
   - Walmart USA (búsqueda):         https://www.walmart.com/search?q=TERMINOS
   - Best Buy USA (producto directo): https://www.bestbuy.com/site/PRODUCT-NAME/SKU.p
   - Best Buy USA (búsqueda):         https://www.bestbuy.com/site/searchpage.jsp?st=TERMINOS
   - Target USA (producto directo):   https://www.target.com/p/PRODUCT-SLUG/-/A-DPCI
   - Target USA (búsqueda):           https://www.target.com/s?searchTerm=TERMINOS
   - eBay USA (búsqueda):             https://www.ebay.com/sch/i.html?_nkw=TERMINOS
   - Costco USA (búsqueda):           https://www.costco.com/CatalogSearch?keyword=TERMINOS
   CRÍTICO: NUNCA inventes ni supongas IDs de producto, SKUs ni DPCIs. Si Google Search no te devuelve la URL exacta del producto, usa SIEMPRE la URL de búsqueda de la tienda con los términos del producto. Es mejor una URL de búsqueda real que una URL de producto inventada.
6. Extrae precio actual usando Google Search. Si el producto no está disponible en esa tienda, omite ese resultado.
7. Si la moneda de la tienda no es ${currency}, realiza la conversión al tipo de cambio actual.
8. Asigna confidence_score: "high" si el producto es idéntico, "medium" si es probable, "low" si es aproximado.
9. Respuesta ÚNICA en JSON puro, sin markdown, sin explicaciones.`

  const userPrompt = `Busca este producto en ${country} y devuelve comparativa de precios en ${currency}. NO incluyas Amazon.

Producto: "${productTitle}"
País: ${country}
Moneda de salida: ${currency}

Usa Google Search para encontrar el precio actual y la URL real del producto en cada tienda.
Para United States busca en: Walmart, Best Buy, Target, eBay y Costco (hasta 5 tiendas).

Formato de respuesta obligatorio (JSON puro, sin backticks, sin texto adicional):
{
  "product_name": "nombre del producto tal como aparece en las tiendas",
  "currency_display": "${currency}",
  "results": [
    {
      "store": "nombre de la tienda",
      "price": precio_numerico,
      "formatted_price": "precio con símbolo de moneda",
      "url": "https://url-real-y-funcional-del-producto-o-busqueda-en-la-tienda",
      "is_best_deal": true_o_false,
      "confidence_score": "high|medium|low"
    }
  ],
  "global_avg_price": precio_promedio_numerico
}

Entre 3 y 5 resultados (omite una tienda si el producto definitivamente no está disponible). Solo un resultado puede tener is_best_deal: true.`

  // Attempt 1: gemini-2.5-flash with google_search
  // Attempt 2: gemini-2.5-flash-lite with google_search
  // Attempt 3: gemini-2.5-flash-lite no grounding (training data only, last resort)
  const attempts: Array<{ model: string; tools: unknown[] | null }> = [
    { model: 'gemini-2.5-flash', tools: [{ google_search: {} }] },
    { model: 'gemini-2.5-flash-lite', tools: [{ google_search: {} }] },
    { model: 'gemini-2.5-flash-lite', tools: null },
  ]

  for (const { model, tools } of attempts) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      // deno-lint-ignore no-explicit-any
      const requestBody: Record<string, any> = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
      }
      if (tools) requestBody.tools = tools

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        },
      )

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        // Re-throw 429 so the outer handler surfaces it correctly
        if (response.status === 429) throw new Error(`429 Quota exceeded`)
        throw new Error(`Gemini ${model} HTTP ${response.status}: ${text.slice(0, 200)}`)
      }

      // deno-lint-ignore no-explicit-any
      const body: any = await response.json()

      // With grounding, all text content is in parts — join them all
      // deno-lint-ignore no-explicit-any
      const parts: any[] = body?.candidates?.[0]?.content?.parts ?? []
      const raw = parts.map((p: { text?: string }) => p.text ?? '').join('')

      const parsed = parseGeminiResponse(raw)
      if (parsed) {
        console.log(`[compare-prices] ${model}${tools ? '+search' : ''} → ${parsed.results.length} results`)
        return parsed
      }
      console.warn(`[compare-prices] ${model} unparseable, trying next`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('429')) throw e // propagate quota error immediately
      console.warn(`[compare-prices] ${model}${tools ? '+search' : ''} failed: ${msg}`)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return null
}

// ─── Parse & validate Gemini JSON response ────────────────────────────────────

function parseGeminiResponse(raw: string): GlobalComparisonResponse | null {
  try {
    const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    // deno-lint-ignore no-explicit-any
    const parsed: any = JSON.parse(jsonMatch[0])

    if (!Array.isArray(parsed.results) || parsed.results.length === 0) return null

    // deno-lint-ignore no-explicit-any
    const results: ComparisonResult[] = parsed.results.map((r: any, i: number) => ({
      store: String(r.store ?? `Store ${i + 1}`),
      price: Number(r.price ?? 0),
      formatted_price: String(r.formatted_price ?? String(r.price ?? '—')),
      url: String(r.url ?? ''),
      is_best_deal: Boolean(r.is_best_deal),
      confidence_score: (['high', 'medium', 'low'].includes(r.confidence_score)
        ? r.confidence_score
        : 'medium') as 'high' | 'medium' | 'low',
    })).filter((r: ComparisonResult) => r.price > 0 && r.store)

    if (results.length === 0) return null

    // Ensure exactly one is_best_deal = true (the cheapest one)
    const sorted = [...results].sort((a, b) => a.price - b.price)
    results.forEach(r => { r.is_best_deal = false })
    const cheapest = results.find(r => r.store === sorted[0].store)
    if (cheapest) cheapest.is_best_deal = true

    const globalAvg = results.reduce((s, r) => s + r.price, 0) / results.length

    return {
      product_name: String(parsed.product_name ?? ''),
      currency_display: String(parsed.currency_display ?? 'USD'),
      results,
      global_avg_price: Math.round(globalAvg * 100) / 100,
    }
  } catch (e) {
    console.warn('[compare-prices] JSON parse failed:', e)
    return null
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

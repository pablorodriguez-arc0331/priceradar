/**
 * supabase/functions/fetch-prices/index.ts
 *
 * Edge Function: receives a product URL, fetches real-time product and price
 * data from Rainforest API, stores price history, aggregates prices across
 * multiple retailers, computes a price signal, and returns the product_id.
 *
 * Provider: Rainforest API (https://www.rainforestapi.com)
 * Input: Amazon product URLs only (ASIN extracted and validated before fetching)
 * Primary data: Amazon — title, image, price, Keepa price history
 * Cross-retailer comparison: internal search on Walmart / Best Buy (never exposed as input)
 *
 * Note: Deno/ESM errors in VS Code are IDE false positives — runs on Deno.
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

interface NormalizedProduct {
  name: string
  image_url: string | null
  asin: string | null
  category: string | null
  current_price: number
  original_price: number | null
  currency: string
  retailer_slug: string
  source_url: string
  price_history: Array<{ date: string; price: number }>
}

interface PriceSignalResult {
  verdict: 'low' | 'high' | 'neutral' | 'no_data'
  label: string
  subtext: string
  percentile: number
  signal_strength: number
  historical_low: number
  historical_high: number
  reference_range_days: number
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    const { url } = body
    if (!url || typeof url !== 'string') return jsonError('URL is required', 400)

    console.log(`[fetch-prices] Incoming URL: ${url}`)

    const retailerSlug = detectRetailer(url)
    if (!retailerSlug) {
      return jsonError('Only Amazon product URLs are supported.', 422)
    }

    // Resolve a.co short links to the full Amazon URL before extracting ASIN
    const resolvedUrl = (new URL(url).hostname === 'a.co') ? await resolveRedirect(url) : url
    if (resolvedUrl !== url) {
      console.log(`[fetch-prices] Short link resolved to: ${resolvedUrl}`)
    }

    const asin = extractAsin(resolvedUrl)
    console.log(`[fetch-prices] Extracted ASIN: ${asin ?? 'NONE'}`)
    if (!asin) {
      return jsonError(
        'Could not find a product ASIN in this link. ' +
        'Please paste a direct product page URL (e.g. amazon.com/dp/B0...).',
        422,
      )
    }

    const rainforestKey = Deno.env.get('RAINFOREST_API_KEY')
    if (!rainforestKey) {
      console.error('[fetch-prices] RAINFOREST_API_KEY secret is not set')
      return jsonError('Price service is not configured. Please contact support.', 500)
    }

    // deno-lint-ignore no-explicit-any
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // ── Cache check — skip refetch if < 1 hour old ────────────────────────────
    // Rewrite all Amazon locales to amazon.com so international users share the
    // same cache entry and always receive US pricing data.
    const canonicalUrl = retailerSlug === 'amazon' ? normalizeAmazonUrl(resolvedUrl) : resolvedUrl
    const normalizedUrl = normalizeUrl(canonicalUrl)
    console.log(`[fetch-prices] Cache key: ${normalizedUrl}`)

    const { data: existing } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('source_url', normalizedUrl)
      .maybeSingle()

    if (existing) {
      const ageMs = Date.now() - new Date(existing.updated_at).getTime()
      if (ageMs < 60 * 60 * 1000) {
        console.log(`[fetch-prices] Cache hit — returning product_id: ${existing.id}`)
        return jsonOk({ product_id: existing.id, cached: true })
      }
    }

    // ── Fetch product data from Rainforest ────────────────────────────────────
    console.log(`[fetch-prices] Calling Rainforest API for ASIN: ${asin}`)
    const normalized: NormalizedProduct = await fetchAmazon(canonicalUrl, rainforestKey)

    console.log(
      `[fetch-prices] Rainforest OK — "${normalized.name}" @ $${normalized.current_price}`
    )

    // Validate core fields
    if (!normalized.name?.trim()) {
      throw new Error('Product data is incomplete — title missing from Rainforest response')
    }
    if (normalized.current_price <= 0) {
      throw new Error(
        'No current price found for this product. ' +
        'It may be out of stock or available from 3rd-party sellers only.',
      )
    }

    // ── Upsert product ────────────────────────────────────────────────────────
    const { data: product, error: productError } = await supabase
      .from('products')
      .upsert(
        {
          ...(existing ? { id: existing.id } : {}),
          name: normalized.name,
          image_url: normalized.image_url,
          asin: normalized.asin,
          category: normalized.category,
          source_url: normalizedUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'source_url' },
      )
      .select()
      .single()

    if (productError) throw productError

    // ── Get primary retailer row ───────────────────────────────────────────────
    const { data: retailerRow } = await supabase
      .from('retailers')
      .select('id')
      .eq('slug', retailerSlug)
      .single()

    if (!retailerRow) throw new Error(`Retailer '${retailerSlug}' not found in database`)

    // ── Store current price point ──────────────────────────────────────────────
    await supabase.from('price_points').insert({
      product_id: product.id,
      retailer_id: retailerRow.id,
      price: normalized.current_price,
      currency: normalized.currency,
      captured_at: new Date().toISOString(),
      is_current: true,
    })

    // ── Store historical price points (Keepa / Rainforest history) ────────────
    if (normalized.price_history.length > 0) {
      console.log(
        `[fetch-prices] Storing ${normalized.price_history.length} historical price points`,
      )
      const historyRows = normalized.price_history.map(h => ({
        product_id: product.id,
        retailer_id: retailerRow.id,
        price: h.price,
        currency: normalized.currency,
        captured_at: h.date,
        is_current: false,
      }))
      // Insert in batches of 100 — ignore duplicate captured_at entries
      for (let i = 0; i < historyRows.length; i += 100) {
        await supabase
          .from('price_points')
          .insert(historyRows.slice(i, i + 100))
          .catch((e: Error) => console.warn('[fetch-prices] history batch insert error:', e.message))
      }
    } else {
      console.log(`[fetch-prices] No price history returned by API for: ${normalized.name}`)
    }

    // ── Multi-retailer: search Walmart + Best Buy (free, runs for all users) ──
    if (retailerSlug === 'amazon') {
      await searchAndStoreOtherRetailers(
        normalized.name,
        product.id,
        supabase,
        rainforestKey,
      ).catch((e: Error) => console.warn('[fetch-prices] multi-retailer error:', e.message))
    }

    // ── Compute signal from primary retailer price history ────────────────────
    const { data: allPrices } = await supabase
      .from('price_points')
      .select('price, captured_at')
      .eq('product_id', product.id)
      .eq('retailer_id', retailerRow.id)
      .order('captured_at', { ascending: true })

    const signal = computeSignal(
      normalized.current_price,
      (allPrices ?? []).map((p: { price: number; captured_at: string }) => ({
        price: Number(p.price),
        date: p.captured_at,
      })),
    )

    // ── Find best current price across all retailers ───────────────────────────
    const { data: bestRow } = await supabase
      .from('price_points')
      .select('price, retailer:retailers(slug)')
      .eq('product_id', product.id)
      .eq('is_current', true)
      .order('price', { ascending: true })
      .limit(1)
      .maybeSingle()

    const bestCurrentPrice = bestRow?.price ? Number(bestRow.price) : normalized.current_price
    // deno-lint-ignore no-explicit-any
    const bestCurrentRetailer = (bestRow?.retailer as any)?.slug ?? retailerSlug

    // ── Upsert price signal ───────────────────────────────────────────────────
    await supabase.from('price_signals').upsert(
      {
        product_id: product.id,
        verdict: signal.verdict,
        label: signal.label,
        subtext: signal.subtext,
        percentile: signal.percentile,
        signal_strength: signal.signal_strength,
        reference_range_days: signal.reference_range_days,
        historical_low: signal.historical_low,
        historical_high: signal.historical_high,
        current_best_price: bestCurrentPrice,
        current_best_retailer: bestCurrentRetailer,
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'product_id' },
    )

    // ── Dispatch price change alerts (premium push notifications) ────────────
    // Fire-and-forget — does not block the response or affect price fetch result
    supabase.functions.invoke('send-price-alerts', {
      body: { product_id: product.id, current_price: normalized.current_price },
    }).catch((e: Error) =>
      console.warn('[fetch-prices] alert dispatch error:', e.message),
    )

    return jsonOk({ product_id: product.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[fetch-prices] UNHANDLED ERROR:', msg)
    // Return a clean user-facing message; internal details stay in logs
    const userMsg = msg.length < 200 ? msg : "We couldn't fetch data for this product. Please try again."
    return jsonError(userMsg, 500)
  }
})

// ─── Rainforest: Amazon (ASIN-based, with Keepa price history) ────────────────

async function fetchAmazon(url: string, apiKey: string): Promise<NormalizedProduct> {
  const asin = extractAsin(url)
  if (!asin) throw new Error('Could not extract ASIN from this Amazon URL')

  // Always use amazon.com — ensures US pricing for all users regardless of locale.
  // This also normalises international URLs (amazon.co.uk, amazon.de, etc.)
  const params = new URLSearchParams({
    api_key: apiKey,
    type: 'product',
    asin: asin,
    amazon_domain: 'amazon.com',
    include_history: 'true',   // instructs Rainforest to surface Keepa price history
  })

  console.log(`[fetch-prices] Amazon request → ASIN: ${asin}`)

  const response = await fetchWithTimeout(
    `https://api.rainforestapi.com/request?${params.toString()}`,
    15000,
  )

  if (!response.ok) {
    const text = await response.text()
    let errMsg = `Rainforest API error ${response.status}`
    try {
      const parsed = JSON.parse(text)
      errMsg = parsed?.request_info?.message ?? parsed?.message ?? errMsg
    } catch { /* noop */ }
    console.error(`[fetch-prices] Rainforest ${response.status}: ${errMsg}`)
    throw new Error(errMsg)
  }

  const data = await response.json()
  const p = data.product

  console.log(`[fetch-prices] Amazon response keys: ${p ? Object.keys(p).join(', ') : 'no product'}`)

  if (!p) throw new Error('Product not found on Amazon — check the URL is a valid product page')
  if (!p.title) throw new Error('Amazon returned incomplete product data (missing title)')

  // Try every known price field — some products only expose one
  const currentPrice =
    p.buybox_winner?.price?.value ??
    p.price?.value ??
    p.offers?.primary?.price?.value ??
    p.offers?.price?.value ??
    p.buy_box_prices?.[0]?.price?.value ??
    null

  if (!currentPrice || Number(currentPrice) <= 0) {
    throw new Error(
      'This Amazon product does not have a buyable offer right now. ' +
      'It may be out of stock or available from 3rd-party sellers only.',
    )
  }

  // ── Extract price history — Rainforest surfaces Keepa historical data ──────
  // Rainforest may return price_history under different field names depending
  // on the product and API tier. We try multiple paths and handle both
  // {date, price} objects and [timestamp, price] array pairs.
  const priceHistory: Array<{ date: string; price: number }> = []

  // deno-lint-ignore no-explicit-any
  const rawHistory: any[] =
    p.price_history ??
    p.buybox_history ??
    // deno-lint-ignore no-explicit-any
    (p.product_information as any)?.price_history ??
    []

  if (Array.isArray(rawHistory)) {
    for (const entry of rawHistory) {
      if (!entry) continue

      let ts: number | null = null
      let price: number | null = null

      if (Array.isArray(entry) && entry.length >= 2) {
        // Format: [timestamp, price]
        ts = Number(entry[0]) || null
        price = Number(entry[1]) || null
      } else if (typeof entry === 'object') {
        // Format: { date, price } / { timestamp, value } / { t, v }
        // deno-lint-ignore no-explicit-any
        const obj = entry as Record<string, any>
        ts = Number(obj.date ?? obj.timestamp ?? obj.t ?? 0) || null
        price = Number(obj.price ?? obj.value ?? obj.v ?? 0) || null
      }

      if (!ts || !price || price <= 0) continue

      // Normalize timestamp — Keepa uses minutes since Jan 21, 2011
      // Rainforest may normalize to Unix seconds or milliseconds
      let ms: number
      if (ts > 1e12) {
        ms = ts // already milliseconds
      } else if (ts > 1e9) {
        ms = ts * 1000 // Unix seconds → ms
      } else {
        // Keepa minutes offset from Jan 21, 2011 00:00 UTC
        ms = (ts + 21564000) * 60 * 1000
      }

      // Sanity check: must be a realistic date (2010–present+1)
      const year = new Date(ms).getFullYear()
      const currentYear = new Date().getFullYear()
      if (year < 2010 || year > currentYear + 1) continue

      priceHistory.push({ date: new Date(ms).toISOString(), price })
    }
  }

  console.log(`[fetch-prices] Amazon history entries parsed: ${priceHistory.length}`)

  return {
    name: p.title,
    image_url: p.main_image?.link ?? p.images?.[0]?.link ?? null,
    asin: p.asin ?? asin ?? null,
    category: p.categories?.[0]?.name ?? p.category ?? null,
    current_price: Number(currentPrice),
    original_price: p.was_price?.value ? Number(p.was_price.value) : null,
    currency: p.buybox_winner?.price?.currency ?? 'USD',
    retailer_slug: 'amazon',
    source_url: url,
    price_history: priceHistory,
  }
}

// ─── Multi-retailer: search Walmart / Best Buy for the same product ──────────

// deno-lint-ignore no-explicit-any
async function searchAndStoreOtherRetailers(
  productName: string,
  productId: string,
  // deno-lint-ignore no-explicit-any
  supabase: any,
  apiKey: string,
): Promise<void> {
  const SEARCH_SLUGS = ['walmart', 'bestbuy']

  // Fetch retailer IDs in a single query
  const { data: retailers } = await supabase
    .from('retailers')
    .select('id, slug')
    .in('slug', SEARCH_SLUGS)

  if (!retailers?.length) return

  const retailerMap: Record<string, string> = Object.fromEntries(
    // deno-lint-ignore no-explicit-any
    retailers.map((r: any) => [r.slug, r.id]),
  )

  // Search all retailers in parallel — failures are isolated per retailer
  const searches = SEARCH_SLUGS.map(slug =>
    searchRetailerForProduct(productName, slug, apiKey)
      .then(result => ({ slug, result }))
      .catch((e: Error) => {
        console.warn(`[multi-retailer] ${slug} search failed: ${e.message}`)
        return { slug, result: null }
      })
  )

  const results = await Promise.all(searches)

  for (const { slug, result } of results) {
    if (!result || !retailerMap[slug]) continue
    await supabase
      .from('price_points')
      .insert({
        product_id: productId,
        retailer_id: retailerMap[slug],
        price: result.price,
        currency: 'USD',
        captured_at: new Date().toISOString(),
        is_current: true,
      })
      .catch((e: Error) => console.warn(`[multi-retailer] insert ${slug} failed: ${e.message}`))
    console.log(`[multi-retailer] Stored ${slug} price: $${result.price} (${result.title})`)
  }
}

async function searchRetailerForProduct(
  productName: string,
  retailerSlug: string,
  apiKey: string,
): Promise<{ price: number; title: string } | null> {
  // Clean search term: strip special chars, keep letters/numbers/spaces
  const searchTerm = productName
    .replace(/[^\w\s,\-.]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 70)
    .trim()

  const params = new URLSearchParams({
    api_key: apiKey,
    type: 'search',
    search_term: searchTerm,
    retailer: retailerSlug,
  })

  const response = await fetchWithTimeout(
    `https://api.rainforestapi.com/request?${params.toString()}`,
    12000,
  )

  if (!response.ok) return null

  // deno-lint-ignore no-explicit-any
  const data: any = await response.json()
  const results: unknown[] = data.search_results ?? data.results ?? []

  if (!Array.isArray(results) || results.length === 0) return null

  // Check top-5 results for a title match above 20% word-overlap threshold
  for (const item of results.slice(0, 5)) {
    // deno-lint-ignore no-explicit-any
    const obj = item as Record<string, any>
    const title = String(obj.title ?? obj.name ?? '')

    // Extract price — Rainforest search results use different structures per retailer
    const priceValue =
      obj.price?.value ??
      (Array.isArray(obj.prices) ? obj.prices?.[0]?.value : null) ??
      obj.min_price?.value ??
      0
    const price = Number(priceValue)

    if (!title || price <= 0) continue
    if (titleSimilarity(productName, title) < 0.2) continue

    return { price, title }
  }

  return null
}

// Word-overlap Jaccard similarity for product title matching
function titleSimilarity(a: string, b: string): number {
  const tokenize = (s: string) =>
    new Set(
      s.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2),
    )
  const setA = tokenize(a)
  const setB = tokenize(b)
  const intersection = [...setA].filter(w => setB.has(w)).length
  const union = new Set([...setA, ...setB]).size
  return union > 0 ? intersection / union : 0
}

// ─── Price signal computation ─────────────────────────────────────────────────

function computeSignal(
  currentPrice: number,
  history: Array<{ price: number; date: string }>,
): PriceSignalResult {
  const RANGE_DAYS = 90

  if (history.length < 3) {
    return {
      verdict: 'no_data',
      label: 'Not enough history',
      subtext: "We'll build price history as more data is collected",
      percentile: 50,
      signal_strength: 0,
      historical_low: currentPrice,
      historical_high: currentPrice,
      reference_range_days: RANGE_DAYS,
    }
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - RANGE_DAYS)
  const recent = history.filter(h => new Date(h.date) >= cutoff)
  const prices = (recent.length >= 3 ? recent : history).map(h => h.price)

  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const range = high - low
  const percentile = range > 0 ? Math.round(((currentPrice - low) / range) * 100) : 50

  let verdict: 'low' | 'high' | 'neutral'
  let label: string
  let subtext: string
  let signalStrength: number

  const daysLabel = `${RANGE_DAYS}-day`

  if (percentile <= 20) {
    verdict = 'low'
    label = 'Price Low'
    subtext = `${daysLabel} low · ${Math.round(((high - currentPrice) / high) * 100)}% below peak`
    signalStrength = Math.round(((20 - percentile) / 20) * 100)
  } else if (percentile >= 80) {
    verdict = 'high'
    label = 'Price High'
    subtext = `Near ${daysLabel} high · consider waiting`
    signalStrength = Math.round(((percentile - 80) / 20) * 100)
  } else {
    verdict = 'neutral'
    label = 'Average Price'
    subtext = `Close to ${daysLabel} average`
    signalStrength = 50
  }

  return {
    verdict,
    label,
    subtext,
    percentile,
    signal_strength: signalStrength,
    historical_low: low,
    historical_high: high,
    reference_range_days: RANGE_DAYS,
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Price API request timed out — please try again')
    }
    throw err
  } finally {
    clearTimeout(id)
  }
}

function detectRetailer(url: string): string | null {
  try {
    const { hostname } = new URL(url)
    if (hostname.includes('amazon.') || hostname === 'a.co') return 'amazon'
    return null
  } catch {
    return null
  }
}

// Rewrites any Amazon locale URL to amazon.com so international users share
// the same cache entry and always receive US pricing data.
function normalizeAmazonUrl(url: string): string {
  try {
    const u = new URL(url)
    u.hostname = u.hostname.replace(/amazon\.[a-z.]+$/, 'amazon.com')
    return u.toString()
  } catch {
    return url
  }
}

function extractAsin(url: string): string | null {
  const dpMatch = url.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/)
  if (dpMatch) return dpMatch[1]
  const paramMatch = url.match(/[?&]asin=([A-Z0-9]{10})/)
  if (paramMatch) return paramMatch[1]
  return null
}

// Follows a.co (and other) short-link redirects to get the canonical Amazon URL.
// Uses GET (not HEAD) because many redirect chains require a full GET request
// to resolve correctly — some servers return 404 to HEAD but 301 to GET.
async function resolveRedirect(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        // Mimic a real browser to avoid bot detection on short-link services
        'User-Agent': 'Mozilla/5.0 (compatible; PriceRadar/1.0)',
      },
    })
    const resolved = res.url || url
    console.log(`[fetch-prices] resolveRedirect: ${url} → ${resolved}`)
    return resolved
  } catch (e) {
    console.warn(`[fetch-prices] resolveRedirect failed for ${url}:`, (e as Error).message)
    return url
  }
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    const clean = new URL(u.pathname, u.origin)
    return clean.toString()
  } catch {
    return url
  }
}

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

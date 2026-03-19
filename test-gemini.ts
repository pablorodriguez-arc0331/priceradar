/**
 * Quick Gemini API connectivity test
 * Run: npx ts-node test-gemini.ts  OR  deno run --allow-net --allow-env test-gemini.ts
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set')
  process.exit(1)
}

console.log('🔑 GEMINI_API_KEY found, testing connection...')

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Say "connected" and nothing else.' }] }],
      generationConfig: { maxOutputTokens: 10 },
    }),
  },
)

const data = await res.json()

if (!res.ok) {
  console.error(`❌ Gemini API error ${res.status}:`, data?.error?.message ?? data)
  process.exit(1)
}

const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
console.log(`✅ Connected to Gemini API. Response: "${reply}"`)

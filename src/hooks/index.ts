import { useState, useEffect, useCallback } from 'react'
import type { ProductWithPricing, ApiResponse, PriceHistoryRange } from '@/types'
import { isValidAmazonUrl, extractAsinFromUrl } from '@/lib/utils'
import { getProductWithPricing, fetchPricesForUrl, getRecentProducts, getCurrentPricesForProducts } from '@/services/supabase'
import { appendAffiliateTag, buildAmazonAffiliateUrl } from '@/lib/affiliate'

// ─── useProduct — fetch product + pricing by ID ────────────────────────────
export function useProduct(productId: string | undefined): ApiResponse<ProductWithPricing> {
  const [data, setData] = useState<ProductWithPricing | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!productId) return
    let cancelled = false

    const fetch = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { product, signal, prices, history } = await getProductWithPricing(productId)

        if (cancelled) return

        if (!product || !signal) {
          setError("We couldn't find this product. Try a different URL.")
          setIsLoading(false)
          return
        }

        const mapped: ProductWithPricing = {
          ...product,
          signal,
          retailer_prices: (prices ?? []).map((p, i) => ({
            retailer: p.retailer,
            price: Number(p.price),
            is_available: true,
            affiliate_url: p.retailer.slug === 'amazon'
              ? (product.asin ? buildAmazonAffiliateUrl(product.asin) : appendAffiliateTag(product.source_url))
              : (p.retailer.affiliate_url_template ?? '').replace('{{query}}', encodeURIComponent(product.name)),
            last_updated: p.captured_at,
            is_best_price: i === 0, // ordered price ASC
          })),
          price_history: (history ?? []).map(h => ({
            date: h.captured_at,
            price: Number(h.price),
            retailer_id: h.retailer_id,
          })),
        }
        setData(mapped)
        setIsLoading(false)
      } catch {
        if (cancelled) return
        setError("We couldn't find this product. Try a different URL.")
        setIsLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [productId])

  return { data, error, isLoading }
}

// ─── useProductLookup — URL paste → product lookup ────────────────────────
export function useProductLookup() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // hint is a non-error status message shown under the button (e.g. "Retrying…")
  const [hint, setHint] = useState<string | null>(null)

  const lookup = useCallback(async (url: string): Promise<string | null> => {
    setError(null)
    setHint(null)

    // ── Client-side validation ───────────────────────────────────────────────
    if (!url.trim()) {
      setError('Paste an Amazon product URL to get started.')
      return null
    }

    if (!isValidAmazonUrl(url)) {
      setError('Please paste an Amazon product URL (e.g. amazon.com/dp/...).')
      return null
    }

    // a.co short links don't contain an ASIN — the server resolves the redirect
    const isShortLink = (() => { try { return new URL(url).hostname === 'a.co' } catch { return false } })()
    const asin = extractAsinFromUrl(url)
    if (!isShortLink && !asin) {
      setError("Couldn't find a product in this link. Make sure you're linking to a specific Amazon product page.")
      return null
    }

    // Normalize to canonical form — strips tracking params, locale, mobile paths
    // a.co links are sent as-is; the edge function resolves the redirect server-side
    const canonicalUrl = asin ? `https://www.amazon.com/dp/${asin}` : url.trim()

    setIsLoading(true)
    try {
      const result = await fetchPricesForUrl(canonicalUrl)
      setIsLoading(false)
      setHint(null)
      return result.product_id
    } catch (err) {
      // fetchPricesForUrl already handles 401 retries with token refresh +
      // anon-key fallback internally. If it still throws, it's a real error.
      setIsLoading(false)
      setHint(null)
      const msg = err instanceof Error ? err.message : "We couldn't fetch data right now. Please try again."
      setError(msg)
      return null
    }
  }, [])

  return { lookup, isLoading, error, hint, setError }
}

// ─── useRecentProducts — most recently fetched products for discovery ─────
const DISMISSED_KEY = 'price-radar-dismissed-recents'

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveDismissed(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]))
  } catch { /* storage full — ignore */ }
}

export function useRecentProducts(limit = 6) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allData, setAllData] = useState<any[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(getDismissed)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getRecentProducts(limit)
        if (cancelled) return

        // Enrich with real current prices from price_points
        const ids = (rows ?? []).map((r: any) => r.id) // eslint-disable-line @typescript-eslint/no-explicit-any
        const currentPrices = await getCurrentPricesForProducts(ids).catch(() => [])

        const priceMap = new Map<string, { price: number; retailer: string }>()
        for (const cp of currentPrices) {
          if (!priceMap.has(cp.product_id)) {
            priceMap.set(cp.product_id, {
              price: Number(cp.price),
              retailer: cp.retailer?.name ?? cp.retailer?.slug ?? '',
            })
          }
        }

        // Merge live prices into rows
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enriched = (rows ?? []).map((r: any) => {
          const live = priceMap.get(r.id)
          return {
            ...r,
            live_price: live?.price ?? null,
            live_retailer: live?.retailer ?? null,
          }
        })

        if (!cancelled) { setAllData(enriched); setIsLoading(false) }
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [limit])

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Set(prev)
      next.add(id)
      saveDismissed(next)
      return next
    })
  }, [])

  const data = allData.filter(p => !dismissed.has(p.id))

  return { data, isLoading, dismiss }
}

// ─── usePriceHistory — range-aware history for chart ──────────────────────
export function usePriceHistory(product: ProductWithPricing | null, range: PriceHistoryRange) {
  const rangeDays: Record<PriceHistoryRange, number> = {
    '30d': 30,
    '90d': 90,
    '180d': 180,
    '365d': 365,
  }

  if (!product) return []
  const days = rangeDays[range]
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  return product.price_history.filter(
    p => new Date(p.date) >= cutoff,
  )
}

// ─── useOnlineStatus ──────────────────────────────────────────────────────
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// ─── usePWAInstall ────────────────────────────────────────────────────────
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(
    () => localStorage.getItem('pwa-install-dismissed') === 'true',
  )

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return
    // @ts-ignore
    deferredPrompt.prompt()
    // @ts-ignore
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setDeferredPrompt(null)
  }

  const dismissPrompt = () => {
    setIsDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const shouldShow = !!deferredPrompt && !isInstalled && !isDismissed

  return { shouldShow, promptInstall, dismissPrompt, isInstalled }
}

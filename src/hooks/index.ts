import { useState, useEffect, useCallback } from 'react'
import type { ProductWithPricing, ApiResponse, PriceHistoryRange } from '@/types'
import { isValidAmazonUrl, extractAsinFromUrl } from '@/lib/utils'
import { getProductWithPricing, fetchPricesForUrl, getRecentProducts, getCurrentPricesForProducts, getComparisonPrices, getUserSearchHistory, getProductsByIds, getHotProducts } from '@/services/supabase'
import { useAuthStore } from '@/store'
import { appendAffiliateTag, buildAmazonAffiliateUrl } from '@/lib/affiliate'

// ─── useProduct — fetch product + pricing by ID ────────────────────────────
export function useProduct(productId: string | undefined): ApiResponse<ProductWithPricing> & { isLoadingComparison: boolean } {
  const [data, setData] = useState<ProductWithPricing | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingComparison, setIsLoadingComparison] = useState(false)

  useEffect(() => {
    if (!productId) return
    let cancelled = false

    const fetch = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { product, signal, prices, history } = await getProductWithPricing(productId)

        console.log('STEP 2: Extracted product data from DB:', {
          product: product?.name,
          priceRows: (prices ?? []).map(p => ({ retailer: p.retailer?.slug, price: p.price, captured_at: p.captured_at })),
        })

        if (cancelled) return

        if (!product || !signal) {
          setError("We couldn't find this product. Try a different URL.")
          setIsLoading(false)
          return
        }

        // Deduplicate: keep only the most-recent price row per retailer slug
        // (repeated fetches can leave multiple is_current:true rows per retailer)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const latestBySlug = new Map<string, any>()
        for (const p of (prices ?? [])) {
          const slug = p.retailer.slug
          const existing = latestBySlug.get(slug)
          if (!existing || new Date(p.captured_at) > new Date(existing.captured_at)) {
            latestBySlug.set(slug, p)
          }
        }
        // Re-sort by price ascending so is_best_price marks the cheapest
        const dedupedPrices = Array.from(latestBySlug.values())
          .sort((a, b) => Number(a.price) - Number(b.price))

        // Build Amazon price from DB
        const amazonRow = dedupedPrices.find(p => p.retailer.slug === 'amazon')
        const retailerPrices = amazonRow ? [{
          retailer: amazonRow.retailer,
          price: Number(amazonRow.price),
          product_title: (amazonRow.product_title as string | null) ?? undefined,
          is_available: true,
          affiliate_url: product.asin ? buildAmazonAffiliateUrl(product.asin) : appendAffiliateTag(product.source_url),
          last_updated: amazonRow.captured_at,
          is_best_price: true,
        }] : []

        const mapped: ProductWithPricing = {
          ...product,
          signal,
          retailer_prices: retailerPrices,
          price_history: (history ?? []).map(h => ({
            date: h.captured_at,
            price: Number(h.price),
            retailer_id: h.retailer_id,
          })),
        }
        setData(mapped)
        setIsLoading(false)

        // Fetch live Gemini comparison prices (Walmart + Best Buy) in the background
        setIsLoadingComparison(true)
        getComparisonPrices(product.name)
          .then(results => {
            if (cancelled) return
            console.log('Gemini comparison results:', results)
            setIsLoadingComparison(false)
            const geminiPrices = results
              .filter(r => r.price > 0 && !r.store.toLowerCase().includes('amazon'))
              .map((r) => ({
                retailer: {
                  id: '',
                  name: r.store,
                  slug: r.store.toLowerCase().includes('walmart') ? 'walmart' as const
                    : r.store.toLowerCase().includes('best buy') ? 'bestbuy' as const
                    : 'amazon' as const,
                  logo_url: '',
                  affiliate_url_template: '',
                },
                price: r.price,
                product_title: undefined,
                is_available: true,
                affiliate_url: r.url,
                last_updated: new Date().toISOString(),
                is_best_price: r.is_best_deal,
              }))

            if (geminiPrices.length === 0) return

            setData(prev => {
              if (!prev) return prev
              // Merge: Amazon from DB + Gemini retailers, re-sort by price
              const allPrices = [...prev.retailer_prices, ...geminiPrices]
                .sort((a, b) => a.price - b.price)
              // Mark cheapest as best price
              allPrices.forEach((p, i) => { p.is_best_price = i === 0 })
              return { ...prev, retailer_prices: allPrices }
            })
          })
          .catch(err => {
            if (!cancelled) setIsLoadingComparison(false)
            console.warn('Gemini comparison failed:', err)
          })
      } catch {
        if (cancelled) return
        setError("We couldn't find this product. Try a different URL.")
        setIsLoading(false)
      }
    }

    fetch()
    return () => { cancelled = true }
  }, [productId])

  return { data, error, isLoading, isLoadingComparison }
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
export function useRecentProducts(limit = 6) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allData, setAllData] = useState<any[]>([])
  // Dismissed is session-only (not persisted) so the list always resets on next visit
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    // Clear any old persisted dismissed state left from before this change
    try { localStorage.removeItem('price-radar-dismissed-recents') } catch { /* ignore */ }
    return new Set()
  })
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
        if (cancelled) return

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
      return next
    })
  }, [])

  const data = allData.filter(p => !dismissed.has(p.id))

  return { data, isLoading, dismiss }
}

// ─── usePersonalHistory — personal search history (per-user or per-device) ───
export function usePersonalHistory(limit = 6) {
  const { user, isAuthenticated } = useAuthStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allData, setAllData] = useState<any[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    ;(async () => {
      try {
        if (isAuthenticated && user) {
          // ── Signed-in: read from Supabase search_history ───────────────────
          const rows = await getUserSearchHistory(user.id, limit)
          if (cancelled) return

          const ids = rows.map(r => r.product_id)
          const currentPrices = await getCurrentPricesForProducts(ids).catch(() => [])
          if (cancelled) return

          const priceMap = new Map<string, { price: number; retailer: string }>()
          for (const cp of currentPrices) {
            if (!priceMap.has(cp.product_id)) {
              priceMap.set(cp.product_id, {
                price: Number(cp.price),
                retailer: cp.retailer?.name ?? cp.retailer?.slug ?? '',
              })
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const enriched = rows.map((r: any) => {
            const live = priceMap.get(r.product_id)
            return {
              ...r.product,
              live_price: live?.price ?? null,
              live_retailer: live?.retailer ?? null,
            }
          })

          if (!cancelled) { setAllData(enriched); setIsLoading(false) }
        } else {
          // ── Anonymous: read from localStorage ─────────────────────────────
          const raw = localStorage.getItem('price-radar-history')
          const arr: Array<{ productId: string; checkedAt: string }> = raw ? JSON.parse(raw) : []
          const ids = arr.slice(0, limit).map(e => e.productId)

          if (ids.length === 0) {
            if (!cancelled) { setAllData([]); setIsLoading(false) }
            return
          }

          const products = await getProductsByIds(ids)
          if (cancelled) return

          const currentPrices = await getCurrentPricesForProducts(ids).catch(() => [])
          if (cancelled) return

          const priceMap = new Map<string, { price: number; retailer: string }>()
          for (const cp of currentPrices) {
            if (!priceMap.has(cp.product_id)) {
              priceMap.set(cp.product_id, {
                price: Number(cp.price),
                retailer: cp.retailer?.name ?? cp.retailer?.slug ?? '',
              })
            }
          }

          // Maintain localStorage order (most recently checked first)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const productMap = new Map((products as any[]).map((p: any) => [p.id, p]))
          const enriched = ids
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map(id => productMap.get(id) as any)
            .filter(Boolean)
            .map(p => {
              const live = priceMap.get(p.id)
              return { ...p, live_price: live?.price ?? null, live_retailer: live?.retailer ?? null }
            })

          if (!cancelled) { setAllData(enriched); setIsLoading(false) }
        }
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [isAuthenticated, user?.id, limit])

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const data = allData.filter(p => !dismissed.has(p.id))
  return { data, isLoading, dismiss }
}

// ─── useHotProducts — products most people are watching ───────────────────────
export function useHotProducts(limit = 6) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getHotProducts(limit)
        if (cancelled) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ids = (rows as any[]).map((r: any) => r.id as string)
        const currentPrices = await getCurrentPricesForProducts(ids).catch(() => [])
        if (cancelled) return

        const priceMap = new Map<string, { price: number; retailer: string }>()
        for (const cp of currentPrices) {
          if (!priceMap.has(cp.product_id)) {
            priceMap.set(cp.product_id, {
              price: Number(cp.price),
              retailer: cp.retailer?.name ?? cp.retailer?.slug ?? '',
            })
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enriched = (rows as any[]).map((r: any) => {
          const live = priceMap.get(r.id)
          return { ...r, live_price: live?.price ?? null, live_retailer: live?.retailer ?? null }
        })

        if (!cancelled) { setData(enriched); setIsLoading(false) }
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [limit])

  return { data, isLoading }
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
    // @ts-expect-error BeforeInstallPromptEvent not in TS lib
    deferredPrompt.prompt()
    // @ts-expect-error BeforeInstallPromptEvent not in TS lib
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

export { useDocumentTitle } from './useDocumentTitle'

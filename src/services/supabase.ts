/**
 * services/supabase.ts
 *
 * All Supabase database operations. This is the single source of truth
 * for data access. Swap mock → real by replacing the mock calls in
 * hooks/index.ts to call these functions.
 */

import { supabase } from '@/lib/supabase'

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: { name?: string; email_alerts?: boolean; push_alerts?: boolean }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProductWithPricing(productId: string) {
  // Fetch product
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()

  if (productError) throw productError

  // Fetch signal
  const { data: signal } = await supabase
    .from('price_signals')
    .select('*')
    .eq('product_id', productId)
    .single()

  // Fetch current prices across retailers (include product_url and product_title for AI-matched rows)
  const { data: prices } = await supabase
    .from('price_points')
    .select('*, retailer:retailers(*), product_url, product_title')
    .eq('product_id', productId)
    .eq('is_current', true)
    .order('price', { ascending: true })

  // Fetch price history for chart (90 days)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 365)

  const { data: history } = await supabase
    .from('price_points')
    .select('price, captured_at, retailer_id')
    .eq('product_id', productId)
    .gte('captured_at', ninetyDaysAgo.toISOString())
    .order('captured_at', { ascending: true })

  return { product, signal, prices, history }
}

// ─── Tracked products ─────────────────────────────────────────────────────────

export async function getTrackedProducts(userId: string) {
  const { data, error } = await supabase
    .from('tracked_products')
    .select(`
      *,
      product:products(
        *,
        price_signals (*)
      )
    `)
    .eq('user_id', userId)
    .order('added_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addTrackedProduct(userId: string, productId: string, alertTargetPrice?: number) {
  // Check free tier limit
  const { count } = await supabase
    .from('tracked_products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const profile = await getProfile(userId)
  if (profile.plan === 'free' && (count ?? 0) >= 3) {
    throw new Error('FREE_TIER_LIMIT_REACHED')
  }

  const { data, error } = await supabase
    .from('tracked_products')
    .insert({
      user_id: userId,
      product_id: productId,
      alert_target_price: alertTargetPrice ?? null,
      alert_enabled: !!alertTargetPrice,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeTrackedProduct(trackedId: string, userId: string) {
  const { error } = await supabase
    .from('tracked_products')
    .delete()
    .eq('id', trackedId)
    .eq('user_id', userId) // RLS double-check

  if (error) throw error
}

export async function updateTrackedProductAlert(
  trackedId: string,
  userId: string,
  alertTargetPrice: number | null,
  alertEnabled: boolean,
) {
  const { data, error } = await supabase
    .from('tracked_products')
    .update({
      alert_target_price: alertTargetPrice,
      alert_enabled: alertEnabled,
    })
    .eq('id', trackedId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export async function getSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
  return data
}

// ─── Price lookup (calls Edge Function) ──────────────────────────────────────

// supabase.functions is a GETTER — creates a new FunctionsClient instance on
// every access, so supabase.functions.setAuth() targets a throwaway object.
// Token must be passed explicitly via headers on every invoke call.

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

async function _invoke(url: string, token: string): Promise<{ product_id: string }> {
  const { data, error } = await supabase.functions.invoke('fetch-prices', {
    body: { url },
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!error) return data as { product_id: string }

  // Extract the real error message and HTTP status from the raw Response
  let status = 0
  let msg = error.message ?? 'Request failed'
  if (error.context instanceof Response) {
    status = (error.context as Response).status
    try {
      const body = await (error.context as Response).json()
      msg = body?.error ?? body?.message ?? msg
    } catch { /* body is not JSON */ }
  }

  // Attach status so the caller can decide whether to retry
  const e = new Error(msg) as Error & { status: number }
  e.status = status
  throw e
}

export async function fetchPricesForUrl(url: string): Promise<{ product_id: string }> {
  // ── Attempt 1: fresh session token (or anon key if not logged in) ──────────
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? ANON_KEY

  try {
    return await _invoke(url, token)
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 0

    // Only retry on 401 — any other error is a real failure (Rainforest, DB, etc.)
    if (status !== 401) throw err

    // ── Attempt 2: force a full token refresh, then retry ───────────────────
    console.warn('[fetchPricesForUrl] 401 — forcing session refresh and retrying')
    const { data: { session: fresh } } = await supabase.auth.refreshSession()
    const freshToken = fresh?.access_token ?? ANON_KEY

    try {
      return await _invoke(url, freshToken)
    } catch (retryErr) {
      const retryStatus = (retryErr as Error & { status?: number }).status ?? 0
      if (retryStatus !== 401) throw retryErr

      // ── Attempt 3: fall back to anon key silently (guest mode) ────────────
      console.warn('[fetchPricesForUrl] Refresh failed — falling back to guest mode')
      return await _invoke(url, ANON_KEY)
    }
  }
}

// ─── Live Gemini comparison prices (Walmart + Best Buy, not stored in DB) ────

export interface ComparisonResult {
  store: string
  price: number
  formatted_price: string
  url: string
  is_best_deal: boolean
  confidence_score: 'high' | 'medium' | 'low'
}

export async function getComparisonPrices(productName: string): Promise<ComparisonResult[]> {
  // Always use anon key — logged-in JWT can conflict with this public function
  const { data, error } = await supabase.functions.invoke('compare-prices', {
    body: { product_title: productName, country: 'United States', currency: 'USD' },
    headers: { Authorization: `Bearer ${ANON_KEY}` },
  })
  if (error || !data?.results) return []
  return data.results as ComparisonResult[]
}

// ─── Batch current prices across multiple products ────────────────────────────

export async function getCurrentPricesForProducts(productIds: string[]) {
  if (productIds.length === 0) return []
  const { data } = await supabase
    .from('price_points')
    .select('product_id, price, retailer:retailers(name, slug)')
    .in('product_id', productIds)
    .eq('is_current', true)
    .order('price', { ascending: true })

  // Supabase may return retailer as array (one-to-one join) — normalise to object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any) => ({
    product_id: row.product_id as string,
    price: Number(row.price),
    retailer: (Array.isArray(row.retailer) ? row.retailer[0] : row.retailer) as {
      name: string
      slug: string
    } | null,
  }))
}

// ─── Recent products (for Search page "Popular" section) ─────────────────────

export async function getRecentProducts(limit = 3) {
  const { data, error } = await supabase
    .from('products')
    .select('*, price_signals(*)')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

// ─── Search history (per-user) ────────────────────────────────────────────────

export async function recordSearchHistory(userId: string, productId: string) {
  const { error } = await supabase
    .from('search_history')
    .upsert(
      { user_id: userId, product_id: productId, checked_at: new Date().toISOString() },
      { onConflict: 'user_id,product_id' },
    )

  if (error) throw error
}

export async function getUserSearchHistory(userId: string, limit = 6) {
  const { data, error } = await supabase
    .from('search_history')
    .select('product_id, checked_at, product:products(*, price_signals(*))')
    .eq('user_id', userId)
    .order('checked_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []) as Array<{ product_id: string; checked_at: string; product: any }>
}

export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('products')
    .select('*, price_signals(*)')
    .in('id', ids)

  if (error) throw error
  return data ?? []
}

// ─── Hot products (most-watched, ≥2 watchers) ─────────────────────────────────

export async function getHotProducts(limit = 6) {
  const { data: hotRows, error } = await supabase
    .rpc('get_hot_products', { p_limit: limit })

  if (error) throw error

  let productIds: string[]

  if (hotRows && hotRows.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productIds = (hotRows as any[]).map(r => r.product_id as string)
  } else {
    // Fallback: any tracked products (≥1 watcher) ordered by most-recently added
    const { data: fallbackRows, error: fallbackError } = await supabase
      .from('tracked_products')
      .select('product_id')
      .order('added_at', { ascending: false })
      .limit(limit * 3) // fetch extra to dedupe

    if (fallbackError) throw fallbackError
    if (!fallbackRows || fallbackRows.length === 0) return []

    // Dedupe while preserving order
    const seen = new Set<string>()
    productIds = (fallbackRows as any[]) // eslint-disable-line @typescript-eslint/no-explicit-any
      .map(r => r.product_id as string)
      .filter(id => !seen.has(id) && seen.add(id) !== undefined)
      .slice(0, limit)

    if (productIds.length === 0) return []
  }

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*, price_signals(*)')
    .in('id', productIds)

  if (productsError) throw productsError

  // Return in watcher-count order (productIds is already sorted)
  const productMap = new Map((products ?? []).map(p => [p.id, p]))
  return productIds.map(id => productMap.get(id)).filter(Boolean)
}

// ─── Push Subscriptions ───────────────────────────────────────────────────────

export async function savePushSubscription(
  userId: string,
  subscription: { endpoint: string; p256dh: string; auth: string; user_agent?: string },
) {
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        user_agent: subscription.user_agent ?? null,
      },
      { onConflict: 'endpoint' },
    )

  if (error) throw error
}

export async function deletePushSubscription(userId: string, endpoint: string) {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint)

  if (error) throw error
}

// ─── Stripe helpers ───────────────────────────────────────────────────────────

export async function createCheckoutSession(userId: string, priceId: string) {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { user_id: userId, price_id: priceId },
  })

  if (error) throw error
  return data as { checkout_url: string }
}

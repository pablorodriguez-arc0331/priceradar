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

  // Fetch current prices across retailers
  const { data: prices } = await supabase
    .from('price_points')
    .select('*, retailer:retailers(*)')
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

export async function fetchPricesForUrl(url: string) {
  const { data, error } = await supabase.functions.invoke('fetch-prices', {
    body: { url },
  })

  if (error) throw error
  return data as { product_id: string }
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

// ─── Stripe helpers ───────────────────────────────────────────────────────────

export async function createCheckoutSession(userId: string, priceId: string) {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { user_id: userId, price_id: priceId },
  })

  if (error) throw error
  return data as { checkout_url: string }
}

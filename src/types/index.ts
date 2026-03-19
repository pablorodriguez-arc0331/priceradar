// ─── Domain Types ───────────────────────────────────────────────────────────

export type PriceVerdict = 'low' | 'high' | 'neutral' | 'no_data'
export type UserPlan = 'free' | 'paid'
export type AlertStatus = 'active' | 'triggered' | 'paused'
export type NotificationMethod = 'email' | 'push' | 'both'

// ─── Retailer ────────────────────────────────────────────────────────────────

export interface Retailer {
  id: string
  name: string
  slug: 'amazon' | 'walmart' | 'ebay' | 'bestbuy' | 'target'
  logo_url: string
  affiliate_url_template: string
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  image_url: string
  asin?: string          // Amazon ASIN if from Amazon
  category?: string
  source_url: string     // original URL user submitted
  created_at: string
  updated_at: string
}

// ─── Price Point ──────────────────────────────────────────────────────────────

export interface PricePoint {
  id: string
  product_id: string
  retailer_id: string
  retailer: Retailer
  price: number
  currency: 'USD'
  captured_at: string
  is_current: boolean
}

// ─── Price Signal ─────────────────────────────────────────────────────────────

export interface PriceSignal {
  product_id: string
  verdict: PriceVerdict
  label: string                  // "Price Low" | "Price High" | "Average Price" | "No history yet"
  subtext: string                // "6-month low · Updated 2h ago"
  percentile: number             // 0–100, where the current price sits in historical range
  signal_strength: number        // 0–100
  reference_range_days: number   // 90, 180, 365
  historical_low: number
  historical_high: number
  current_best_price: number
  current_best_retailer: string
  last_checked_at: string
}

// ─── Retailer Price (for comparison table) ───────────────────────────────────

export interface RetailerPrice {
  retailer: Retailer
  price: number
  original_price?: number        // if on sale
  product_title?: string         // retailer-specific product title (from AI matching)
  is_available: boolean
  affiliate_url: string
  last_updated: string
  delta_vs_avg?: number          // percentage vs historical average, e.g. -12 means 12% below avg
  is_best_price: boolean
}

// ─── Product with full pricing data ──────────────────────────────────────────

export interface ProductWithPricing extends Product {
  signal: PriceSignal
  retailer_prices: RetailerPrice[]
  price_history: PriceHistoryPoint[]  // for chart
}

// ─── Price History (for chart) ───────────────────────────────────────────────

export interface PriceHistoryPoint {
  date: string        // ISO date string
  price: number
  retailer_id: string
}

// ─── Tracked Product ─────────────────────────────────────────────────────────

export interface TrackedProduct {
  id: string
  user_id: string
  product_id: string
  product: Product
  signal: PriceSignal
  current_price: number
  current_retailer: string
  alert_target_price?: number
  alert_enabled: boolean
  alert_status: AlertStatus
  added_at: string
  last_checked_at: string
}

// ─── Price Alert ──────────────────────────────────────────────────────────────

export interface PriceAlert {
  id: string
  tracked_product_id: string
  triggered_at: string
  trigger_price: number
  delivery_method: NotificationMethod
  delivered: boolean
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface AppUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  plan: UserPlan
  created_at: string
  tracked_count: number          // current count, max 3 on free
  alert_preferences: {
    email_enabled: boolean
    push_enabled: boolean
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthState {
  user: AppUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration?: number
}

// ─── Filter / UI State ────────────────────────────────────────────────────────

export type DashboardView = 'grid' | 'list'
export type PriceHistoryRange = '30d' | '90d' | '180d' | '365d'

export interface DashboardFilters {
  verdict: PriceVerdict | 'all'
  alertEnabled: boolean | null
}

// ─── React type augmentations ─────────────────────────────────────────────────
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ImgHTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto'
  }
}

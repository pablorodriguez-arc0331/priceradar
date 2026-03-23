import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppUser, Toast, ToastVariant, DashboardView, DashboardFilters } from '@/types'
import { supabase, signOut as supabaseSignOut } from '@/lib/supabase'
import {
  getTrackedProducts,
  addTrackedProduct,
  removeTrackedProduct,
  updateTrackedProductAlert,
  getCurrentPricesForProducts,
} from '@/services/supabase'

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthStore {
  user: AppUser | null
  isLoading: boolean
  isAuthenticated: boolean
  initAuth: () => Promise<void>
  setUser: (user: AppUser | null) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initAuth: async () => {
    try {
      // "Remember me = false" enforcement:
      // If the user signed in without remember-me, auto sign out when the browser session ends.
      // pr_no_remember is in localStorage (survives restarts); pr_alive is in sessionStorage (clears on close).
      const noRemember = localStorage.getItem('pr_no_remember')
      if (noRemember && !sessionStorage.getItem('pr_alive')) {
        await supabase.auth.signOut()
        localStorage.removeItem('pr_no_remember')
        set({ user: null, isAuthenticated: false, isLoading: false })
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Mark this tab as alive so refreshes don't trigger auto sign-out
        if (noRemember) sessionStorage.setItem('pr_alive', '1')
        // Fetch profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        const { count: trackedCount } = await supabase
          .from('tracked_products')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)

        const user: AppUser = {
          id: session.user.id,
          email: session.user.email ?? '',
          name: profile?.name ?? session.user.user_metadata?.full_name ?? 'User',
          avatar_url: profile?.avatar_url ?? session.user.user_metadata?.avatar_url,
          plan: profile?.plan ?? 'free',
          created_at: session.user.created_at,
          tracked_count: trackedCount ?? 0,
          alert_preferences: {
            email_enabled: profile?.email_alerts ?? true,
            push_enabled: profile?.push_alerts ?? false,
          },
        }
        set({ user, isAuthenticated: true, isLoading: false })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        set({ user: null, isAuthenticated: false })
        return
      }

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session.user) {
        // Avoid re-fetching if we already have this user loaded
        if (get().user?.id === session.user.id && get().isAuthenticated) return

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          const { count: trackedCount } = await supabase
            .from('tracked_products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)

          const user: AppUser = {
            id: session.user.id,
            email: session.user.email ?? '',
            name: profile?.name ?? session.user.user_metadata?.full_name ?? 'User',
            avatar_url: profile?.avatar_url ?? session.user.user_metadata?.avatar_url,
            plan: profile?.plan ?? 'free',
            created_at: session.user.created_at,
            tracked_count: trackedCount ?? 0,
            alert_preferences: {
              email_enabled: profile?.email_alerts ?? true,
              push_enabled: profile?.push_alerts ?? false,
            },
          }
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          // Profile table may not exist yet (migration not applied)
          const user: AppUser = {
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.full_name ?? 'User',
            avatar_url: session.user.user_metadata?.avatar_url,
            plan: 'free',
            created_at: session.user.created_at,
            tracked_count: 0,
            alert_preferences: { email_enabled: true, push_enabled: false },
          }
          set({ user, isAuthenticated: true, isLoading: false })
        }
      }
    })
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  signOut: async () => {
    localStorage.removeItem('pr_no_remember')
    sessionStorage.removeItem('pr_alive')
    await supabaseSignOut()
    set({ user: null, isAuthenticated: false })
  },
}))

// ─── Toast Store ──────────────────────────────────────────────────────────────
interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  toast: (variant: ToastVariant, title: string, description?: string, action?: Toast['action']) => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2)
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }))
    setTimeout(() => get().removeToast(id), toast.duration ?? 4000)
  },
  removeToast: (id) =>
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
  toast: (variant, title, description, action) => {
    get().addToast({ variant, title, description, action })
  },
}))

// Convenient hook
export const useToast = () => useToastStore(s => s.toast)
export type ToastFn = (variant: ToastVariant, title: string, description?: string, action?: Toast['action']) => void

// ─── UI State Store (persisted) ────────────────────────────────────────────────
interface UIStore {
  dashboardView: DashboardView
  dashboardFilters: DashboardFilters
  installPromptEvent: Event | null
  isOnline: boolean
  setDashboardView: (view: DashboardView) => void
  setDashboardFilter: (key: keyof DashboardFilters, value: DashboardFilters[keyof DashboardFilters]) => void
  setInstallPromptEvent: (event: Event | null) => void
  setIsOnline: (online: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      dashboardView: 'grid',
      dashboardFilters: { verdict: 'all', alertEnabled: null },
      installPromptEvent: null,
      isOnline: navigator.onLine,
      setDashboardView: (view) => set({ dashboardView: view }),
      setDashboardFilter: (key, value) =>
        set(state => ({ dashboardFilters: { ...state.dashboardFilters, [key]: value } })),
      setInstallPromptEvent: (event) => set({ installPromptEvent: event }),
      setIsOnline: (isOnline) => set({ isOnline }),
    }),
    {
      name: 'price-radar-ui',
      partialize: (state) => ({ dashboardView: state.dashboardView }),
    },
  ),
)

// ─── Tracked Products Store ────────────────────────────────────────────────────
import type { TrackedProduct } from '@/types'

interface TrackedStore {
  trackedProducts: TrackedProduct[]
  isLoading: boolean
  fetchTracked: (userId: string) => Promise<void>
  addTracked: (userId: string, optimistic: TrackedProduct) => Promise<void>
  removeTracked: (id: string, userId: string) => Promise<void>
  updateAlert: (id: string, userId: string, targetPrice: number | undefined, enabled: boolean) => void
}

export const useTrackedStore = create<TrackedStore>((set, get) => ({
  trackedProducts: [],
  isLoading: false,

  fetchTracked: async (userId: string) => {
    set({ isLoading: true })
    try {
      const data = await getTrackedProducts(userId)
      const rows = data ?? []

      // Batch-fetch real current prices from price_points — more reliable
      // than price_signals.current_best_price which may lag or be 0
      const productIds = rows.map((r: any) => r.product_id) // eslint-disable-line @typescript-eslint/no-explicit-any
      const currentPrices = await getCurrentPricesForProducts(productIds).catch(() => [])

      // Build cheapest-price map: productId → { price, retailerName }
      const priceMap = new Map<string, { price: number; retailer: string }>()
      for (const cp of currentPrices) {
        if (!priceMap.has(cp.product_id)) {
          // Already sorted price ASC — first entry is cheapest
          priceMap.set(cp.product_id, {
            price: Number(cp.price),
            retailer: cp.retailer?.name ?? cp.retailer?.slug ?? '',
          })
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: TrackedProduct[] = rows.map((row: any) => {
        const sig = row.product?.price_signals?.[0]
        const live = priceMap.get(row.product_id)

        const fallbackPrice = live?.price ?? 0
        const fallbackSignal: TrackedProduct['signal'] = {
          product_id: row.product_id,
          verdict: 'no_data',
          label: live ? 'Tracked' : 'No data',
          subtext: '',
          percentile: 50,
          signal_strength: 0,
          reference_range_days: 90,
          // Use actual price so StatsGrid never divides by zero
          historical_low: fallbackPrice,
          historical_high: fallbackPrice,
          current_best_price: fallbackPrice,
          current_best_retailer: live?.retailer ?? '',
          last_checked_at: row.last_checked_at ?? new Date().toISOString(),
        }

        return {
          id: row.id,
          user_id: row.user_id,
          product_id: row.product_id,
          product: row.product,
          signal: sig ?? fallbackSignal,
          // Prefer live price_points price over stale signal price
          current_price: live?.price ?? Number(sig?.current_best_price ?? 0),
          current_retailer: live?.retailer ?? sig?.current_best_retailer ?? '',
          alert_target_price: row.alert_target_price ? Number(row.alert_target_price) : undefined,
          alert_enabled: row.alert_enabled,
          alert_status: row.alert_status,
          added_at: row.added_at,
          last_checked_at: row.last_checked_at,
        }
      })
      set({ trackedProducts: mapped, isLoading: false })
    } catch {
      set({ trackedProducts: [], isLoading: false })
    }
  },

  addTracked: async (userId, optimistic) => {
    set(state => ({ trackedProducts: [...state.trackedProducts, optimistic] }))
    try {
      await addTrackedProduct(userId, optimistic.product_id)
    } catch {
      // Rollback on failure
      set(state => ({
        trackedProducts: state.trackedProducts.filter(t => t.id !== optimistic.id),
      }))
      throw new Error('Failed to track product. Please try again.')
    }
  },

  removeTracked: async (id, userId) => {
    const prev = get().trackedProducts
    set(state => ({ trackedProducts: state.trackedProducts.filter(t => t.id !== id) }))
    try {
      await removeTrackedProduct(id, userId)
    } catch {
      set({ trackedProducts: prev })
      throw new Error('Failed to remove product. Please try again.')
    }
  },

  updateAlert: (id, userId, targetPrice, enabled) => {
    set(state => ({
      trackedProducts: state.trackedProducts.map(t =>
        t.id === id
          ? { ...t, alert_target_price: targetPrice, alert_enabled: enabled }
          : t,
      ),
    }))
    // Fire-and-forget — optimistic, no rollback needed for alert toggle
    updateTrackedProductAlert(id, userId, targetPrice ?? null, enabled).catch(console.error)
  },
}))

// ─── Theme Store — light only ───────────────────────────────────────────────────
type Theme = 'light'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
  setSystemTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(() => ({
  theme: 'light' as const,
  toggleTheme: () => {},
  setSystemTheme: () => {},
}))

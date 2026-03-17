# Price Radar — Claude Code Context Prompt

You are working on **Price Radar**, a Progressive Web App (PWA) that tracks product prices across major US e-commerce retailers (Amazon, Walmart, eBay, Best Buy, Target) and tells users whether a product's current price is historically high or low.

---

## Product Overview

**Business model:** B2C Freemium SaaS + Amazon affiliate commissions (MVP monetization).

**User tiers:**
- **Guest** — can browse and see the high/low price signal. Cannot track or set alerts.
- **Free (auth)** — can track up to 3 products + receive email price alerts.
- **Paid ($4.99/mo)** — full 1-year price history chart + unlimited tracking.

**Core user job:** "I just want to know if now is a good time to buy this — yes or no."

**Target:** US shoppers, mobile-first (375px baseline). PWA, no browser extension needed.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Icons | Lucide React only — no inline SVGs |
| Charts | Recharts |
| State | Zustand |
| Backend/DB | Supabase (PostgreSQL + Auth + Edge Functions) |
| Payments | Stripe (not yet integrated) |
| PWA | vite-plugin-pwa (Workbox) |

**Path alias:** `@/` maps to `src/`

---

## Current Project State

### ✅ COMPLETE — Do not rebuild these

**Configuration**
- `package.json` — all deps declared (React, Supabase, Framer Motion, Recharts, Zustand, shadcn/ui, vite-plugin-pwa)
- `vite.config.ts` — PWA plugin configured, path aliases, manual chunk splitting, Workbox caching strategies
- `tailwind.config.ts` — full design system tokens: signal colors (`signal-low`, `signal-high`, `signal-neutral`), accent, semantic vars
- `tsconfig.json` — strict TypeScript with `@/` path alias
- `postcss.config.js`, `index.html` (PWA meta tags), `public/manifest.json`

**Types** (`src/types/index.ts`)
- Complete domain types: `Product`, `PricePoint`, `PriceSignal`, `RetailerPrice`, `ProductWithPricing`, `PriceHistoryPoint`, `TrackedProduct`, `PriceAlert`, `AppUser`, `Toast`, `PriceVerdict`, `UserPlan`, etc.

**Design System** (`src/index.css`, `tailwind.config.ts`)
- CSS custom properties for all tokens
- `dvh` full-height fix for iOS Safari
- `pb-nav`, `h-nav`, `pb-safe` utility classes for PWA safe-area
- `.skeleton` animation class
- `.price` class for `tabular-nums` on all monetary values
- Skip-to-content link
- Universal `:focus-visible` ring

**Utilities** (`src/lib/utils.ts`)
- `cn()` — clsx + tailwind-merge
- `formatPrice()`, `formatPriceDelta()`, `formatRelativeTime()`
- `SIGNAL_CONFIG` — maps `PriceVerdict` → Tailwind classes for bg/text/border
- `isValidProductUrl()`, `detectRetailerFromUrl()`
- `isAtTrackingLimit()`, `FREE_TIER_LIMIT = 3`

**Supabase** (`src/lib/supabase.ts`)
- Client configured with `localStorage` session persistence
- `signInWithGoogle()`, `signInWithEmail()`, `signUpWithEmail()`, `signOut()`

**Mock Data** (`src/data/mock.ts`)
- 4 realistic products: Sony headphones (low signal), AirPods Pro (high), Instant Pot (neutral), LG OLED TV (low)
- Each has full `retailer_prices[]`, `price_history[]` (generated), and `PriceSignal`
- `MOCK_USER` — free plan, 2 tracked products
- `MOCK_TRACKED_PRODUCTS[]` — 2 items pre-tracked
- `getProductById()`, `searchProducts()`, `delay()` helpers

**State** (`src/store/index.ts`)
- `useAuthStore` — user, isLoading, isAuthenticated, initAuth, signOut, `toggleMockAuth()` (dev shortcut)
- `useToastStore` + `useToast()` hook — add/remove toasts with auto-dismiss
- `useUIStore` (persisted) — dashboardView (grid/list), dashboardFilters, installPromptEvent, isOnline
- `useTrackedStore` — trackedProducts[], fetchTracked, addTracked, removeTracked, updateAlert

**Hooks** (`src/hooks/index.ts`)
- `useProduct(productId)` — fetches from mock with 1s delay, returns `ApiResponse<ProductWithPricing>`
- `useProductLookup()` — URL validation + mock lookup, returns product ID
- `usePriceHistory(product, range)` — filters history by range (30d/90d/180d/365d)
- `useOnlineStatus()` — listens to online/offline events
- `usePWAInstall()` — captures `beforeinstallprompt`, exposes `promptInstall`, `dismissPrompt`, `shouldShow`

**Services** (`src/services/supabase.ts`)
- All DB operations defined but currently unused (hooks use mock data)
- `getProfile`, `updateProfile`, `getProductWithPricing`, `getTrackedProducts`, `addTrackedProduct`, `removeTrackedProduct`, `updateTrackedProductAlert`, `getSubscription`, `fetchPricesForUrl`, `createCheckoutSession`

**Database** (`supabase/migrations/0001_initial_schema.sql`)
- Tables: `retailers` (seeded), `products`, `price_points`, `price_signals`, `profiles`, `subscriptions`, `tracked_products`, `price_alerts`
- RLS enabled on all tables with per-user policies
- Auto-profile creation trigger on `auth.users` insert
- `set_current_price` trigger to manage `is_current` flag on price_points
- Indexes on all high-query columns

**Components — all built, all have skeleton states**
- `src/components/ui/Button.tsx` — all variants (primary/secondary/outline/ghost/destructive/link), sizes, loading spinner, Framer Motion tap feedback
- `src/components/ui/Input.tsx` — label, error, hint, leftIcon, rightElement, full ARIA
- `src/components/ui/Toast.tsx` — AnimatePresence, 4 variants (success/error/info/warning), `ToastContainer`
- `src/components/layout/index.tsx` — `Header`, `BottomNav` (with animated `layoutId` active indicator), `Page` wrapper (motion page transition)
- `src/components/product/SignalBadge.tsx` — hero/default/inline sizes, verdict→color/icon mapping, animated, skeleton
- `src/components/product/URLSearchInput.tsx` — paste-to-auto-submit, clear button, loading state, error state, ARIA
- `src/components/product/PriceComparisonTable.tsx` — stagger animation, retailer logos, delta badges, affiliate links with `rel="noopener noreferrer sponsored"`, skeleton
- `src/components/product/PriceHistoryChart.tsx` — Recharts line chart, range selector with `layoutId` animation, paywall blur overlay, legend, skeletons
- `src/components/dashboard/TrackedProductCard.tsx` — grid and list layout variants, remove/alert toggle with optimistic UI, skeletons
- `src/components/common/index.tsx` — `EmptyState` (4 variants), `AlertSetupSheet` (bottom drawer with Framer Motion), `OfflineBanner`, `InstallBanner`, `SectionHeading`

**Pages — all built**
- `src/pages/LandingPage.tsx` — hero + URL input (large), sample product card, how-it-works steps, trust signals, InstallBanner
- `src/pages/SearchPage.tsx` — URLSearchInput, supported retailers, trending products list
- `src/pages/ProductResultPage.tsx` — product header, SignalBadge hero, price stats grid, PriceComparisonTable, PriceHistoryChart (blurred for non-paid), track/alert CTAs, guest nudge, limit nudge, AlertSetupSheet
- `src/pages/DashboardPage.tsx` — watchlist with grid/list toggle, VerdictFilter chips, stagger animation, refresh, upgrade nudge at limit
- `src/pages/AuthPage.tsx` — Google OAuth button + email/password form, animated tab switcher (sign in/sign up), show/hide password, dev mock auth shortcut
- `src/pages/UpgradeAndSettingsPages.tsx` — `UpgradePage` (pricing card, feature comparison table), `SettingsPage` (profile card, subscription, notifications, sign out)
- `src/App.tsx` — BrowserRouter, lazy-loaded routes, `RequireAuth` guard, `AnimatePresence` page transitions, `AuthCallback` for OAuth redirect

**Edge Function stub** (`supabase/functions/fetch-prices/index.ts`)
- Deno + Supabase client
- URL → retailer detection → product upsert → price_point insert → signal upsert
- `getMockPriceData()` placeholder where real API call goes

---

## Design System Rules (enforce in all new code)

**Colors — semantic tokens only, never hardcoded hex:**
```tsx
// ✅
className="bg-signal-low-bg text-signal-low border-signal-low-border"
className="bg-accent text-accent-foreground hover:bg-accent-hover"
className="bg-background text-foreground border-border"
// ❌
className="bg-[#16A34A] text-[#2563EB]"
```

**Spacing — multiples of 4 only:** `gap-2`, `gap-4`, `gap-6`, `gap-8`. Never `gap-3`, `gap-5`.

**Touch targets:** All interactive elements `min-h-[44px] min-w-[44px]` on mobile.

**Price values:** Always use `.price` class (`tabular-nums`) or `font-variant-numeric: tabular-nums`.

**Icons:** Lucide React only. Decorative icons get `aria-hidden="true"`. Functional icon-only buttons get `aria-label`.

**Framer Motion rules:**
- Button feedback: `whileTap={{ scale: 0.97 }}` + `transition={{ type: 'spring', stiffness: 400, damping: 20 }}`
- Conditional renders: always wrap in `AnimatePresence`, always include `key` and `exit` on direct child
- Page transitions: `type: 'tween', ease: 'easeInOut', duration: 0.25`
- Lists: stagger with `staggerChildren: 0.07`
- Never animate `width`, `height`, `color` — only `transform` and `opacity`
- Always `useReducedMotion()` for accessibility

**Accessibility:**
- One `<h1>` per page
- `<button>` for actions, `<a>` for navigation — never `<div onClick>`
- All inputs: `<label>` with `htmlFor`, errors with `role="alert"` + `aria-describedby`
- Loading: `role="status"` + `aria-live="polite"`
- Skeletons: `aria-busy="true"` on container

**PWA safe-area:**
```tsx
// Page content bottom padding (above bottom nav)
className="pb-[calc(4rem+env(safe-area-inset-bottom,0px)+1rem)]"
// Bottom nav height
style={{ height: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
// Full height (never 100vh)
className="min-h-[100dvh]"
```

---

## What Does NOT Exist Yet (Pending Work)

### 🔴 P0 — Blocks real usage

**1. Real price data API connection**
The entire `supabase/functions/fetch-prices/index.ts` has a `getMockPriceData()` stub where the real API call goes. Need to:
- Choose provider: Keepa API (Amazon, ~$20/mo, best for MVP), Rainforest API, or RapidAPI aggregator
- Implement `fetchFromProvider(url)` in the Edge Function
- Store `PRICE_API_KEY` as Supabase secret (`supabase secrets set PRICE_API_KEY=...`)
- Wire `src/hooks/index.ts` → `useProductLookup` → call `fetchPricesForUrl()` from `src/services/supabase.ts` instead of mock

**2. Real data wiring in hooks**
All hooks currently use mock data. Swap points are clearly marked:
- `src/hooks/index.ts` → `useProduct()`: replace `getProductById()` with `getProductWithPricing()` from services
- `src/hooks/index.ts` → `useProductLookup()`: replace mock return with `fetchPricesForUrl()` call
- `src/store/index.ts` → `useTrackedStore.fetchTracked()`: replace `MOCK_TRACKED_PRODUCTS` with `getTrackedProducts(userId)`
- `src/store/index.ts` → `useTrackedStore.addTracked()`: call `addTrackedProduct()` from services
- `src/store/index.ts` → `useTrackedStore.removeTracked()`: call `removeTrackedProduct()` from services

**3. Supabase project setup**
- Create Supabase project
- Add `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Run `supabase db push` to apply migration
- Enable Google OAuth in Supabase dashboard (Authentication → Providers → Google)
- Add `http://localhost:5173/auth/callback` to allowed redirect URLs

### 🟡 P1 — Required before launch

**4. Stripe integration**
- `UpgradePage` has a placeholder `toast('info', 'Coming soon')` on the upgrade button
- Need: `supabase/functions/create-checkout/index.ts` Edge Function that creates a Stripe checkout session
- Need: `supabase/functions/stripe-webhook/index.ts` that handles `customer.subscription.created/updated/deleted` → updates `subscriptions` table + `profiles.plan`
- Frontend: replace toast in `UpgradePage` with `createCheckoutSession()` call + redirect to Stripe URL

**5. PWA icons**
- `public/icons/` directory is empty — all icon sizes referenced in `manifest.json` need to be generated
- Need: icon-72, 96, 128, 144, 152, 192, 192m (maskable), 384, 512, 512m (maskable)
- Tool: use [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) or Figma export
- Maskable icons need artwork within the center 80% of canvas

**6. Email alert delivery**
- `price_alerts` table exists and stores triggered alerts
- No delivery mechanism exists yet
- Need: `supabase/functions/send-alerts/index.ts` — scheduled function that checks `tracked_products` where `alert_enabled = true`, compares current price vs `alert_target_price`, inserts `price_alerts` record, sends email via Resend/Postmark/SendGrid
- Need: schedule this function via `pg_cron` or Supabase Cron (daily or hourly depending on plan)

**7. Price refresh for tracked products**
- Tracked products never get their prices updated
- Need: `supabase/functions/refresh-tracked/index.ts` — fetches fresh price data for all products in `tracked_products`, updates `price_points` and `price_signals`
- Need: schedule via Supabase Cron (every 6 hours for free tier, hourly for paid)

### 🟢 P2 — Polish and completeness

**8. `tracked_count` sync**
`AppUser.tracked_count` is hardcoded to `0` in `useAuthStore.initAuth()`. Should query `count(*)` from `tracked_products` where `user_id = userId` and expose it for the free tier limit check.

**9. ProductResultPage AlertSetupSheet wiring**
The `AlertSetupSheet` only renders if `existingTracked` exists (product already tracked). Flow should be: track product → alert sheet opens automatically. Currently user has to press the Bell icon manually after tracking.

**10. Auth callback complete wiring**
`AuthCallback` in `App.tsx` calls `initAuth()` then navigates to `/dashboard`. But it doesn't restore the original `returnTo` path stored in location state before the OAuth redirect. Need to read `returnTo` from `localStorage` before redirect and restore after OAuth returns.

**11. Search page full-text search**
`SearchPage` currently shows static trending products. The URL input works but keyword search (non-URL queries) just runs `searchProducts()` from mock. Need backend text search — either Supabase full-text search on `products.name` or a search API.

**12. `fetchPriority` TypeScript attribute**
`ProductResultPage` uses `fetchPriority="high"` on the product image. This is a valid HTML attribute but TypeScript may flag it. Add `declare module 'react' { interface ImgHTMLAttributes<T> { fetchPriority?: 'high' | 'low' | 'auto' } }` to `src/types/index.ts` or a separate `src/types/global.d.ts`.

**13. Error boundary**
No React error boundary exists. Add one wrapping `<AppShell>` in `App.tsx` to prevent full app crashes from component errors.

**14. `supabase/functions` local dev**
Add `supabase/functions/.env` with `PRICE_API_KEY` for local function testing. Add to `.gitignore` (already present).

---

## File Reference Map

When working on a feature, here's where everything lives:

| What you need | Where it is |
|---|---|
| Add a new page | `src/pages/` + add route in `src/App.tsx` |
| Add a component | `src/components/{category}/` |
| Add a DB operation | `src/services/supabase.ts` |
| Add a hook | `src/hooks/index.ts` |
| Add a store action | `src/store/index.ts` |
| Change design tokens | `tailwind.config.ts` + `src/index.css` |
| Add a global type | `src/types/index.ts` |
| Add mock product | `src/data/mock.ts` → `MOCK_PRODUCTS` array |
| Add an Edge Function | `supabase/functions/{name}/index.ts` |
| Change DB schema | New file: `supabase/migrations/000X_description.sql` |

---

## Known Issues in Current Code

1. **`store/index.ts` bottom of file** — imports `TrackedProduct` and `MOCK_TRACKED_PRODUCTS` inline inside the file after the UI store. This works but is non-standard. If refactoring, move all imports to the top.

2. **`DashboardPage.tsx`** — `useEffect` for `fetchTracked` depends on `user?.id` but the ESLint exhaustive-deps rule will flag the hook. Add `// eslint-disable-next-line react-hooks/exhaustive-deps` or refactor.

3. **`App.tsx` AuthCallback** — the `useEffect` dep array is empty (`[]`) intentionally (runs once on mount). Will get ESLint warning. Add disable comment.

4. **`PriceHistoryChart.tsx` Recharts** — `CustomTooltip` receives `active`, `payload`, `label` as `any`. Add proper Recharts `TooltipProps` typing from `recharts`.

5. **`ProductResultPage.tsx`** — `fetchPriority` attribute on `<img>` will throw TypeScript error. Fix with global type declaration (see P2 item 12 above).

---

## Conventions to Follow

```tsx
// Component file structure — always in this order:
// 1. Imports
// 2. Interface/type definitions
// 3. Constants (config maps, variants)
// 4. Main exported component
// 5. Sub-components
// 6. Skeleton component (export named *Skeleton)

// Naming
// Components: PascalCase
// Hooks: camelCase prefixed with 'use'
// Store slices: camelCase prefixed with 'use' + 'Store'
// Services: camelCase function names
// Types: PascalCase interfaces, camelCase for primitive aliases

// Toast feedback pattern — always use useToast():
const toast = useToast()
toast('success', 'Title', 'Optional description')
toast('error', 'Something went wrong', errorMessage)

// Loading states — always show skeleton, never null or spinner over content
if (isLoading) return <ComponentSkeleton />
if (error) return <EmptyState variant="error" ... />
if (!data) return <EmptyState variant="dashboard" ... />
return <ComponentIdeal data={data} />
```

---

## Priority Order for Next Session

1. **Fix TypeScript errors** — `fetchPriority` attribute, Recharts tooltip types, ESLint warnings
2. **Connect Supabase** — create project, run migration, configure Google OAuth
3. **Wire real data** — replace mock calls in hooks and store with service functions
4. **Price API** — implement Keepa or Rainforest in the Edge Function
5. **Stripe** — create-checkout Edge Function + webhook handler
6. **Email alerts** — send-alerts Edge Function + cron schedule
7. **PWA icons** — generate all sizes and add to `public/icons/`
8. **Price refresh cron** — refresh-tracked Edge Function + schedule

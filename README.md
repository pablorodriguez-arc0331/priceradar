# Price Radar

> Is this price actually a good deal? — Multi-retailer price tracking PWA.

Track prices across Amazon, Walmart, eBay, Best Buy, and Target. See whether a product's current price is historically high or low — instantly, with no browser extension needed.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| State | Zustand |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Payments | Stripe (subscription billing) |
| PWA | vite-plugin-pwa (Workbox) |

## Project Structure

```
src/
├── components/
│   ├── common/         # EmptyState, AlertSetupSheet, OfflineBanner, InstallBanner
│   ├── dashboard/      # TrackedProductCard
│   ├── layout/         # Header, BottomNav, Page wrapper
│   ├── product/        # SignalBadge, PriceComparisonTable, PriceHistoryChart, URLSearchInput
│   └── ui/             # Button, Input, Toast (design system primitives)
├── data/
│   └── mock.ts         # Mock products, users, tracked items for development
├── hooks/
│   └── index.ts        # useProduct, useProductLookup, usePWAInstall, useOnlineStatus
├── lib/
│   ├── supabase.ts     # Supabase client + auth helpers
│   └── utils.ts        # cn(), formatPrice(), SIGNAL_CONFIG, URL validation
├── pages/
│   ├── LandingPage.tsx
│   ├── SearchPage.tsx
│   ├── ProductResultPage.tsx
│   ├── DashboardPage.tsx
│   ├── AuthPage.tsx
│   └── UpgradeAndSettingsPages.tsx
├── services/
│   └── supabase.ts     # All DB operations (swap mock → real here)
├── store/
│   └── index.ts        # AuthStore, ToastStore, UIStore, TrackedStore
└── types/
    └── index.ts        # Full TypeScript domain types
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your Supabase keys
cp .env.example .env

# 3. Run DB migrations (requires Supabase CLI)
supabase db push

# 4. Start dev server
npm run dev
```

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Development with Mock Data

The app ships with complete mock data. All screens work immediately without Supabase:

- 4 mock products with realistic price signals, history, and retailer prices
- Mock user with free plan (ID: `u1`)
- 2 mock tracked products in dashboard
- **Dev shortcut:** On the auth page, click "[DEV] Sign in as mock user"

To switch to real Supabase data, update the `fetch*` functions in `src/hooks/index.ts` to call `src/services/supabase.ts` instead of `src/data/mock.ts`.

## Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page with URL input |
| `/search` | Public | Dedicated search/paste page |
| `/product/:id` | Public | Product result with signal + price table |
| `/auth` | Guest only | Sign in / Sign up |
| `/dashboard` | Auth required | Tracked products watchlist |
| `/upgrade` | Public | Paywall / pricing page |
| `/settings` | Auth required | Account + subscription |

## Price Data API

The `supabase/functions/fetch-prices/` Edge Function is a stub ready for your chosen provider:

- **[Keepa API](https://keepa.com/#!api)** — Amazon history, ~$20/mo, most reliable for Amazon
- **[Rainforest API](https://www.rainforestapi.com/)** — Real-time Amazon data
- **[RapidAPI](https://rapidapi.com/)** — Multi-retailer aggregators

Replace `getMockPriceData()` in the Edge Function with a real API call.

## PWA

- Service worker configured with Workbox (via `vite-plugin-pwa`)
- Caching strategy: CacheFirst for assets, NetworkFirst for price data
- Install prompt: shown after first successful product lookup
- iOS safe-area handled via `env(safe-area-inset-bottom)`

## Deployment

```bash
# Build
npm run build

# Deploy to Vercel (recommended)
vercel --prod

# Deploy Supabase Edge Functions
supabase functions deploy fetch-prices
```

**Required hosting config:** All routes must return `index.html` (SPA routing). Vercel handles this automatically.

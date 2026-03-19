# PriceRadar UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current blue/light UI with a futuristic deep-navy + electric-cyan dark design using Space Grotesk + DM Sans typography and medium glassmorphism across all pages, with full WCAG compliance and SEO improvements.

**Architecture:** Always-dark design (no light/dark toggle) — CSS custom properties in `index.css` are the single source of truth for all color tokens. Tailwind maps to those tokens. All pages auto-inherit the new palette via token updates; only components with hardcoded inline styles (GlassBackground, PriceComparisonTable retailer logos) need explicit color edits. Typography is split: Space Grotesk (`font-display`) for headings/prices/stats, DM Sans (`font-sans`) for everything else.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS v3 + Framer Motion + CVA (class-variance-authority)

**Verification method:** This project has no automated test suite. Each task verifies via TypeScript compilation (`npx tsc --noEmit`) and the final task runs a full build (`npm run build`) plus Playwright screenshot check.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/index.css` | Modify | All CSS design tokens, glass styles, font utilities, reduced-motion |
| `tailwind.config.ts` | Modify | Font families, color token aliases, remove darkMode |
| `index.html` | Modify | Font preloads (Space Grotesk + DM Sans), JSON-LD structured data, updated theme-color |
| `public/robots.txt` | Create | SEO crawler rules |
| `public/sitemap.xml` | Create | Public-route sitemap |
| `src/hooks/useDocumentTitle.ts` | Create | Per-route `<title>` management |
| `src/hooks/index.ts` | Modify | Export useDocumentTitle |
| `src/components/common/GlassBackground.tsx` | Modify | Blob colors updated to cyan + violet on navy |
| `src/components/layout/index.tsx` | Modify | Header logo Space Grotesk, BottomNav active glow, glass tokens |
| `src/components/ui/Button.tsx` | Modify | Primary variant gets cyan glow, min-height 44px enforced |
| `src/components/product/SignalBadge.tsx` | Modify | Label in `font-display`, hero badge glow |
| `src/components/product/PriceComparisonTable.tsx` | Modify | Table glass panel, price in `font-display`, retailer logo colors |
| `src/pages/LandingPage.tsx` | Modify | Hero typography, step cards, trust card |
| `src/pages/SearchPage.tsx` | Modify | `h1` font, recent-card treatment, hint card |
| `src/pages/ProductResultPage.tsx` | Modify | Signal hero, stats grid `font-display`, CTA buttons |
| `src/pages/DashboardPage.tsx` | Modify | Filter pills, view toggle, card list |
| `src/pages/UpgradeAndSettingsPages.tsx` | Modify | useDocumentTitle calls only |
| `public/manifest.json` | Modify | theme_color + background_color |

---

## Task 1: Design System Foundation — CSS Tokens

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace all CSS custom properties**

Replace the entire `:root` block and the `@media (prefers-color-scheme: dark)` block with a single always-dark token set:

```css
/* ─── Google Fonts ─── */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─── Design Tokens (PriceRadar — always dark) ─── */
@layer base {
  :root {
    /* Core surfaces */
    --background:          220 60% 6%;     /* #050D1A deep navy */
    --surface:             220 55% 10%;    /* #0A1628 card surface */
    --surface-raised:      220 50% 13%;    /* #0D1E36 elevated */

    --foreground:          220 40% 95%;    /* #F0F4FF cool near-white */
    --card:                220 55% 10%;
    --card-foreground:     220 40% 95%;
    --popover:             220 55% 10%;
    --popover-foreground:  220 40% 95%;

    /* Accent — electric cyan */
    --primary:             190 96% 43%;    /* #06B6D4 */
    --primary-foreground:  220 60% 6%;
    --accent:              190 96% 43%;    /* #06B6D4 */
    --accent-foreground:   220 60% 6%;
    --accent-subtle:       190 96% 43% / 0.10;
    --accent-hover:        190 80% 55%;    /* #22D3EE */

    --secondary:           220 40% 18%;
    --secondary-foreground: 220 40% 95%;

    --muted:               220 40% 18%;
    --muted-foreground:    220 20% 50%;    /* #6B7FA3 */

    --destructive:         345 80% 60%;    /* #F43F5E rose */
    --destructive-foreground: 0 0% 100%;

    /* Borders — hairline cyan-tinted */
    --border:              190 96% 43% / 0.12;
    --border-strong:       190 96% 43% / 0.24;
    --input:               190 96% 43% / 0.12;
    --ring:                190 96% 43%;

    --radius: 0.75rem;

    /* Signal colors */
    --signal-low:            160 70% 45%;   /* #10B981 emerald */
    --signal-low-bg:         160 70% 45% / 0.12;
    --signal-low-border:     160 70% 45% / 0.30;
    --signal-high:           345 80% 60%;   /* #F43F5E rose */
    --signal-high-bg:        345 80% 60% / 0.12;
    --signal-high-border:    345 80% 60% / 0.30;
    --signal-neutral:        220 20% 50%;   /* #6B7FA3 */
    --signal-neutral-bg:     220 20% 50% / 0.12;
    --signal-neutral-border: 220 20% 50% / 0.25;

    /* PWA layout */
    --nav-height: 4rem;
    --header-height: 3.5rem;
    --page-bottom-pad: calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 1rem);

    /* Glass tokens — medium intensity */
    --glass-bg:     rgba(10, 22, 40, 0.65);
    --glass-border: rgba(6, 182, 212, 0.12);
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(6, 182, 212, 0.08);
  }

  * { @apply border-border; }

  html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }

  body {
    @apply bg-background text-foreground antialiased;
    font-family: 'DM Sans', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #050D1A;
  }

  .full-height { min-height: 100dvh; }

  /* Tabular numbers for prices */
  .price {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum";
    font-family: 'Space Grotesk', system-ui, sans-serif;
  }

  /* Display font — Space Grotesk */
  .font-display {
    font-family: 'Space Grotesk', system-ui, sans-serif;
  }

  /* Skip-to-content */
  .skip-to-content {
    @apply absolute left-4 top-4 z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-0 focus:opacity-100 focus:outline-none;
    transform: translateY(-100%);
  }
  .skip-to-content:focus { transform: translateY(0); }

  /* Focus ring */
  :focus-visible {
    @apply outline-none ring-2 ring-ring ring-offset-2;
    --tw-ring-offset-color: #050D1A;
  }
}

/* ─── PWA Safe Area ─── */
@layer utilities {
  .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
  .pb-nav  { padding-bottom: var(--page-bottom-pad); }
  .h-nav   { height: calc(var(--nav-height) + env(safe-area-inset-bottom, 0px)); }
  .touch-action-manipulation { touch-action: manipulation; }
}

/* ─── Components ─── */
@layer components {
  .skeleton {
    @apply animate-skeleton-pulse rounded-md;
    background: rgba(10, 22, 40, 0.8);
    border: 1px solid rgba(6, 182, 212, 0.08);
  }

  /* Glass morphism — medium */
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
  }

  /* Glass card */
  .glass-card {
    background: rgba(10, 22, 40, 0.55);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(6, 182, 212, 0.10);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(6, 182, 212, 0.06);
  }

  /* Cyan glow — used on primary buttons and active states */
  .glow-cyan {
    box-shadow: 0 0 16px rgba(6, 182, 212, 0.35), 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  .animate-skeleton-pulse,
  .animate-float,
  .animate-float-delayed,
  .animate-float-slow {
    animation: none !important;
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/pablorodriguez/Documents/priceradar && npx tsc --noEmit
```
Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add src/index.css && git commit -m "feat: replace design tokens with dark navy + cyan palette"
```

---

## Task 2: Tailwind Config — Font Families + Token Aliases

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Update tailwind.config.ts**

Replace the full file:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  // Always dark — no media query toggle
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        'border-strong': 'hsl(var(--border-strong))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        'surface-raised': 'hsl(var(--surface-raised))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          subtle: 'hsl(var(--accent-subtle))',
          hover: 'hsl(var(--accent-hover))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        signal: {
          low:              'hsl(var(--signal-low))',
          'low-bg':         'hsl(var(--signal-low-bg))',
          'low-border':     'hsl(var(--signal-low-border))',
          high:             'hsl(var(--signal-high))',
          'high-bg':        'hsl(var(--signal-high-bg))',
          'high-border':    'hsl(var(--signal-high-border))',
          neutral:          'hsl(var(--signal-neutral))',
          'neutral-bg':     'hsl(var(--signal-neutral-bg))',
          'neutral-border': 'hsl(var(--signal-neutral-border))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      fontFamily: {
        // DM Sans — body, labels, UI text
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        // Space Grotesk — headings, prices, stats
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1rem' }],
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem',     { lineHeight: '1.5rem' }],
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':['1.5rem',   { lineHeight: '2rem' }],
        '3xl':['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':['2.25rem',  { lineHeight: '2.5rem' }],
      },
      spacing: {
        nav: '4rem',
        header: '3.5rem',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
      animation: {
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'float': 'float 20s ease-in-out infinite',
        'float-delayed': 'float 24s ease-in-out infinite 8s',
        'float-slow': 'float 28s ease-in-out infinite 4s',
      },
      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```
Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts && git commit -m "feat: tailwind config — Space Grotesk + DM Sans, always-dark tokens"
```

---

## Task 3: index.html — Fonts, SEO, Structured Data

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

    <!-- Primary meta -->
    <title>PriceRadar — Is This Amazon Price a Good Deal?</title>
    <meta name="description" content="See if an Amazon product's current price is historically high or low. Compare Walmart and Best Buy in real time. No extension needed — free price checks, no account required." />
    <meta name="keywords" content="amazon price tracker, price history, best price, walmart price comparison, best buy deals, price alert, is this a good deal, price radar" />
    <meta name="theme-color" content="#050D1A" />
    <meta name="color-scheme" content="dark" />

    <!-- PWA -->
    <link rel="manifest" href="/manifest.json" />

    <!-- iOS PWA -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="PriceRadar" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />

    <!-- Canonical -->
    <link rel="canonical" href="https://price-radar.io" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="PriceRadar" />
    <meta property="og:title" content="PriceRadar — Is This Amazon Price a Good Deal?" />
    <meta property="og:description" content="Multi-retailer price tracking with historical high/low signal. No extension needed." />
    <meta property="og:image" content="https://price-radar.io/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="https://price-radar.io" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@priceradar" />
    <meta name="twitter:title" content="PriceRadar — Is This Amazon Price a Good Deal?" />
    <meta name="twitter:description" content="Is this price actually a good deal? Check now — free, no account required." />
    <meta name="twitter:image" content="https://price-radar.io/og-image.png" />

    <!-- Windows tile -->
    <meta name="msapplication-TileColor" content="#050D1A" />
    <meta name="msapplication-TileImage" content="/icons/icon-144.png" />

    <!-- Fonts: Space Grotesk (display) + DM Sans (body) -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="preload"
      as="style"
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap"
    />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap"
    />

    <!-- Structured Data: WebApplication -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "PriceRadar",
      "description": "Track Amazon prices, see price history, and compare Walmart and Best Buy — know if you're getting a deal.",
      "url": "https://price-radar.io",
      "applicationCategory": "ShoppingApplication",
      "operatingSystem": "All",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    }
    </script>

    <!-- Structured Data: FAQPage -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is PriceRadar free to use?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. Checking any Amazon product price and seeing the price history is completely free — no account required." }
        },
        {
          "@type": "Question",
          "name": "Which retailers does PriceRadar compare?",
          "acceptedAnswer": { "@type": "Answer", "text": "PriceRadar compares Amazon, Walmart, and Best Buy prices in real time for products in the United States." }
        },
        {
          "@type": "Question",
          "name": "Do I need a browser extension?",
          "acceptedAnswer": { "@type": "Answer", "text": "No. Just paste any Amazon product URL into PriceRadar and we'll show you the full price history and retailer comparison instantly." }
        }
      ]
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html && git commit -m "feat: update fonts to Space Grotesk + DM Sans, add structured data SEO"
```

---

## Task 4: Static SEO Files

**Files:**
- Create: `public/robots.txt`
- Create: `public/sitemap.xml`

- [ ] **Step 1: Create robots.txt**

```
User-agent: *
Allow: /
Sitemap: https://price-radar.io/sitemap.xml
```

Save to `public/robots.txt`

- [ ] **Step 2: Create sitemap.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://price-radar.io/</loc>
    <lastmod>2026-03-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://price-radar.io/search</loc>
    <lastmod>2026-03-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

Save to `public/sitemap.xml`

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt public/sitemap.xml && git commit -m "feat: add robots.txt and sitemap.xml for SEO"
```

---

## Task 5: useDocumentTitle Hook

**Files:**
- Create: `src/hooks/useDocumentTitle.ts`
- Modify: `src/hooks/index.ts` (add export)

- [ ] **Step 1: Create the hook**

```typescript
// src/hooks/useDocumentTitle.ts
import { useEffect } from 'react'

/**
 * Sets document.title for the current page.
 * Called at the top of each page component for per-route SEO titles.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => { document.title = previous }
  }, [title])
}
```

- [ ] **Step 2: Export from hooks barrel**

Add to the bottom of `src/hooks/index.ts`:

```typescript
export { useDocumentTitle } from './useDocumentTitle'
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```
Expected: zero errors

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useDocumentTitle.ts src/hooks/index.ts && git commit -m "feat: add useDocumentTitle hook for per-route SEO titles"
```

---

## Task 6: manifest.json

**Files:**
- Modify: `public/manifest.json`

- [ ] **Step 1: Update theme and background colors**

In `public/manifest.json`, change:
- `"background_color": "#FFFFFF"` → `"background_color": "#050D1A"`
- `"theme_color": "#2563EB"` → `"theme_color": "#06B6D4"`
- `"name": "Price Radar"` → `"name": "PriceRadar"`
- `"short_name": "Price Radar"` → `"short_name": "PriceRadar"`

- [ ] **Step 2: Commit**

```bash
git add public/manifest.json && git commit -m "feat: update PWA manifest colors to new dark palette"
```

---

## Task 7: GlassBackground — Update Blob Colors

**Files:**
- Modify: `src/components/common/GlassBackground.tsx`

- [ ] **Step 1: Replace blob colors**

Replace the `BLOBS` array (lines 4–38) with cyan + violet on navy:

```typescript
const BLOBS = [
  {
    // Primary — electric cyan, top-right
    className: 'absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full opacity-25',
    style: { background: 'radial-gradient(circle, #06B6D4 0%, #0891B2 50%, transparent 100%)' },
    animate: { x: [0, 40, -15, 0], y: [0, -60, 30, 0], scale: [1, 1.08, 0.94, 1] },
    transition: { duration: 22, ease: 'easeInOut', repeat: Infinity },
  },
  {
    // Secondary — violet, bottom-left
    className: 'absolute -bottom-32 -left-32 h-[460px] w-[460px] rounded-full opacity-20',
    style: { background: 'radial-gradient(circle, #7C3AED 0%, #6D28D9 50%, transparent 100%)' },
    animate: { x: [0, -35, 25, 0], y: [0, 50, -40, 0], scale: [1, 0.93, 1.07, 1] },
    transition: { duration: 26, ease: 'easeInOut', repeat: Infinity, delay: 9 },
  },
  {
    // Tertiary — deep cyan-teal, mid-right
    className: 'absolute top-1/2 -right-20 h-[320px] w-[320px] rounded-full opacity-[0.15]',
    style: { background: 'radial-gradient(circle, #0E7490 0%, #164E63 60%, transparent 100%)' },
    animate: { x: [0, 25, -18, 0], y: [0, -40, 55, 0], scale: [1, 1.1, 0.9, 1] },
    transition: { duration: 30, ease: 'easeInOut', repeat: Infinity, delay: 4 },
  },
]
```

Also update the base gradient div (line 47):
```tsx
<div className="absolute inset-0 bg-gradient-to-br from-[#050D1A] via-[#070F20] to-[#050D1A]" />
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/common/GlassBackground.tsx && git commit -m "feat: update GlassBackground blobs to cyan + violet on navy"
```

---

## Task 8: Layout — Header + BottomNav

**Files:**
- Modify: `src/components/layout/index.tsx`

- [ ] **Step 1: Update Header**

Replace the `Header` function (lines 10–54):

```tsx
export function Header() {
  const isOnline = useOnlineStatus()

  return (
    <header className="glass sticky top-0 z-40 flex h-14 items-center justify-between px-4">
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      <Link
        to="/"
        className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        aria-label="PriceRadar — Home"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 border border-accent/20 glow-cyan">
          <Radar className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
        <span className="font-display text-base font-bold tracking-tight text-foreground">
          Price<span className="text-accent">Radar</span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-700/40 px-2 py-1"
              role="status"
              aria-label="You are offline"
            >
              <WifiOff className="h-3 w-3 text-amber-400" aria-hidden="true" />
              <span className="text-xs font-medium text-amber-400">Offline</span>
            </motion.div>
          )}
        </AnimatePresence>
        <UserMenuButton />
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Update UserMenuButton**

Replace the `UserMenuButton` function with:

```tsx
function UserMenuButton() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/auth')}
        className="border-accent/30 text-accent hover:bg-accent/10 hover:border-accent min-h-[36px]"
      >
        Sign in
      </Button>
    )
  }

  return (
    <Link
      to="/settings"
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full overflow-hidden',
        'border border-accent/30 hover:border-accent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
      aria-label="Account settings"
    >
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-accent/10">
          <User className="h-4 w-4 text-accent" aria-hidden="true" />
        </div>
      )}
    </Link>
  )
}
```

- [ ] **Step 3: Update BottomNav active indicator**

In the `BottomNav` function, replace the `motion.div` active indicator dot with a glow underline. Find the `{active && (` block inside the nav button and replace:

```tsx
{active && (
  <motion.div
    layoutId="nav-indicator"
    className="absolute -bottom-1 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-accent"
    style={{ boxShadow: '0 0 8px rgba(6, 182, 212, 0.8)' }}
    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
  />
)}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/index.tsx && git commit -m "feat: update Header and BottomNav with new dark palette and cyan glow"
```

---

## Task 9: Button Component

**Files:**
- Modify: `src/components/ui/Button.tsx`

- [ ] **Step 1: Update button variants**

Replace the `buttonVariants` `cva` call (lines 7–50). Key changes: primary gets glow, outline uses new border/accent colors, min-height 44px for WCAG touch targets:

```typescript
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg',
    'font-sans text-sm font-medium',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-40',
    'touch-action-manipulation',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-[#050D1A] font-semibold hover:bg-accent-hover active:bg-accent shadow-[0_0_16px_rgba(6,182,212,0.35)] hover:shadow-[0_0_24px_rgba(6,182,212,0.50)]',
        secondary:
          'bg-surface text-foreground border border-[rgba(6,182,212,0.20)] hover:border-accent/40 hover:bg-surface-raised',
        outline:
          'border border-accent/25 bg-transparent text-accent hover:bg-accent/10 hover:border-accent/50',
        ghost:
          'hover:bg-accent/10 hover:text-accent text-muted-foreground',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link:
          'text-accent underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:      'h-9 px-3 text-xs rounded-md min-h-[36px]',
        default: 'h-11 px-4 min-h-[44px]',
        lg:      'h-12 px-6 text-base rounded-xl min-h-[44px]',
        xl:      'h-14 px-8 text-base rounded-xl min-h-[44px]',
        icon:    'h-11 w-11 min-h-[44px] min-w-[44px]',
        'icon-sm': 'h-9 w-9',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Button.tsx && git commit -m "feat: update Button with cyan glow, new variants, 44px WCAG touch targets"
```

---

## Task 10: SignalBadge Component

**Files:**
- Modify: `src/components/product/SignalBadge.tsx`

- [ ] **Step 1: Apply font-display to label text**

In the `content` JSX, find the `<span>` that renders the label (lines 47–63) and add `font-display` to the className:

```tsx
<span
  className={cn(
    'font-display flex items-center gap-1.5',
    size === 'hero' && 'text-2xl font-bold',
    size === 'default' && 'text-sm font-semibold',
    size === 'inline' && 'text-xs font-medium',
  )}
>
```

- [ ] **Step 2: Add glow to hero badge**

In the outer `<div>` of `content`, add `glow` on hero size. Update the `className` prop in the `cn()` call:

```tsx
className={cn(
  'inline-flex flex-col items-center border',
  config.badgeBg,
  size === 'hero' && 'rounded-2xl px-6 py-4 gap-1 shadow-[0_0_24px_rgba(6,182,212,0.15)]',
  size === 'default' && 'rounded-full px-3 py-1.5 flex-row gap-1.5',
  size === 'inline' && 'rounded-full px-2 py-0.5 flex-row gap-1',
  className,
)}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/product/SignalBadge.tsx && git commit -m "feat: SignalBadge — Space Grotesk label, hero glow"
```

---

## Task 11: PriceComparisonTable

**Files:**
- Modify: `src/components/product/PriceComparisonTable.tsx`

- [ ] **Step 1: Update retailer logo colors**

In `RetailerLogo`, update the `COLORS` map to work on dark background (more saturated):

```typescript
const COLORS: Record<string, string> = {
  amazon:  'bg-[#FF9900] text-black',
  walmart: 'bg-[#0071CE]',
  ebay:    'bg-[#E53238]',
  bestbuy: 'bg-[#003B64]',
  target:  'bg-[#CC0000]',
}
```

Return:
```tsx
return (
  <div
    className={cn(
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-[11px] font-bold font-display',
      COLORS[retailer.slug] ?? 'bg-surface border border-[rgba(6,182,212,0.20)] text-muted-foreground',
    )}
    aria-hidden="true"
  >
    {retailer.name.charAt(0)}
  </div>
)
```

- [ ] **Step 2: Apply font-display to price column**

In the price `<td>`, find the price `<span>` and add `font-display`:

```tsx
<span className={cn(
  'price font-display text-sm font-bold',
  isCheapest ? 'text-signal-low' : isMostExpensive ? 'text-signal-high' : 'text-foreground',
)}>
```

- [ ] **Step 3: Update best price row background**

Change `item.is_best_price && 'bg-signal-low-bg/30'` to use the new token:
```tsx
item.is_best_price && 'bg-signal-low-bg'
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/product/PriceComparisonTable.tsx && git commit -m "feat: PriceComparisonTable — dark-mode logo colors, Space Grotesk prices"
```

---

## Task 12: LandingPage

**Files:**
- Modify: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Add useDocumentTitle**

Add import at top:
```typescript
import { useDocumentTitle } from '@/hooks'
```

At the top of `LandingPage()` function body:
```typescript
useDocumentTitle('PriceRadar — Is This Amazon Price a Good Deal?')
```

- [ ] **Step 2: Update hero heading**

Replace the `<h1>` className:
```tsx
<h1
  id="hero-heading"
  className="font-display text-4xl font-bold tracking-tight text-foreground leading-tight"
>
```

- [ ] **Step 3: Update badge pill**

Replace the inline `div` pill styling:
```tsx
<div className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
```

- [ ] **Step 4: Update StepCard**

In `StepCard`, replace the icon container and step number:
```tsx
<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
  <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
</div>
<div className="space-y-0.5 flex-1">
  <p className="font-display text-sm font-semibold text-foreground">{title}</p>
  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
</div>
<span className="ml-auto shrink-0 font-display text-xs font-bold text-accent/40">{step}</span>
```

Replace the step card container class:
```tsx
className="glass-card flex items-start gap-3 rounded-xl px-4 py-3.5 border-l-2 border-l-accent/30"
```

- [ ] **Step 5: Update trust section**

Replace the trust section container:
```tsx
className="glass-card rounded-xl px-5 py-5 space-y-3"
```

- [ ] **Step 6: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/LandingPage.tsx && git commit -m "feat: LandingPage — Space Grotesk hero, cyan accents, document title"
```

---

## Task 13: SearchPage

**Files:**
- Modify: `src/pages/SearchPage.tsx`

- [ ] **Step 1: Add useDocumentTitle**

```typescript
import { useDocumentTitle } from '@/hooks'
// inside SearchPage():
useDocumentTitle('Check a Price — PriceRadar')
```

- [ ] **Step 2: Update h1**

```tsx
<h1 className="font-display text-2xl font-bold text-foreground">Check a price</h1>
```

- [ ] **Step 3: Update hint card**

Replace the "How to check" card container:
```tsx
<div className="glass-card rounded-xl px-4 py-4 space-y-2">
```

Update the numbered circle steps:
```tsx
<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 border border-accent/25 font-display text-[10px] font-bold text-accent mt-0.5">
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/SearchPage.tsx && git commit -m "feat: SearchPage — Space Grotesk h1, cyan numbered steps, document title"
```

---

## Task 14: ProductResultPage

**Files:**
- Modify: `src/pages/ProductResultPage.tsx`

- [ ] **Step 1: Add useDocumentTitle**

```typescript
import { useDocumentTitle } from '@/hooks'
// inside ProductResultPage(), after product is loaded:
useDocumentTitle(product ? `${product.name} — Price History & Comparison | PriceRadar` : 'PriceRadar')
```

- [ ] **Step 2: Update price display in Signal hero**

Find the price `<p>` (line 131) and add `font-display`:
```tsx
<p className="price font-display text-4xl font-bold text-foreground">
```

- [ ] **Step 3: Update StatsGrid**

In `StatsGrid`, update the stat card:
```tsx
<div key={stat.label} className="glass-card flex flex-col items-center rounded-xl px-2 py-3.5 text-center">
  <p className={cn('price font-display text-sm font-bold', stat.highlight ? 'text-signal-low' : 'text-foreground')}>
    {stat.value}
  </p>
  <p className="mt-0.5 text-[10px] text-muted-foreground font-sans">{stat.label}</p>
</div>
```

- [ ] **Step 4: Update ProductHeader h1**

```tsx
<h1 className="font-display text-base font-semibold text-foreground leading-snug line-clamp-3">
```

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/ProductResultPage.tsx && git commit -m "feat: ProductResultPage — Space Grotesk prices, stats, document title"
```

---

## Task 15: DashboardPage

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

- [ ] **Step 1: Add useDocumentTitle**

```typescript
import { useDocumentTitle } from '@/hooks'
// inside DashboardPage():
useDocumentTitle('My Watchlist — PriceRadar')
```

- [ ] **Step 2: Update filter pills**

Find the `VERDICT_FILTERS.map` render. Update the pill button classes. Active:
```
'bg-accent text-[#050D1A] font-semibold border-accent'
```
Inactive:
```
'glass-card text-muted-foreground border-transparent hover:border-accent/30 hover:text-foreground'
```

- [ ] **Step 3: Update page heading**

Find the page h1/section heading and apply `font-display`:
```tsx
<h1 className="font-display text-2xl font-bold text-foreground">My Watchlist</h1>
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/DashboardPage.tsx && git commit -m "feat: DashboardPage — Space Grotesk heading, cyan filter pills, document title"
```

---

## Task 16: UpgradeAndSettingsPages

**Files:**
- Modify: `src/pages/UpgradeAndSettingsPages.tsx`

- [ ] **Step 1: Read the full file**

Use the Read tool to read the entire `src/pages/UpgradeAndSettingsPages.tsx`. Do not use `head` — the file may have heading elements past line 80. Identify every exported page component function and every `h1`/`h2` element in the file before making any edits.

- [ ] **Step 2: Add useDocumentTitle to each page function**

Import and call `useDocumentTitle` in each exported page function:
- Upgrade page: `useDocumentTitle('Upgrade to PriceRadar Pro — PriceRadar')`
- Settings page: `useDocumentTitle('Account Settings — PriceRadar')`

- [ ] **Step 3: Apply font-display to headings**

Add `font-display` class to all `h1` and `h2` elements in the file.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/UpgradeAndSettingsPages.tsx && git commit -m "feat: UpgradeAndSettingsPages — document titles, Space Grotesk headings"
```

---

## Task 17: AuthPage

**Files:**
- Modify: `src/pages/AuthPage.tsx`

- [ ] **Step 1: Add useDocumentTitle**

```typescript
import { useDocumentTitle } from '@/hooks'
useDocumentTitle('Sign In — PriceRadar')
```

Apply `font-display` to any h1 heading. Verify and commit:

```bash
npx tsc --noEmit && git add src/pages/AuthPage.tsx && git commit -m "feat: AuthPage — document title, Space Grotesk heading"
```

---

## Task 18: Final Build Verification

- [ ] **Step 1: Full TypeScript check**

```bash
npx tsc --noEmit
```
Expected: zero errors

- [ ] **Step 2: Lint check**

```bash
npm run lint
```
Expected: zero errors or only pre-existing warnings

- [ ] **Step 3: Production build**

```bash
npm run build
```
Expected: build completes, all chunks listed, no errors

- [ ] **Step 4: Start dev server for Playwright check**

```bash
npm run dev &
sleep 4
echo "Dev server ready"
```

The server starts on port 5174 (5173 may be occupied). Confirm the port in the output.

- [ ] **Step 5: Playwright screenshot verification**

```bash
cat > /tmp/verify_ui.py << 'EOF'
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 390, 'height': 844})

    page.goto('http://localhost:5174/')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/landing_final.png', full_page=True)

    page.goto('http://localhost:5174/search')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/search_final.png', full_page=True)

    print("Screenshots saved to /tmp/landing_final.png and /tmp/search_final.png")
    print(f"Background color: {page.evaluate('getComputedStyle(document.body).backgroundColor')}")
    print(f"Body font: {page.evaluate('getComputedStyle(document.body).fontFamily')}")
    browser.close()
EOF
python3 /tmp/verify_ui.py
```

Expected: background is `rgb(5, 13, 26)` (navy), font family includes `DM Sans`

- [ ] **Step 6: Final commit**

```bash
git add -A && git commit -m "feat: complete UI overhaul — dark navy/cyan, Space Grotesk + DM Sans, glassmorphism, SEO"
```

---

## Checklist Summary

- [ ] Task 1: Design tokens (index.css)
- [ ] Task 2: Tailwind config
- [ ] Task 3: index.html fonts + structured data
- [ ] Task 4: robots.txt + sitemap.xml
- [ ] Task 5: useDocumentTitle hook
- [ ] Task 6: manifest.json
- [ ] Task 7: GlassBackground blob colors
- [ ] Task 8: Header + BottomNav
- [ ] Task 9: Button component
- [ ] Task 10: SignalBadge
- [ ] Task 11: PriceComparisonTable
- [ ] Task 12: LandingPage
- [ ] Task 13: SearchPage
- [ ] Task 14: ProductResultPage
- [ ] Task 15: DashboardPage
- [ ] Task 16: UpgradeAndSettingsPages
- [ ] Task 17: AuthPage
- [ ] Task 18: Final build verification

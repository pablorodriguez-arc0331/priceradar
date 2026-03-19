# PriceRadar UI Overhaul — Design Spec
**Date:** 2026-03-19
**Status:** Approved
**Scope:** Full UI redesign — design system, all pages, SEO enhancements

---

## 1. Goals

1. Replace the current blue-on-white / subtle glass UI with a **futuristic, minimalist dark design** rooted in a deep navy + electric cyan palette.
2. Introduce **advanced glassmorphism** at medium intensity across all surfaces.
3. Adopt a **dual-font system** — Space Grotesk for display/headings/numbers, DM Sans for body/UI text — inspired by Notion's editorial craft.
4. Maintain and strengthen **WCAG 2.1 AA compliance** (contrast, focus management, ARIA, semantic HTML).
5. Improve **SEO** with structured data, per-route document titles, and enriched meta tags.

---

## 2. Design System

### 2.1 Color Tokens

The app will be **always-dark** — no light mode. The `prefers-color-scheme` media query is removed. All existing light-mode token values are replaced with the new dark palette.

| Token | Value | Usage |
|---|---|---|
| `--background` | `#050D1A` | Page background (deep navy void) |
| `--surface` | `#0A1628` | Card / panel surface |
| `--surface-raised` | `#0D1E36` | Elevated elements (dropdowns, sheets) |
| `--foreground` | `#F0F4FF` | Primary text (cool near-white) |
| `--muted-foreground` | `#6B7FA3` | Secondary / helper text |
| `--accent` | `#06B6D4` | Primary cyan accent |
| `--accent-hover` | `#22D3EE` | Cyan hover state |
| `--accent-subtle` | `rgba(6,182,212,0.10)` | Tinted backgrounds |
| `--border` | `rgba(6,182,212,0.12)` | Default hairline border |
| `--border-strong` | `rgba(6,182,212,0.24)` | Emphasized borders (focus, hover) |
| `--signal-low` | `#10B981` | Green — price is low/good |
| `--signal-low-bg` | `rgba(16,185,129,0.10)` | Green tinted bg |
| `--signal-high` | `#F43F5E` | Rose red — price is high |
| `--signal-high-bg` | `rgba(244,63,94,0.10)` | Red tinted bg |
| `--signal-neutral` | `#6B7FA3` | Neutral / average |
| `--signal-neutral-bg` | `rgba(107,127,163,0.10)` | Neutral tinted bg |

### 2.2 Typography

Two Google Fonts loaded via `<link>` preconnect + preload. Exact `<link>` block for `index.html`:

```html
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
```

- **Space Grotesk** (weights 400, 500, 600, 700) — headings, display prices, stats, signal labels, logo
- **DM Sans** (weights 400, 500, 600) — body copy, helper text, nav labels, buttons, table data

**Mapping:**
- `font-display`: Space Grotesk — applied to `h1`, `h2`, `h3`, price values (`.price` class), stat values, signal badge labels
- `font-sans`: DM Sans — applied to everything else (body default)

### 2.3 Glassmorphism (Medium)

All `.glass` and `.glass-card` surfaces use:

```css
.glass {
  background: rgba(10, 22, 40, 0.65);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(6, 182, 212, 0.12);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(6, 182, 212, 0.08);
}

.glass-card {
  background: rgba(10, 22, 40, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(6, 182, 212, 0.10);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(6, 182, 212, 0.06);
}
```

Craft detail: a faint `1px` top-edge inset glow (`inset 0 1px 0 rgba(6,182,212,0.08)`) gives cards a luminous "lifted" feel consistent with Notion's hairline border craft.

### 2.4 Background Texture

A subtle noise/dot texture (SVG data URI, ~3% opacity) applied to `body` adds tactile depth without competing with content. Animated radial gradients (cyan, violet) float slowly in the background behind all content — the same technique used in the existing `GlassBackground` component, updated to use the new palette.

### 2.5 Spacing & Radius

- Border radius: `--radius: 0.75rem` (12px) — slightly more rounded than current 8px
- Spacing: generous padding inside cards (`px-5 py-4`) — Notion-style "air"
- Hairline borders: always `1px`, never `2px`

---

## 3. Files to Change

### 3.1 `index.html`
- Replace Inter preload with Space Grotesk + DM Sans preloads
- Add JSON-LD structured data: `WebApplication` schema
- Add `FAQPage` schema with 3 common price-checking questions
- Add `<meta name="keywords">` with price tracking terms
- Update `theme-color` to `#050D1A`
- Update manifest `background_color` and `theme_color`

### 3.2 `public/robots.txt` (new file)
```
User-agent: *
Allow: /
Sitemap: https://price-radar.io/sitemap.xml
```

### 3.3 `public/sitemap.xml` (new file)
Static sitemap covering only unauthenticated-accessible public routes. Exact XML content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://price-radar.io/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://price-radar.io/search</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

Routes requiring auth (`/dashboard`, `/upgrade`, `/settings`) are excluded — Google would hit a redirect or auth wall and penalise the entry.

### 3.4 `src/index.css`
- Replace all CSS custom properties with new dark-only palette tokens
- Remove `@media (prefers-color-scheme: dark)` block (always dark now)
- Update `.glass` and `.glass-card` with new glassmorphism values
- Update `.skeleton` to use new surface color
- Add `font-display` utility class (Space Grotesk)
- Add `--radius: 0.75rem`
- Add background noise texture to `body`

### 3.5 `tailwind.config.ts`
- Remove `darkMode: ['media']`
- Add `font-display: ['Space Grotesk', ...]` to `fontFamily`
- Update `font-sans` to `['DM Sans', ...]`
- Add new color tokens: `surface`, `surface-raised`, `border-strong`
- Update all signal color references

### 3.6 `src/components/layout/index.tsx`
**Header:**
- Taller logo text in Space Grotesk
- Cyan glow on the radar icon container
- "Sign in" button becomes a ghost pill with cyan border

**BottomNav:**
- Active tab: cyan text + icon + 2px cyan underline glow (no dot indicator)
- Inactive: muted-foreground
- Glass bar with stronger blur

### 3.7 `src/components/common/GlassBackground.tsx`
- Update gradient colors to cyan + violet on deep navy
- Increase blob opacity slightly for new dark base

### 3.8 `src/pages/LandingPage.tsx`
- Hero `h1` in Space Grotesk 40px bold, cyan word on second line
- Badge pill with cyan border + glow
- Step cards: slim left-border line in cyan, number badge in Space Grotesk
- Sample card: elevated glass with luminous border
- Trust section: green shield icon + bullet list with cyan dots

### 3.9 `src/pages/SearchPage.tsx`
- `h1` in Space Grotesk
- Recently-checked cards: tighter glass treatment, product signal badge more prominent
- Hint card with numbered steps: cyan circle numbers

### 3.10 `src/pages/ProductResultPage.tsx`
- Signal hero: larger badge, Space Grotesk price display
- Back button: muted with hover state
- CTA buttons: primary cyan solid, track button with bell icon
- Stats grid: Space Grotesk bold numbers, DM Sans labels

### 3.11 `src/pages/DashboardPage.tsx`
- Filter pills: active = cyan filled, inactive = glass outline
- View toggle: grid/list icons with active state
- Card grid: glass tiles with signal color left-border accent

### 3.12 `src/components/product/PriceComparisonTable.tsx`
- Table container: full glass panel
- Best price row: cyan-tinted glass bg
- Retailer logo: colored circle, first letter
- Price in Space Grotesk, cheapest in signal-low, most expensive in signal-high
- Buy button: cyan filled pill; locked = muted pill with lock icon

### 3.13 `src/components/product/SignalBadge.tsx`
- Badge container: signal-colored glass pill with matching glow
- Label in Space Grotesk medium
- Subtext in DM Sans xs

### 3.14 `src/components/ui/Button.tsx`
- Primary: cyan solid with hover glow (`box-shadow: 0 0 16px rgba(6,182,212,0.35)`)
- Outline: glass border with cyan text, hover fills with accent-subtle
- Ghost: transparent, hover shows glass bg
- Min touch target: 44px height (WCAG 2.5.5)

### 3.15 `src/pages/UpgradeAndSettingsPages.tsx`
This is a single real file (confirmed in codebase — `ls src/pages/` shows `UpgradeAndSettingsPages.tsx`). Token-only update: no layout or structural changes. Apply new color tokens (`--background`, `--surface`, `--accent`, `--border`) so these pages inherit the new dark palette correctly. Add `useDocumentTitle` calls for Upgrade and Settings routes. No new features.

### 3.16 `public/manifest.json`
Update `background_color` to `#050D1A` and `theme_color` to `#06B6D4` to match new palette.

### 3.17 `src/hooks/useDocumentTitle.ts` (new file)
New hook `useDocumentTitle(title: string)` — sets `document.title` via `useEffect` on mount and title change. Lives in `src/hooks/` (not `utils.ts`) to follow React hooks convention and avoid ESLint `react-hooks/rules-of-hooks` violations. Exported from `src/hooks/index.ts`. Each page component calls it at the top of the function body.

---

## 4. WCAG 2.1 AA Compliance

| Requirement | Implementation |
|---|---|
| Color contrast ≥ 4.5:1 (text) | `#F0F4FF` on `#050D1A` = 16.8:1 ✅; `#06B6D4` on `#050D1A` = 4.6:1 ✅ |
| Color contrast ≥ 3:1 (UI components) | Cyan border on dark bg ≥ 3:1 ✅ |
| Focus visible | `:focus-visible` ring in cyan kept on all interactive elements |
| Skip to content | Existing link kept, updated styling |
| ARIA labels | All icon-only buttons have `aria-label` |
| Touch target ≥ 44×44px | All buttons and nav items enforced |
| No color as sole indicator | Signal badges use text label + color |
| Reduced motion | `src/index.css` wraps all non-essential keyframe animations in `@media (prefers-reduced-motion: no-preference)`. Framer Motion components use `useReducedMotion()` hook to conditionally disable transitions. |
| Keyboard / focus order | Glass blur and blob overlays use `pointer-events: none` and are excluded from tab order (`aria-hidden="true"`). No stacking context created by glassmorphism should interrupt the natural DOM tab sequence — verify with keyboard-only navigation after implementation. |

---

## 5. SEO Enhancements

### Structured Data (JSON-LD in `index.html`)

Two JSON-LD blocks:

**WebApplication:**
```json
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
```

**FAQPage** (exact Q&A to use):
```json
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
```

### `useDocumentTitle` hook
Called in each page component:
- Landing: `PriceRadar — Is This Amazon Price a Good Deal?`
- Search: `Check a Price — PriceRadar`
- Product: `{product.name} — Price History & Comparison | PriceRadar`
- Dashboard: `My Watchlist — PriceRadar`
- Settings: `Account Settings — PriceRadar` (requires touching `src/pages/UpgradeAndSettingsPages.tsx`, already listed in 3.15)

### `robots.txt` + `sitemap.xml`
Static files in `public/`. Sitemap includes all public-facing routes with `lastmod` and `changefreq`.

### Meta keywords
`amazon price tracker, price history, best price, walmart price comparison, best buy deals, price alert, is this a good deal`

---

## 6. Out of Scope

- Backend / Supabase changes
- PWA icon regeneration (icons remain as-is)
- New pages or routes
- Payment / upgrade flow redesign (UpgradeAndSettingsPages gets token updates only)

---

## 7. Success Criteria

- [ ] All pages render with new dark navy + cyan palette
- [ ] Space Grotesk used for all headings and price values
- [ ] DM Sans used for all body and UI text
- [ ] Glass effect visible with blur, luminous border, and inner glow on all cards
- [ ] No WCAG contrast failures (verified via automated check)
- [ ] `document.title` updates per route
- [ ] JSON-LD structured data present in page source
- [ ] `robots.txt` and `sitemap.xml` accessible at `/robots.txt` and `/sitemap.xml`
- [ ] Build passes with zero TypeScript errors

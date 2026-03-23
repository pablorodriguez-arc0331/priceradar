# PriceRadar — Product & Brand Guide
**v2.0 · 2026-03-23** — UI Overhaul: Deep Navy + Electric Cyan

---

## What is PriceRadar?

PriceRadar is a free Amazon price intelligence PWA (Progressive Web App). The core question it answers is: **"Is this price actually a good deal?"**

Users paste any Amazon product URL and instantly see:
- The full price history chart
- A high/low signal verdict (is today's price a 6-month low, high, or average?)
- A live multi-retailer comparison showing the same product on Walmart, Best Buy, Target, eBay, and Costco

No browser extension required. No account needed for basic price checks. Works on any device.

---

## How It Works

### 1. Paste an Amazon link
Copy any Amazon product URL and paste it into the search bar. The app extracts the ASIN, fetches current pricing and price history (via Keepa), and returns a verdict.

### 2. Get the verdict instantly
The price signal tells the user whether today's price sits at a 90-day low, high, or near average — with a percentile score and a plain-language label ("Price Low", "Price High", "Average Price").

### 3. Compare retailers
Powered by Gemini AI with Google Search grounding, PriceRadar searches up to 5 retailers in real time and displays a comparison table with prices, best-deal highlights, and direct buy links.

### 4. Track and get alerted
Signed-in users can add products to a Watchlist and set a target price. PriceRadar sends an email or push notification when the price drops to that target.

---

## Features

| Feature | Free | Pro ($4.99/mo) |
|---------|------|----------------|
| Unlimited price checks | ✓ | ✓ |
| High/low price signal | ✓ | ✓ |
| Track up to 3 products | ✓ | ✓ |
| Price alerts (email) | ✓ | ✓ |
| Full price history (up to 1 year) | — | ✓ |
| Unlimited product tracking | — | ✓ |
| Faster price refresh (hourly) | — | ✓ |
| Priority email + push alerts | — | ✓ |

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **Price data:** Keepa API (Amazon history), Gemini 2.5 Flash + Google Search (live retailer comparison)
- **PWA:** Workbox service worker, Web Push (VAPID), installable on iOS and Android
- **Deployment:** price-radar.io

---

## Brand Guide

### Brand Name

**PriceRadar** — one word, capital P and R.
- Correct: `PriceRadar`
- Incorrect: `Price Radar`, `priceradar`, `PRICERADAR`

In the logo lockup it reads `Price` (regular weight) + `Radar` (accented/bold).

---

### Color Palette

PriceRadar is **always dark** — no light mode. Deep navy base with electric cyan as the single accent color.

#### Core Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#050D1A` | Page background — deep navy void |
| `--surface` | `#0A1628` | Card / panel surface |
| `--surface-raised` | `#0D1E36` | Elevated elements (dropdowns, sheets) |
| `--foreground` | `#F0F4FF` | Primary text — cool near-white |
| `--muted-foreground` | `#6B7FA3` | Secondary / helper text |
| `--accent` | `#06B6D4` | Electric cyan — CTAs, active states, highlights |
| `--accent-hover` | `#22D3EE` | Cyan hover |
| `--accent-subtle` | `rgba(6,182,212,0.10)` | Tinted fills, ghost states |
| `--border` | `rgba(6,182,212,0.12)` | Default hairline border |
| `--border-strong` | `rgba(6,182,212,0.24)` | Hover / focus border |
| `--destructive` | `#F43F5E` | Rose red — errors, destructive actions |

#### Signal Colors

| Signal | Hex | Meaning |
|--------|-----|---------|
| `signal-low` | `#10B981` | Price is below average — good time to buy |
| `signal-high` | `#F43F5E` | Price is above average — consider waiting |
| `signal-neutral` | `#6B7FA3` | Price is at average |

Each signal has a tinted background (`rgba(..., 0.10)`) and border (`rgba(..., 0.25)`) variant.

#### Glass & Surface Tokens

| Usage | Value |
|-------|-------|
| Card background | `rgba(10, 22, 40, 0.55)` |
| Card border | `rgba(6, 182, 212, 0.10)` |
| Card shadow | `0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(6,182,212,0.06)` |
| Glass (header/modal) | `rgba(10, 22, 40, 0.65)` |
| Glass border | `rgba(6, 182, 212, 0.12)` |
| Glass shadow | `0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(6,182,212,0.08)` |
| Skeleton shimmer | `rgba(6, 182, 212, 0.04–0.08)` |
| Backdrop scrim | `rgba(5, 13, 26, 0.70)` |

---

### Typography

Two typefaces. Both from Google Fonts.

#### Space Grotesk — Display / Headings
- Used for: `h1`–`h3`, price values, stat numbers, signal badge labels, logo wordmark
- Weights: 400, 500, 600, 700
- Class: `font-display`
- Feature: tabular numerals on price figures (`font-variant-numeric: tabular-nums`)

#### DM Sans — Body / UI
- Used for: all body copy, helper text, nav labels, buttons, table data, everything else
- Weights: 400, 500, 600
- Class: `font-sans` (default)

#### JetBrains Mono — Prices
- Used for: `.price` class — monetary values, timestamps
- Class: `font-mono`

#### Type Scale

| Token | Size | Line height |
|-------|------|-------------|
| `xs` | 0.875rem | 1.25rem |
| `sm` | 0.9375rem | 1.375rem |
| `base` | 1rem | 1.5rem |
| `lg` | 1.125rem | 1.75rem |
| `xl` | 1.25rem | 1.75rem |
| `2xl` | 1.5rem | 2rem |
| `3xl` | 1.875rem | 2.25rem |
| `4xl` | 2.25rem | 2.5rem |

Base `html` font-size is `14px`. Inputs, textareas, and buttons are set to `16px` to prevent iOS auto-zoom.

---

### Spacing System

Built on a 4pt grid (Tailwind default). Key layout constants:

| Token | Value |
|-------|-------|
| Nav height | 4rem (64px) |
| Header height | 3.5rem (56px) |
| Page bottom padding (mobile) | `120px + safe-area-inset-bottom` |
| Page bottom padding (desktop) | `2rem` |
| Border radius base | `0.75rem` |

---

### Texture

A subtle noise grain is applied globally via a `body::after` pseudo-element — SVG `feTurbulence` fractalNoise at ~3.5% opacity, tiling at 250×250px. On a dark navy base it adds tactile depth without competing with content. `pointer-events: none`, `z-index: 9999`.

Animated radial gradient blobs (cyan + violet) float slowly behind all content via the `GlassBackground` component — `pointer-events: none`, `aria-hidden="true"`.

---

### Component Styles

#### Glass (header, modals, sheets)
```
background: rgba(10, 22, 40, 0.65)
backdrop-filter: blur(24px)
border: 1px solid rgba(6, 182, 212, 0.12)
box-shadow: 0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(6,182,212,0.08)
```

#### Card (`.glass-card`)
```
background: rgba(10, 22, 40, 0.55)
backdrop-filter: blur(20px)
border: 1px solid rgba(6, 182, 212, 0.10)
box-shadow: 0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(6,182,212,0.06)
```
The `inset 0 1px 0` top-edge glow is the signature craft detail — gives cards a luminous "lifted" feel.

#### Interactive Card (hover lift)
Same as card + on hover:
```
transform: translateY(-2px)
border-color: rgba(6, 182, 212, 0.24)
box-shadow: 0 0 30px -5px rgba(6,182,212,0.12), 0 4px 20px rgba(0,0,0,0.40)
transition: transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms ease, border-color 200ms ease
```

#### Bottom Navigation (liquid glass)
```
border-radius: 32px
background: rgba(10, 22, 40, 0.90)
border: 1px solid rgba(6, 182, 212, 0.10)
box-shadow: 0 4px 24px rgba(0,0,0,0.50), 0 1px 4px rgba(0,0,0,0.30)
backdrop-filter: blur(20px)
position: fixed, 12px + safe-area above bottom edge
```

Active tab: cyan text + icon + 2px underline glow `box-shadow: 0 2px 8px rgba(6,182,212,0.40)`
Inactive tab: `color: #6B7FA3`

#### Primary Button (cyan solid)
```
background: #06B6D4
color: #050D1A
hover box-shadow: 0 0 16px rgba(6,182,212,0.35)
border-radius: 0.75rem
min-height: 44px (touch target)
```

#### Outline Button
```
border: 1px solid rgba(6,182,212,0.24)
color: #06B6D4
hover background: rgba(6,182,212,0.10)
```

#### Focus Ring
```
outline: 2px solid rgba(6, 182, 212, 0.80)
outline-offset: 2px
```

---

### Icons & Assets

All icons use **Lucide React** — outline style, `strokeWidth={1.5}`. No PNG icon assets, no inline SVGs.

- Decorative icons: `aria-hidden="true"`
- Functional icon-only buttons: `aria-label` required
- Size scale: `h-4 w-4` (inline), `h-5 w-5` (nav/toolbar), `h-6 w-6` (prominent), `h-8 w-8` (hero)

---

### Motion

All animations use Framer Motion with spring physics.

| Interaction | Config |
|-------------|--------|
| Page enter | `opacity 0→1, y 6→0`, tween ease-in-out 250ms |
| List stagger | `staggerChildren: 0.06`, spring `stiffness 300, damping 28` |
| Bottom sheet open | Spring `stiffness 280, damping 32`, slides up from `y: 100%` |
| Bottom sheet close | Same spring, slides to `y: 100%` |
| Card row enter | `opacity 0→1, y 10→0`, spring `stiffness 300, damping 28` |
| Skeleton pulse | `opacity 1→0.3→1`, 1.5s ease-in-out infinite |

Reduced motion: skeleton animations are disabled via `@media (prefers-reduced-motion: reduce)`.

---

### Voice & Tone

- **Direct.** "Is this a good deal?" not "Discover whether this product represents value."
- **Confident.** State verdicts clearly: "Price Low — 6-month low."
- **Minimal.** No filler copy. Every word earns its space.
- **Friendly but not cute.** No emojis in UI copy.

---

### URL Structure

| Path | Page |
|------|------|
| `/` | Landing / Home |
| `/search` | Search (URL paste) |
| `/product/:id` | Product result + price history |
| `/dashboard` | Watchlist (auth required) |
| `/settings` | Account & notifications |
| `/upgrade` | Pro plan page |
| `/auth` | Sign in / Sign up |
| `/pricing` | Pricing page |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

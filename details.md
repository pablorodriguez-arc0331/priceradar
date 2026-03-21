# PriceRadar — Product & Brand Guide

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

PriceRadar uses a strict two-color system. No gradients, no brand accent colors.

| Token | Hex | Usage |
|-------|-----|-------|
| **Light** | `#FFFEFD` | Background, surfaces, cards, primary foreground-on-dark |
| **Dark** | `#1C1C1C` | Text, borders, buttons, icons, foreground |

All other values are opacity variants of these two:

| Usage | Value |
|-------|-------|
| Card border | `rgba(28, 28, 28, 0.12)` |
| Strong border | `rgba(28, 28, 28, 0.28)` |
| Subtle background | `rgba(28, 28, 28, 0.06)` |
| Glass background | `rgba(255, 254, 253, 0.94)` |
| Glass border | `rgba(28, 28, 28, 0.10)` |
| Skeleton / shimmer | `rgba(28, 28, 28, 0.07)` |
| Backdrop scrim | `rgba(28, 28, 28, 0.40)` |

There is no dark mode. The app is light-only with a warm near-white background.

---

### Typography

Two typefaces. Both from Google Fonts.

#### Josefin Sans — Display
- Used for: headings, product names, prices, stat labels, logo
- Weights: 300, 400, 500, 600, 700
- Class: `font-display`
- Feature: tabular numerals enabled on price figures (`font-variant-numeric: tabular-nums`)

#### Work Sans — Body
- Used for: all body copy, labels, UI text, navigation
- Weights: 300, 400, 500, 600 (italic 400)
- Class: `font-sans` (default)

#### Type Scale

| Token | Size | Line height |
|-------|------|-------------|
| `xs` | 0.875rem (12.25px) | 1.25rem |
| `sm` | 0.9375rem (13px) | 1.375rem |
| `base` | 1rem (14px) | 1.5rem |
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

A subtle paper grain is applied globally via a `body::after` pseudo-element — SVG `feTurbulence` fractalNoise at 3.8% opacity, tiling at 250×250px. It adds tactile depth without any external asset. `pointer-events: none`, `z-index: 9999`.

---

### Component Styles

#### Glass (header, modals, sheets)
```
background: rgba(255, 254, 253, 0.94)
backdrop-filter: blur(20px)
border: 1px solid rgba(28, 28, 28, 0.10)
box-shadow: 0 8px 32px rgba(28, 28, 28, 0.08)
```

#### Card
```
background: #FFFEFD
border: 1px solid rgba(28, 28, 28, 0.12)
box-shadow: 0 1px 3px rgba(28,28,28,0.06), 0 2px 10px rgba(28,28,28,0.04)
```

#### Interactive Card (hover lift)
Same as card + on hover:
```
transform: translateY(-2px)
border-color: rgba(28, 28, 28, 0.28)
box-shadow: 0 4px 20px rgba(28,28,28,0.10), 0 1px 4px rgba(28,28,28,0.06)
```

#### Bottom Navigation (liquid glass)
```
border-radius: 32px
background: rgba(255, 254, 253, 0.96)
border: 1px solid rgba(28, 28, 28, 0.10)
box-shadow: 0 4px 20px rgba(28,28,28,0.08), 0 1px 4px rgba(28,28,28,0.04)
position: fixed, 12px + safe-area above bottom edge
```

#### Primary Button
```
background: #1C1C1C
color: #FFFEFD
hover: #1C1C1C at 85% opacity
border-radius: 0.75rem
min-height: 44px (touch target)
```

---

### Icons & Assets

Navigation and key UI icons use PNG assets at 2048×2048px source, rendered at small sizes:

| Asset | Usage |
|-------|-------|
| `home.png` | Home tab |
| `search.png` | Search tab + search input field |
| `dashboard.png` | Watchlist tab |
| `user.png` | Account tab |
| `hot.png` | "Hot right now" section heading |

All other icons use **Lucide React** (outline style, consistent 1.5px stroke).

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

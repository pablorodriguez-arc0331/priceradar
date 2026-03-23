# PriceRadar — Brand Book
**Version 2.0 · 2026-03-23** — UI Overhaul: Deep Navy + Electric Cyan

---

## 1. Brand Identity

### 1.1 Mission
PriceRadar helps shoppers make better purchasing decisions by surfacing Amazon price history and live retailer comparisons in seconds. The product sits at the intersection of financial intelligence and effortless UX — making data-driven buying accessible to everyone.

### 1.2 Personality
| Trait | Description |
|---|---|
| **Precise** | Data is always accurate, formatted cleanly, never estimated without disclosure |
| **Calm** | No urgency dark patterns. Signals are honest, not manipulative |
| **Premium** | The experience feels high-quality — not enterprise SaaS, not consumer bargain-bin |
| **Accessible** | Complexity is hidden behind clean surfaces. One tap to a clear answer |

### 1.3 Tone of Voice
- **Short.** One idea per sentence. No filler.
- **Honest.** "Price is above average" not "This is a terrible deal!"
- **Confident.** State facts. Don't hedge unless genuinely uncertain.
- **Human.** Friendly without being cute. Never use exclamation points on error states.

**Examples:**

| Context | Wrong | Right |
|---|---|---|
| Empty watchlist | "You haven't added anything yet! 🎉 Start tracking now!" | "Your watchlist is empty. Add a product to get started." |
| Price is high | "🚨 WARNING: Overpriced!" | "Price is above average for this product" |
| Loading | "Hang tight, we're working on it!" | "Fetching price history…" |
| Error | "Oops! Something went wrong 😬" | "Could not load product. Please try again." |

---

## 2. Logo & Wordmark

### 2.1 Symbol
A **Radar icon** (`lucide-react → Radar`) enclosed in a square with `border-radius: 10px`.

```
Background:  rgba(6, 182, 212, 0.10)    — cyan-500 at 10%
Border:      rgba(6, 182, 212, 0.20)    — cyan-500 at 20%
Icon color:  #06B6D4                     — cyan accent
Icon size:   60% of container
Glow:        box-shadow: 0 0 12px rgba(6, 182, 212, 0.30)
```

### 2.2 Wordmark
```
Price  →  font-weight: 700, color: #F0F4FF
Radar  →  font-weight: 700, color: #06B6D4  (cyan accent)
Font:      Space Grotesk
Size:      1rem (nav), 1.5rem (auth/landing hero)
```

### 2.3 Clear Space
Minimum clear space around the logo equals the height of the `R` in "Radar" on all sides.

### 2.4 Don'ts
- Do not change the cyan accent to any other color
- Do not use the wordmark on light backgrounds
- Do not use the icon without the wordmark in product surfaces (exception: browser favicon, PWA icon)
- Do not distort proportions

---

## 3. Color System

> **Always-dark.** `prefers-color-scheme` is ignored. The app is always in dark mode.

### 3.1 Core Palette

| Token | Hex | Usage |
|---|---|---|
| `--background` | `#050D1A` | Page background — deep navy void |
| `--surface` | `#0A1628` | Card / panel surface |
| `--surface-raised` | `#0D1E36` | Elevated elements (dropdowns, sheets) |
| `--foreground` | `#F0F4FF` | Primary text — cool near-white |
| `--muted-foreground` | `#6B7FA3` | Secondary / helper text |
| `--destructive` | `#F43F5E` | Rose red — delete, error actions |
| `--ring` | `rgba(6,182,212,0.80)` | Focus ring (cyan) |

### 3.2 Accent — Electric Cyan
The brand's primary interactive color. Used for CTAs, active states, icons, borders, and focus rings.

| Token | Hex | Usage |
|---|---|---|
| `--accent` | `#06B6D4` | Primary cyan (buttons, active nav, highlights) |
| `--accent-hover` | `#22D3EE` | Cyan hover state |
| `--accent-subtle` | `rgba(6,182,212,0.10)` | Tinted backgrounds, ghost fills |

### 3.3 Borders

| Token | Value | Usage |
|---|---|---|
| `--border` | `rgba(6,182,212,0.12)` | Default hairline border |
| `--border-strong` | `rgba(6,182,212,0.24)` | Emphasized borders (focus, hover) |

### 3.4 Signal Colors
Price signals are the core output of PriceRadar. They have their own semantic palette, never to be reused for non-signal UI.

| Signal | Color | Hex | Meaning |
|---|---|---|---|
| `low` (Buy now) | Emerald | `#10B981` | Price is below average — good time to buy |
| `high` (Wait) | Rose red | `#F43F5E` | Price is above average — consider waiting |
| `neutral` (Average) | Slate | `#6B7FA3` | Price is at average — neither good nor bad |
| `no_data` | Muted | `#6B7FA3` | Insufficient data to form a signal |

Each signal color has background and border variants:
```
signal.low-bg:           rgba(16, 185, 129, 0.10)
signal.low-border:       rgba(16, 185, 129, 0.25)
signal.high-bg:          rgba(244, 63, 94, 0.10)
signal.high-border:      rgba(244, 63, 94, 0.25)
signal.neutral-bg:       rgba(107, 127, 163, 0.10)
signal.neutral-border:   rgba(107, 127, 163, 0.18)
```

### 3.5 Glass & Surface Tokens
```css
--card-bg:      rgba(10, 22, 40, 0.55)            /* navy glass card */
--card-border:  rgba(6, 182, 212, 0.10)            /* cyan hairline */
--card-shadow:  0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(6,182,212,0.06)

--glass-bg:     rgba(10, 22, 40, 0.65)             /* darker glass for header/modals */
--glass-border: rgba(6, 182, 212, 0.12)
--glass-shadow: 0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(6,182,212,0.08)
```

### 3.6 Contrast Ratios (WCAG 2.1 AA)

| Pair | Ratio | Result |
|---|---|---|
| `#F0F4FF` on `#050D1A` | 16.8:1 | ✅ AAA |
| `#06B6D4` on `#050D1A` | 4.6:1 | ✅ AA |
| `#10B981` (signal-low) on `#0A1628` | ≥ 4.5:1 | ✅ AA |
| Cyan border on dark bg | ≥ 3:1 | ✅ AA (UI components) |

### 3.7 Color Rules
- **Always dark.** No light mode. No `prefers-color-scheme` toggle.
- Never use blue-based accents (`#3B82F6`, `#60A5FA`) — the accent is electric cyan `#06B6D4`.
- Never use purple-to-blue hero gradients or rainbow fills.
- Gradients must be dark-on-dark or subtle cyan/violet radial glows.
- Never hardcode hex values in components — always use CSS variables or Tailwind tokens.
- The grain overlay (`opacity: 0.035`) sits permanently over all surfaces via `body::after`.

---

## 4. Typography

### 4.1 Type Stack

| Role | Family | Weights | Usage |
|---|---|---|---|
| **Display / Headings** | Space Grotesk | 400, 500, 600, 700 | `h1`–`h3`, price values, stat numbers, signal badge labels, logo |
| **Body / UI** | DM Sans | 400, 500, 600 | Body copy, helper text, nav labels, buttons, table data, everything else |
| **Monospace** | JetBrains Mono | 400, 500 | Prices (`.price` class), timestamps, numeric data |

Fonts loaded from Google Fonts with preconnect + preload + stylesheet:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style"
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap" />
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap" />
```

```css
font-display: 'Space Grotesk', system-ui, sans-serif   /* headings, prices, stats */
font-sans:    'DM Sans', system-ui, sans-serif           /* body default */
font-mono:    'JetBrains Mono', monospace               /* tabular prices */
```

### 4.2 Type Scale

| Step | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `display` | `clamp(2rem, 5vw, 3rem)` | tight | 700 | Hero headings (landing page) — Space Grotesk |
| `4xl` | `2.25rem` | `2.5rem` | 700 | Best price display on product page |
| `3xl` | `1.875rem` | `2.25rem` | 700 | Section heroes |
| `2xl` | `1.5rem` | `2rem` | 600 | Page titles |
| `xl` | `1.25rem` | `1.75rem` | 600 | Card headings |
| `lg` | `1.125rem` | `1.75rem` | 700 | Price values in cards |
| `base` | `1rem` | `1.5rem` | 400 | Body, descriptions — DM Sans |
| `sm` | `0.9375rem` | `1.375rem` | 500 | Labels, secondary content |
| `xs` | `0.875rem` | `1.25rem` | 400–500 | Metadata, timestamps, badges |

> Note: `html` base font is set to `14px` so Tailwind `text-base` = `14px` effectively.
> Form inputs are always `font-size: 16px` to prevent iOS zoom.

### 4.3 Type Rules
- **Headings use Space Grotesk.** `h1`, `h2`, `h3`, price values, stat numbers, badge labels.
- **Body uses DM Sans.** All other text — copy, labels, buttons, nav, table data.
- **Letter spacing:** `-0.02em` on headings. Normal on body.
- **Numeric data** (prices, counts, dates) always use the `.price` class — `JetBrains Mono` + `font-variant-numeric: tabular-nums`.
- **Heading weights:** 700 for hero/display, 600 for section headers, 500 for card titles.
- **Never use** Plus Jakarta Sans, Inter, Roboto, Arial, or `system-ui` as the primary font.
- **Anti-aliasing:** `-webkit-font-smoothing: antialiased` on all text.

---

## 5. Iconography

### 5.1 Library
**Lucide React** is the exclusive icon library. No Font Awesome, no Heroicons, no custom SVGs for functional icons, no emoji as icons.

### 5.2 Style Rules

| Property | Value |
|---|---|
| `strokeWidth` | `1.5` (refined, lightweight — default Lucide is `2`) |
| Style | Outline only. Filled variants only for active/selected states |
| Color | Always via `currentColor` / text color classes — never hardcoded |
| Accessibility | `aria-hidden="true"` on decorative icons; `aria-label` on icon-only buttons |
| Alignment | `items-center` + `gap-2` with adjacent text |

### 5.3 Size Scale

| Context | Class | px |
|---|---|---|
| Inline with body text | `h-4 w-4` | 16px |
| Nav / toolbar | `h-5 w-5` | 20px |
| Prominent actions | `h-6 w-6` | 24px |
| Hero / empty state | `h-8 w-8` | 32px |

### 5.4 Core Icon Set

```tsx
// Brand
import { Radar } from 'lucide-react'                   // Logo symbol

// Navigation
import { Home, Search, LayoutDashboard, User } from 'lucide-react'

// Actions
import { Plus, X, ChevronLeft, ArrowRight, MoreHorizontal } from 'lucide-react'
import { Bell, BellOff, Trash2, RefreshCw, Share2 } from 'lucide-react'

// Status
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Loader2, WifiOff } from 'lucide-react'

// Data
import { Clock, ExternalLink, Copy } from 'lucide-react'
```

### 5.5 Icon Button Pattern
```tsx
<motion.button
  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
  aria-label="Action description"
>
  <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
</motion.button>
```

---

## 6. Motion & Animation

### 6.1 Philosophy
Motion in PriceRadar communicates state, guides attention, and adds physicality. Every animation has a purpose. The feel is **spring-based** — never robotic tweens for interactions.

### 6.2 Spring Presets

| Use case | `stiffness` | `damping` | Description |
|---|---|---|---|
| Micro-interactions (tap, hover) | 400 | 20 | Snappy, immediate |
| Component transitions (cards, modals) | 300 | 28 | Balanced spring |
| Page / section reveals | 300 | 28 | Same as component |
| Layout animations (nav indicator) | 380 | 30 | Slightly bouncy |

```tsx
// Micro (hover/tap)
{ type: 'spring', stiffness: 400, damping: 20 }

// Component
{ type: 'spring', stiffness: 300, damping: 28 }

// Layout
{ type: 'spring', stiffness: 380, damping: 30 }
```

### 6.3 Entry Animations — Stagger Pattern
Used for lists, grids, and sequential reveals:

```tsx
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  exit:    { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
}
const item = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
}
```

### 6.4 Duration Budget

| Category | Range | Notes |
|---|---|---|
| Micro feedback (tap, hover) | 100–150ms | Spring (no explicit duration) |
| Component mount/exit | 200–300ms | Spring or ease-out |
| Page transitions | 300ms | Spring |
| Loading overlays / modals | 400–500ms | Ease `[0.16, 1, 0.3, 1]` on exit |
| Background blobs | 15–28s | Organic, looping |

> **Rule:** Never exceed 500ms for any user-initiated animation.

### 6.5 Hover States

```tsx
// Cards
whileHover={{ y: -2 }}
// Buttons
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.97 }}
// Icon buttons
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

### 6.6 AnimatePresence Rules
- `AnimatePresence` **always stays mounted** — wrap the conditional, never the other way around
- All direct children of `AnimatePresence` must have unique `key` props
- Use `mode="wait"` for view/tab swaps; `mode="sync"` for toast lists

### 6.7 Animated Background — Sound Flow Blobs
Used on the loading overlay and can be used on marketing/hero sections:

Five blobs at different sizes (180px–520px), positioned asymmetrically, each with:
- Slow drift via `x/y` keyframes (15–28s loops)
- Morphing `borderRadius` through organic shapes (e.g. `60% 40% 55% 45% / 50% 60% 40% 50%`)
- `filter: blur(40px)` for diffuse glow
- Colors: blue `rgba(59,130,246,0.13)`, white `rgba(255,255,255,0.06)`, emerald `rgba(16,185,129,0.09)`

### 6.8 Reduced Motion
Every animated component must respect `prefers-reduced-motion`:
```tsx
import { useReducedMotion } from 'framer-motion'
const shouldReduce = useReducedMotion()
// ...
animate={shouldReduce ? {} : { scaleY: [...] }}
```

---

## 7. Component Patterns

### 7.1 Cards

**Standard glass card:**
```tsx
<motion.div
  className="group relative overflow-hidden rounded-xl glass-card p-6"
  whileHover={{ y: -2 }}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
>
  {/* Hover glow overlay */}
  <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/[0.04] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
  {/* Content */}
</motion.div>
```

```css
.glass-card {
  background: rgba(10, 22, 40, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(6, 182, 212, 0.10);
  box-shadow: 0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(6,182,212,0.06);
}
```

**Interactive card (row / list item):**
```css
.glass-card-interactive {
  /* same as .glass-card + */
  transition: transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms ease, border-color 200ms ease;
}
.glass-card-interactive:hover {
  transform: translateY(-2px);
  border-color: rgba(6, 182, 212, 0.24);
  box-shadow: 0 0 30px -5px rgba(6,182,212,0.12), 0 4px 20px rgba(0,0,0,0.40);
}
```

### 7.2 Buttons

**Primary (cyan solid):**
```tsx
<motion.button
  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-background"
  style={{ boxShadow: 'none' }}
  whileHover={{ scale: 1.03, boxShadow: '0 0 16px rgba(6,182,212,0.35)' }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
>
  Get started
  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
</motion.button>
```

**Outline (glass border + cyan text):**
```tsx
className="rounded-full border border-[rgba(6,182,212,0.24)] bg-transparent px-4 py-2 text-sm text-accent hover:bg-[rgba(6,182,212,0.10)] hover:border-[rgba(6,182,212,0.40)]"
```

**Ghost:**
```tsx
className="rounded-full bg-transparent px-4 py-2 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
```

**Destructive:**
```tsx
className="text-muted-foreground hover:bg-[rgba(244,63,94,0.10)] hover:text-[#F43F5E]"
```

All buttons: `min-h-[44px] min-w-[44px]` (WCAG 2.5.5 touch targets).

### 7.3 Inputs
```tsx
className="w-full h-14 rounded-xl bg-surface border border-[rgba(6,182,212,0.12)] px-4 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(6,182,212,0.80)]"
```
- Focus ring: `ring-2` in cyan `rgba(6,182,212,0.80)` — never `outline: none` without a replacement
- Error state: rose border `border-[rgba(244,63,94,0.40)]`, `aria-invalid="true"`
- Disabled state: `opacity-50`, `pointer-events-none`

### 7.4 Skeleton / Loading
Skeletons use a horizontal shimmer with a cyan tint:
```css
.skeleton {
  border-radius: 0.375rem;
  background: linear-gradient(90deg,
    rgba(6, 182, 212, 0.04) 0%,
    rgba(6, 182, 212, 0.08) 40%,
    rgba(6, 182, 212, 0.04) 80%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.8s ease-in-out infinite;
  border: 1px solid rgba(6, 182, 212, 0.06);
}
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; background: rgba(6,182,212,0.06); }
}
```
Lists of skeletons must be wrapped in a stagger container (see §6.3).

### 7.5 Toasts (Notifications)
Four variants: `success`, `error`, `info`, `warning`

| Variant | Icon | Border |
|---|---|---|
| success | `CheckCircle2` — emerald-400 | `border-emerald-500/25` |
| error | `AlertCircle` — rose-400 | `border-[rgba(244,63,94,0.25)]` |
| info | `Info` — cyan (`#06B6D4`) | `border-[rgba(6,182,212,0.20)]` |
| warning | `AlertTriangle` — amber-400 | `border-amber-500/25` |

Toasts support an optional **action button** (e.g. "Undo", "Retry") — displayed as a cyan underlined link below the description. Default duration: 4 seconds.

Entry/exit: `x: 64 → 0`, spring `stiffness: 350, damping: 28`.

### 7.6 Navigation

**Bottom nav (mobile):**
- Floating pill: `border-radius: 32px`, `backdrop-blur: 20px`, `bg: rgba(10,22,40,0.90)`, `border: 1px solid rgba(6,182,212,0.10)`
- Active state: cyan text + icon + 2px cyan underline glow (no dot indicator)
  ```css
  color: #06B6D4;
  /* underline glow */
  box-shadow: 0 2px 8px rgba(6,182,212,0.40);
  ```
- Inactive: `color: #6B7FA3`
- Min tap target: `44×44px` on all items

**Desktop nav:**
- Active: `bg-[rgba(6,182,212,0.10)]`, `text-accent`
- Inactive: `text-muted-foreground hover:text-foreground hover:bg-surface`

### 7.7 Signal Badge
The primary output of a price analysis. Three states:

| Verdict | Label | Color | When to use |
|---|---|---|---|
| `low` | "Price Low" | Emerald `#10B981` | Price ≤ 30th percentile |
| `high` | "Price High" | Rose `#F43F5E` | Price ≥ 70th percentile |
| `neutral` | "Average Price" | Slate `#6B7FA3` | Price between 30th–70th percentile |

- Container: signal-colored glass pill with matching `box-shadow` glow
- Label: **Space Grotesk** medium weight
- Subtext: DM Sans `text-xs`
- Hero size badge has animated pulse ring on `low` state

---

## 8. Layout System

### 8.1 Grid
- **Mobile first** at 375px baseline
- Max content width: `1024px` (`max-w-5xl`) centered with `mx-auto`
- Page padding: `px-4` (mobile), `px-8` (desktop)
- Card grids: `grid-cols-2 gap-3` (mobile), `sm:grid-cols-3` (tablet+)

### 8.2 Spacing Scale
```
gap-2   →  8px   — between inline elements
gap-3   →  12px  — between list items
gap-4   →  16px  — section internal spacing
gap-5   →  20px  — between sections on a page
gap-6   →  24px  — between major layout blocks
p-3     →  12px  — minimum card padding
p-6     →  24px  — standard card padding
```

### 8.3 Border Radius Scale
```
sm:   calc(0.75rem - 8px)  = 4px   — badges, small chips
md:   calc(0.75rem - 4px)  = 8px   — buttons, input corners
lg:   0.75rem              = 12px  — cards (default)
xl:   calc(0.75rem + 4px)  = 16px  — modals, large cards
2xl:  calc(0.75rem + 8px)  = 20px  — hero cards
nav:  32px                          — floating bottom nav pill
```

### 8.4 Safe Areas (PWA / iOS)
All fixed/sticky elements respect `env(safe-area-inset-*)`:
- Header: `padding-top: calc(env(safe-area-inset-top, 0px) + 0.75em)`
- Bottom nav: `margin-bottom: calc(12px + env(safe-area-inset-bottom, 0px))`
- Page content: `padding-bottom: calc(120px + env(safe-area-inset-bottom, 0px))`
- Use `min-height: 100dvh` (not `100vh`) for full-screen layouts

### 8.5 Z-Index Stack
```
base content:   0
sticky header:  40
bottom nav:     40
modals/sheets:  50 (animate in)
loading overlay: 50
toast container: 50
grain overlay:  9999 (pointer-events: none)
```

---

## 9. Accessibility

### 9.1 Principles (Nielsen's Heuristics)
PriceRadar follows all 10 Nielsen usability heuristics:

1. **Visibility of system status** — All async operations show loading state. Refresh actually fetches. Progress bars reflect real phases.
2. **Match between system and real world** — Plain language. Prices in local currency. "Watchlist" not "tracked_products".
3. **User control and freedom** — Undo on all destructive actions (remove from watchlist). Skip button on loading overlays.
4. **Consistency and standards** — Lucide icons throughout. Identical hover/focus patterns on all interactive elements.
5. **Error prevention** — URL validation before API call. Form validation before submit.
6. **Recognition rather than recall** — Labels on all nav items. Context-appropriate empty states.
7. **Flexibility and efficiency** — Keyboard/hover alternatives to swipe gestures. Clipboard paste auto-submit.
8. **Aesthetic and minimalist design** — No decorative content that competes with data. Dark, clean surfaces.
9. **Help users recognize and recover from errors** — All error toasts include a Retry action. Error states have recovery CTAs.
10. **Help and documentation** — Inline hints on the search input explain how to use the product.

### 9.2 Focus Management
- Every interactive element has a `focus-visible:ring-2` with cyan `rgba(6,182,212,0.80)` ring, offset 2px
- `outline: none` is never used without a ring replacement
- Skip-to-content link is the first focusable element in the DOM
- `aria-current="page"` on active nav items
- `aria-live="polite"` on toast containers and loading overlays

### 9.3 ARIA Patterns
```tsx
// Navigation
<nav aria-label="Main navigation">
<button aria-current={active ? 'page' : undefined}>

// Status/feedback
<div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-label="Loading progress">
<div aria-live="polite" aria-label="Notifications">
<div role="alert">  /* for errors */

// Decorative
<Icon aria-hidden="true" />
<div aria-hidden="true">  /* visual-only elements */

// Interactive icons
<button aria-label="Remove from watchlist">
```

### 9.4 Color Contrast
- Primary text `#F0F4FF` on `#050D1A`: ratio **16.8:1** ✓ AAA
- Secondary text `#6B7FA3` on `#050D1A`: ratio **4.5:1** ✓ (WCAG AA)
- Signal green `#10B981` on `#0A1628`: ratio **4.6:1** ✓ (WCAG AA)
- Signal rose `#F43F5E` on `#0A1628`: ratio **4.5:1** ✓ (WCAG AA minimum)
- Cyan `#06B6D4` on `#050D1A`: ratio **4.6:1** ✓ (WCAG AA)

### 9.5 Touch Targets
All interactive elements have a minimum touch target of `44×44px` on mobile. Icon-only buttons use `h-9 w-9` (36px) with sufficient surrounding whitespace.

---

## 10. Surfaces & Visual Effects

### 10.1 Grain Texture
A permanent film-grain overlay sits over the entire app at `opacity: 0.035`. It adds perceived depth and prevents the dark backgrounds from feeling flat. It is implemented via `body::after` using an SVG `feTurbulence` filter, and is always `pointer-events: none` and `z-index: 9999`.

### 10.2 Glass Morphism
Used on all elevated surfaces: sticky header, cards, bottom sheet modals, floating nav. Medium intensity.

```css
/* Header / modals / sheets */
.glass {
  background: rgba(10, 22, 40, 0.65);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(6, 182, 212, 0.12);
  box-shadow: 0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(6,182,212,0.08);
}

/* Cards */
.glass-card {
  background: rgba(10, 22, 40, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(6, 182, 212, 0.10);
  box-shadow: 0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(6,182,212,0.06);
}

/* Bottom nav pill */
.liquid-glass-nav {
  border-radius: 32px;
  background: rgba(10, 22, 40, 0.90);
  border: 1px solid rgba(6, 182, 212, 0.10);
  box-shadow: 0 4px 24px rgba(0,0,0,0.50), 0 1px 4px rgba(0,0,0,0.30);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

The `inset 0 1px 0` top-edge glow gives cards a luminous "lifted" feel — this is the signature craft detail of the design system.

### 10.3 Glow Effects
Soft radial gradients are used behind key UI elements to create depth:

```css
/* Cyan glow — brand elements, active states */
box-shadow: 0 0 12px rgba(6, 182, 212, 0.30);

/* Button hover glow */
box-shadow: 0 0 16px rgba(6, 182, 212, 0.35);

/* Card hover glow */
box-shadow: 0 0 30px -5px rgba(6,182,212,0.12);

/* Radial background glow (loading overlay, GlassBackground) */
background: radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%);
```

### 10.3b Animated Background Blobs (GlassBackground)
Floating blobs behind all content — deep navy base with cyan + violet accents:

| Blob | Color | Opacity | Loop |
|---|---|---|---|
| 1 | Cyan `#06B6D4` | 0.15 | 20s |
| 2 | Violet `rgba(139,92,246)` | 0.10 | 24s + 8s delay |
| 3 | Deep cyan | 0.08 | 28s + 4s delay |

All blobs: `filter: blur(40px)`, `pointer-events: none`, `aria-hidden="true"`.

### 10.4 Product Image Thumbnails
Product images fill their container fully edge-to-edge (`object-cover`). No padding. Category-based Lucide icons are shown as fallback when the image is unavailable.

---

## 11. Data Display Conventions

### 11.1 Prices
- Always formatted as currency: `$1,299.00`
- Use `JetBrains Mono` + `tabular-nums` via the `.price` CSS class
- Never show `$0.00` — show "Unavailable" instead
- "Best price" is always the lowest across all retailers

### 11.2 Dates & Times
- Relative format for recency: "2 hours ago", "3 days ago" (via `formatRelativeTime`)
- ISO format for precision when needed

### 11.3 Percentages & Metrics
- All numeric metrics use `tabular-nums` to prevent layout shift
- Price percentile is expressed as a signal verdict, not a raw number (users see "Price Low", not "28th percentile")

### 11.4 Retailer Display
Retailers are displayed by human-readable name (Amazon, Walmart, Best Buy, Target, eBay, Costco), not by slug. Retailer dots use the `bg-zinc-800` color — no branded retailer colors.

---

## 12. Writing Guidelines for UI Copy

### 12.1 Button Labels
- **Primary CTA:** Verb + noun, present tense. "Check Price", "Track Product", "Set Alert"
- **Destructive:** Short and clear. "Remove", "Delete", "Cancel"
- **Secondary:** Neutral. "View page", "Skip", "Back"
- Never: "Click here", "Submit", "OK"

### 12.2 Empty States
Structure: **What's missing + Why it matters + What to do**

```
"Your watchlist is empty."
"Add products to track their price history and get alerts."
[Track a Product]  ← CTA button
```

### 12.3 Error Messages
Structure: **What happened + What to do**
- Use plain language, not technical errors
- Include a recovery action whenever possible
- Example: `"Could not load product. Check your connection and try again."` + Retry button

### 12.4 Loading Messages
Phase-appropriate and honest:
- Phase 1 (DB fetch): "Fetching price history…", "Reading product data…"
- Phase 2 (Gemini): "Comparing 5 retailers…", "Finding the best deal…"
- Never: "Almost there!", "Just a sec!"

### 12.5 Success Messages
Short, confirmatory. No exclamation points unless the achievement is genuinely exciting.
- "Added to watchlist" ✓
- "Alert set for $899.00" ✓
- "Removed from watchlist" + Undo action ✓

---

## 13. Technical Constraints

### 13.1 Stack
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion v11 |
| Icons | Lucide React |
| State | Zustand |
| Backend | Supabase (Postgres + Edge Functions) |
| AI Comparison | Google Gemini via `compare-prices` Edge Function |
| Build | Vite |
| Deployment | PWA (installable, offline-capable) |

### 13.2 Animation Rules for Engineers
- **Never animate** `width`, `height`, `margin`, or `padding` — only `transform` and `opacity`
- **Never use** `type: "tween"` for hover/tap micro-interactions
- **Always wrap** conditionally rendered animated elements in `AnimatePresence`
- **Always implement** `useReducedMotion()` in every component with significant animation
- **Never exceed** `500ms` for any user-initiated animation
- Spring physics, not `duration` — for interactions. Duration only for loading states and overlays.

### 13.3 Image Handling
- Product images are loaded with `loading="lazy"` except the first visible item (`eager`)
- All images use `object-cover` — no padding around thumbnails
- Fallback: category-based Lucide icon centered in the container

---

---

## 14. SEO & PWA

### Document Titles
Set via `useDocumentTitle(title)` hook in each page component:

| Route | Title |
|---|---|
| Landing | `PriceRadar — Is This Amazon Price a Good Deal?` |
| Search | `Check a Price — PriceRadar` |
| Product | `{product.name} — Price History & Comparison \| PriceRadar` |
| Dashboard | `My Watchlist — PriceRadar` |
| Settings | `Account Settings — PriceRadar` |

### PWA Manifest Colors

| Property | Value |
|---|---|
| `theme_color` | `#06B6D4` (cyan) |
| `background_color` | `#050D1A` (deep navy) |

---

*This brand book reflects the design system as implemented in PriceRadar v2.0+ (UI Overhaul). All tokens, patterns, and rules documented here are enforced in code via `tailwind.config.ts`, `src/index.css`, and the component library in `src/components/`.*

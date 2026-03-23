# PriceRadar — Brand Book
**Version 1.0 · 2026**

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
Background:  rgba(59, 130, 246, 0.10)   — blue-500 at 10%
Border:      rgba(59, 130, 246, 0.20)   — blue-500 at 20%
Icon color:  #60A5FA                     — blue-400
Icon size:   60% of container
Glow:        box-shadow: 0 0 12px rgba(59, 130, 246, 0.20)
```

### 2.2 Wordmark
```
Price  →  font-weight: 700, color: #FAFAFA
Radar  →  font-weight: 700, color: #60A5FA  (blue-400)
Font:      Plus Jakarta Sans
Size:      1rem (nav), 1.5rem (auth/landing hero)
```

### 2.3 Clear Space
Minimum clear space around the logo equals the height of the `R` in "Radar" on all sides.

### 2.4 Don'ts
- Do not change the blue accent to any other color
- Do not use the wordmark on light backgrounds
- Do not use the icon without the wordmark in product surfaces (exception: browser favicon, PWA icon)
- Do not distort proportions

---

## 3. Color System

### 3.1 Core Palette

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--background` | `#09090B` | `240 10% 4%` | Page background |
| `--surface` | `#18181B` | `240 4% 10%` | Card base, popover |
| `--surface-elevated` | `#27272A` | `240 4% 16%` | Elevated cards, inputs, modals |
| `--foreground` | `#FAFAFA` | `0 0% 98%` | Primary text |
| `--muted-foreground` | `#A1A1AA` | `240 5% 64%` | Secondary text, placeholders |
| `--border` | `rgba(255,255,255,0.06)` | — | Default border |
| `--border-strong` | `rgba(255,255,255,0.12)` | — | Hover/active border |
| `--primary` | `#FFFFFF` | `0 0% 100%` | CTA buttons, active state fills |
| `--ring` | `#FFFFFF` | `0 0% 100%` | Focus ring (80% opacity) |
| `--destructive` | `#EF4444` | `0 84% 60%` | Delete, error, destructive actions |

### 3.2 Accent Blue
The brand's interactive color. Used for the logo, waveform bars, active nav indicators, focus highlights, and progress bars.

| Shade | Hex | Usage |
|---|---|---|
| `blue-400` | `#60A5FA` | Logo accent, active nav dot |
| `blue-500` | `#3B82F6` | Waveform, progress bar, glow effects |
| `blue-500/10` | `rgba(59,130,246,0.10)` | Logo badge background |
| `blue-500/08` | `rgba(59,130,246,0.08)` | Background glow blob |

### 3.3 Signal Colors
Price signals are the core output of PriceRadar. They have their own semantic palette, never to be reused for non-signal UI.

| Signal | Color | Hex | Meaning |
|---|---|---|---|
| `low` (Buy now) | Emerald | `#10B981` | Price is below average — good time to buy |
| `high` (Wait) | Red | `#EF4444` | Price is above average — consider waiting |
| `neutral` (Average) | Zinc | `#A1A1AA` | Price is at average — neither good nor bad |
| `no_data` | Zinc-600 | `#52525B` | Insufficient data to form a signal |

Each signal color has a background and border variant:
```
signal.low-bg:          rgba(16, 185, 129, 0.10)
signal.low-border:      rgba(16, 185, 129, 0.25)
signal.high-bg:         rgba(239, 68, 68, 0.10)
signal.high-border:     rgba(239, 68, 68, 0.25)
signal.neutral-bg:      rgba(161, 161, 170, 0.08)
signal.neutral-border:  rgba(161, 161, 170, 0.18)
```

### 3.4 Glass & Surface Tokens
```css
--card-bg:      rgba(24, 24, 27, 0.80)    /* 80% opacity zinc-900 */
--card-border:  rgba(255, 255, 255, 0.06) /* 6% white */
--card-shadow:  0 1px 3px rgba(0,0,0,0.40), 0 2px 10px rgba(0,0,0,0.25)

--glass-bg:     rgba(9, 9, 11, 0.85)      /* 85% background for header/modals */
--glass-border: rgba(255, 255, 255, 0.06)
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.40)
```

### 3.5 Color Rules
- **Dark mode is the only mode.** There is no light mode implementation.
- Never use saturated gradients (no purple-to-blue hero gradients, no rainbow fills).
- Gradients must be dark-on-dark or a very subtle blue radial glow.
- Never hardcode hex values in components — always use CSS variables or Tailwind tokens.
- The grain overlay (`opacity: 0.035`) sits permanently over all surfaces via `body::after`.

---

## 4. Typography

### 4.1 Type Stack

| Role | Family | Weights | Usage |
|---|---|---|---|
| **Display / Body** | Plus Jakarta Sans | 300, 400, 500, 600, 700 | All UI text, headings, labels |
| **Monospace** | JetBrains Mono | 400, 500 | Prices, timestamps, numeric data |

Both fonts are loaded from Google Fonts with `display=swap`.

### 4.2 Type Scale

| Step | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `display` | `clamp(2rem, 5vw, 3rem)` | tight | 700 | Hero headings (landing page) |
| `4xl` | `2.25rem` | `2.5rem` | 700 | Best price display on product page |
| `3xl` | `1.875rem` | `2.25rem` | 700 | Section heroes |
| `2xl` | `1.5rem` | `2rem` | 600 | Page titles |
| `xl` | `1.25rem` | `1.75rem` | 600 | Card headings |
| `lg` | `1.125rem` | `1.75rem` | 700 | Price values in cards |
| `base` | `1rem` | `1.5rem` | 400 | Body, descriptions |
| `sm` | `0.9375rem` | `1.375rem` | 500 | Labels, secondary content |
| `xs` | `0.875rem` | `1.25rem` | 400–500 | Metadata, timestamps, badges |

> Note: `html` base font is set to `14px` so Tailwind `text-base` = `14px` effectively.
> Form inputs are always `font-size: 16px` to prevent iOS zoom.

### 4.3 Type Rules
- **Letter spacing:** `-0.02em` on headings. Normal on body.
- **Numeric data** (prices, counts, dates) always use the `.price` class which applies `JetBrains Mono` + `font-variant-numeric: tabular-nums`.
- **Heading weights:** 700 for hero/display, 600 for section headers, 500 for card titles.
- **Never use Inter, Roboto, Arial, or `system-ui`** as the primary font.
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
  className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-900/80 p-6 backdrop-blur-sm"
  whileHover={{ y: -2 }}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
>
  {/* Hover glow overlay */}
  <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
  {/* Content */}
</motion.div>
```

**Interactive card (row / list item):**
```css
.glass-card-interactive:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 30px -5px rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.40);
}
```

### 7.2 Buttons

**Primary (white):**
```tsx
<motion.button
  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm"
  whileHover={{ scale: 1.03 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
>
  Get started
  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
</motion.button>
```

**Secondary / Ghost:**
```tsx
className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 hover:border-white/[0.14] hover:text-white"
```

**Destructive:**
```tsx
className="text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
```

### 7.3 Inputs
```tsx
className="w-full h-14 rounded-xl bg-zinc-900/90 border border-white/[0.06] px-4 text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
```
- Focus state uses `ring-2 ring-white/40` — never `outline: none` without a replacement
- Error state: red border `border-red-500/40`, `aria-invalid="true"`
- Disabled state: `opacity-50`, `pointer-events-none`

### 7.4 Skeleton / Loading
Skeletons use a horizontal shimmer (not opacity pulse):
```css
.skeleton {
  background: linear-gradient(90deg,
    rgba(255,255,255,0.05) 0%,
    rgba(255,255,255,0.10) 40%,
    rgba(255,255,255,0.05) 80%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.8s ease-in-out infinite;
  border: 1px solid rgba(255,255,255,0.04);
}
```
Lists of skeletons must be wrapped in a stagger container (see §6.3).

### 7.5 Toasts (Notifications)
Four variants: `success`, `error`, `info`, `warning`

| Variant | Icon | Border |
|---|---|---|
| success | `CheckCircle2` — emerald-400 | `border-emerald-500/25` |
| error | `AlertCircle` — red-400 | `border-red-500/25` |
| info | `Info` — blue-400 | `border-white/[0.08]` |
| warning | `AlertTriangle` — amber-400 | `border-amber-500/25` |

Toasts support an optional **action button** (e.g. "Undo", "Retry") — displayed as a blue underlined link below the description. Default duration: 4 seconds.

Entry/exit: `x: 64 → 0`, spring `stiffness: 350, damping: 28`.

### 7.6 Navigation

**Bottom nav (mobile):**
- Floating pill: `border-radius: 32px`, `backdrop-blur: 20px`, `bg: rgba(24,24,27,0.90)`
- Active indicator: `h-0.5 w-5 rounded-full bg-blue-400` sliding with `layoutId="nav-indicator"`
- Active icon: `strokeWidth: 2`, `text-zinc-50`
- Inactive icon: `strokeWidth: 1.5`, `text-zinc-500`
- Min tap target: `44×44px` on all items

**Desktop nav:**
- Active: `bg-white/[0.08]`, `text-zinc-50`
- Inactive: `text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]`

### 7.7 Signal Badge
The primary output of a price analysis. Three states:

| Verdict | Label | Color | When to use |
|---|---|---|---|
| `low` | "Price Low" | Emerald `#10B981` | Price ≤ 30th percentile |
| `high` | "Price High" | Red `#EF4444` | Price ≥ 70th percentile |
| `neutral` | "Average Price" | Zinc `#A1A1AA` | Price between 30th–70th percentile |

Hero size badge has animated pulse ring on `low` state.

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
- Every interactive element has a `focus-visible:ring-2 focus-visible:ring-white/40` style
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
- Primary text `#FAFAFA` on `#09090B`: ratio **17.9:1** ✓
- Secondary text `#A1A1AA` on `#09090B`: ratio **5.7:1** ✓ (WCAG AA)
- Signal green `#10B981` on `#18181B`: ratio **4.6:1** ✓ (WCAG AA)
- Signal red `#EF4444` on `#18181B`: ratio **4.5:1** ✓ (WCAG AA minimum)
- Blue-400 `#60A5FA` on `#09090B`: ratio **7.2:1** ✓

### 9.5 Touch Targets
All interactive elements have a minimum touch target of `44×44px` on mobile. Icon-only buttons use `h-9 w-9` (36px) with sufficient surrounding whitespace.

---

## 10. Surfaces & Visual Effects

### 10.1 Grain Texture
A permanent film-grain overlay sits over the entire app at `opacity: 0.035`. It adds perceived depth and prevents the dark backgrounds from feeling flat. It is implemented via `body::after` using an SVG `feTurbulence` filter, and is always `pointer-events: none` and `z-index: 9999`.

### 10.2 Glass Morphism
Used **only** on elevated surfaces: the sticky header, bottom sheet modals, and the floating nav. Not used on cards in the main content flow (glass is reserved for layers above content).

```css
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
background: rgba(9, 9, 11, 0.85);
border: 1px solid rgba(255, 255, 255, 0.06);
```

### 10.3 Glow Effects
Soft radial gradients are used behind key UI elements to create depth:

```css
/* Blue glow — brand elements, waveforms */
box-shadow: 0 0 12px rgba(59, 130, 246, 0.20);

/* White glow — card hover state */
box-shadow: 0 0 30px -5px rgba(255,255,255,0.08);

/* Radial background glow (loading overlay) */
background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
```

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

*This brand book reflects the design system as implemented in PriceRadar v2.2+. All tokens, patterns, and rules documented here are enforced in code via `tailwind.config.ts`, `src/index.css`, and the component library in `src/components/`.*

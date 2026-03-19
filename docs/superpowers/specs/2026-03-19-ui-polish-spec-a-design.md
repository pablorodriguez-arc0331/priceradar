# PriceRadar UI Polish — Spec A Design
**Date:** 2026-03-19
**Status:** Approved
**Scope:** Font sizes, dark/light mode toggle, liquid glass nav, Font Awesome (selective)

---

## 1. Goals

1. Raise minimum font size to 14px — no text renders smaller than 14px.
2. Add a user-toggled **dark/light mode** — default dark, light is warm neutral.
3. Redesign the bottom nav as a **floating liquid glass pill** (native iOS aesthetic).
4. Replace navigation/UI icons with **Font Awesome Free** (React integration); keep Lucide for product/data/chart icons.

---

## 2. Font Sizes

### 2.1 Scale Changes

Only the bottom two tokens change:

| Token | Before | After |
|---|---|---|
| `text-xs` | `0.75rem` (12px) | `0.875rem` (14px) |
| `text-sm` | `0.875rem` (14px) | `0.9375rem` (15px) |
| `text-base` | `1rem` (16px) | `1rem` (16px, unchanged) |
| All larger tokens | unchanged | unchanged |

**Impact:** All helper text, labels, and secondary copy currently using `text-xs` will render at 14px (minimum). Primary UI text at `text-sm`/`text-base` meets the 16px average target.

**File:** `tailwind.config.ts` — update `fontSize.xs` and `fontSize.sm` values only.

---

## 3. Dark / Light Mode

### 3.1 Architecture

- A `ThemeProvider` component wraps the app in `src/main.tsx`, reads from `useThemeStore`, and sets `data-theme="dark"` or `data-theme="light"` on `<html>`.
- `useThemeStore` is a new Zustand slice (added to `src/store/index.ts`) with:
  - `theme: 'dark' | 'light'`
  - `toggleTheme()` action
  - Persisted to `localStorage` key `'price-radar-theme'`
  - Default: `'dark'`
- `src/index.css` gains a `[data-theme="light"] :root { ... }` block overriding color tokens.
- No `prefers-color-scheme` media query — the user's explicit preference always wins.

### 3.2 Light Mode Color Tokens

Applied under `[data-theme="light"] :root`:

| Token | Light Value | Notes |
|---|---|---|
| `--background` | `222 22% 98%` → `#FAFAF8` | Warm off-white |
| `--surface` | `0 0% 100%` → `#FFFFFF` | Pure white |
| `--surface-raised` | `40 10% 95%` → `#F5F4F0` | Warm light gray |
| `--foreground` | `230 40% 14%` → `#1A1A2E` | Dark navy text |
| `--card` | same as `--surface` | |
| `--card-foreground` | same as `--foreground` | |
| `--popover` | same as `--surface` | |
| `--popover-foreground` | same as `--foreground` | |
| `--muted` | `40 10% 95%` | Warm light surface |
| `--muted-foreground` | `220 9% 46%` → `#6B7280` | Medium gray |
| `--primary` | `190 96% 43%` → `#06B6D4` | Unchanged |
| `--primary-foreground` | `0 0% 100%` → white | |
| `--accent` | `190 96% 43%` → `#06B6D4` | Unchanged |
| `--accent-foreground` | `0 0% 100%` | |
| `--accent-hover` | `190 80% 55%` → `#22D3EE` | Unchanged |
| `--secondary` | `40 10% 92%` | |
| `--secondary-foreground` | `230 40% 14%` | |
| `--destructive` | `345 80% 50%` | Slightly deeper on white |
| `--destructive-foreground` | `0 0% 100%` | |
| `--ring` | `190 96% 43%` | Unchanged |
| `--signal-low` | `160 70% 38%` | Slightly deeper green on white |
| `--signal-high` | `345 80% 50%` | Slightly deeper red on white |
| `--signal-neutral` | `220 9% 46%` | |

Alpha/rgba tokens (static, not hsl-wrapped in Tailwind):

| Token (Tailwind static) | Light Value |
|---|---|
| `border` | `rgba(0, 0, 0, 0.08)` |
| `border-strong` | `rgba(0, 0, 0, 0.15)` |
| `input` | `rgba(0, 0, 0, 0.08)` |
| `accent.subtle` | `rgba(6, 182, 212, 0.10)` (unchanged) |
| `signal['low-bg']` | `rgba(16, 185, 129, 0.10)` |
| `signal['low-border']` | `rgba(16, 185, 129, 0.25)` |
| `signal['high-bg']` | `rgba(244, 63, 94, 0.10)` |
| `signal['high-border']` | `rgba(244, 63, 94, 0.25)` |
| `signal['neutral-bg']` | `rgba(107, 127, 163, 0.10)` |
| `signal['neutral-border']` | `rgba(107, 127, 163, 0.20)` |

**Note:** Alpha tokens in `tailwind.config.ts` are static `rgba()` values and cannot be overridden by CSS custom properties. A `[data-theme="light"]` CSS-only override handles the border/input tokens via direct CSS; Tailwind class overrides (where opacity modifiers are used) are not affected in practice since signal-bg/border are used as solid backgrounds, not with further opacity modification.

### 3.3 Glass Tokens (Light Mode)

Override in `[data-theme="light"] :root`:

```css
--glass-bg:     rgba(255, 255, 255, 0.65);
--glass-border: rgba(0, 0, 0, 0.08);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.80);
```

### 3.4 Theme Toggle Button

- Location: Header, right side, before the user avatar/sign-in button.
- Icon: Font Awesome `faMoon` (in dark mode) / `faSun` (in light mode).
- Styling: ghost button, `h-8 w-8`, `text-muted-foreground hover:text-foreground`.
- No label — icon only with `aria-label="Switch to light mode"` / `"Switch to dark mode"`.

**File:** `src/store/index.ts` (add theme slice), `src/components/common/ThemeProvider.tsx` (new), `src/main.tsx` (wrap with ThemeProvider), `src/index.css` (add light token block), `src/components/layout/index.tsx` (add toggle button).

---

## 4. Liquid Glass Nav

### 4.1 Visual Specification

The bottom nav becomes a **floating pill** that detaches from screen edges:

```css
/* Pill shape */
border-radius: 32px;
margin: 0 16px;
margin-bottom: calc(12px + env(safe-area-inset-bottom, 0px));

/* Liquid glass */
backdrop-filter: blur(40px) saturate(180%);
-webkit-backdrop-filter: blur(40px) saturate(180%);

/* Dark mode */
background: rgba(8, 18, 36, 0.60);
border: 1px solid rgba(255, 255, 255, 0.14);
box-shadow:
  0 8px 32px rgba(0, 0, 0, 0.28),
  0 2px 8px rgba(0, 0, 0, 0.16),
  inset 0 1px 0 rgba(255, 255, 255, 0.18);

/* Light mode */
background: rgba(255, 255, 255, 0.72);
border: 1px solid rgba(0, 0, 0, 0.07);
box-shadow:
  0 8px 32px rgba(0, 0, 0, 0.12),
  0 2px 8px rgba(0, 0, 0, 0.08),
  inset 0 1px 0 rgba(255, 255, 255, 0.90);
```

### 4.2 Layout Changes

- Remove `.glass` utility class from `<nav>` — replaced with inline styles / a new `.liquid-glass-nav` component class.
- Nav no longer spans full `inset-x-0` — it becomes `left-4 right-4 bottom-0` fixed positioned with the margin-bottom above.
- Page bottom padding (`pb-nav`, `--page-bottom-pad`) updates to `calc(80px + env(safe-area-inset-bottom, 0px))` — accounting for pill height (56px) + 12px gap + 12px extra clearance + safe area.
- The nav pill sits above the screen edge, so content scrolls fully behind it.

### 4.3 Tab Labels

- Always visible (maintains accessibility / WCAG 2.1).
- Font size: `11px` (was `10px` — inherits minimum font size bump).
- Active tab: cyan text + existing glow underline.
- Inactive tab: muted-foreground.

**File:** `src/components/layout/index.tsx` (BottomNav + CSS), `src/index.css` (new `.liquid-glass-nav` class with light/dark variants).

---

## 5. Font Awesome (Selective)

### 5.1 Installation

```bash
npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons @fortawesome/fontawesome-svg-core
```

### 5.2 FaIcon Wrapper

A thin wrapper in `src/components/ui/FaIcon.tsx` normalizes sizing and className:

```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

interface FaIconProps {
  icon: IconDefinition
  className?: string
  'aria-hidden'?: boolean | 'true' | 'false'
}

export function FaIcon({ icon, className, ...props }: FaIconProps) {
  return <FontAwesomeIcon icon={icon} className={className} {...props} />
}
```

### 5.3 Icon Replacement Map

| Component / Location | Lucide Icon | FA Replacement |
|---|---|---|
| `BottomNav` | `Home` | `faHouse` |
| `BottomNav` | `Search` | `faMagnifyingGlass` |
| `BottomNav` | `LayoutDashboard` | `faTableCells` |
| `BottomNav` | `User` (nav) | `faUser` |
| `Header` (offline) | `WifiOff` | `faWifi` (rendered with `opacity-50` + `line-through` decoration via wrapper span, or swap to `faTriangleExclamation` if styling proves awkward) |
| `Header` theme toggle | — (new) | `faMoon` / `faSun` |
| `Header` user avatar fallback | `User` | `faUser` |
| `ProductResultPage` | `Bell` / `BellOff` | `faBell` / `faBellSlash` |
| `ProductResultPage` | `Share2` | `faShareNodes` |
| `ProductResultPage` back | `ChevronLeft` | `faChevronLeft` |
| `PriceComparisonTable` | `Lock` | `faLock` |
| `PriceComparisonTable` | `ExternalLink` | `faArrowUpRightFromSquare` |
| `SearchPage` | `Trash2` | `faTrashCan` |
| `SearchPage` | `Clock` | `faClock` |
| `DashboardPage` | `RefreshCw` | `faRotate` |
| `DashboardPage` | `LayoutGrid` | `faBorderAll` |
| `DashboardPage` | `List` | `faList` |
| `AuthPage` | `Eye` / `EyeOff` | `faEye` / `faEyeSlash` |
| `AuthPage` | `Mail` | `faEnvelope` |
| `LandingPage` trust | `ShieldCheck` | `faShieldHalved` |
| `ProductResultPage` | `Clock` | `faClock` |

### 5.4 Icons That Stay Lucide

| Icon | Reason |
|---|---|
| `Radar` | No FA equivalent — used as brand logo |
| `TrendingDown`, `TrendingUp`, `Minus` | Data/chart semantic — Lucide's style fits better |
| `ArrowRight` | Used in step illustrations |
| `Package`, `Laptop`, `Smartphone`, and all other category icons | Product/data domain — Lucide's minimal style preferred |
| `HelpCircle` | Signal badge — keep consistent with other signal icons |

---

## 6. Files to Change

| File | Change |
|---|---|
| `tailwind.config.ts` | Update `xs` and `sm` font sizes |
| `src/index.css` | Add `[data-theme="light"] :root` token block; add `.liquid-glass-nav` class |
| `src/store/index.ts` | Add `useThemeStore` slice with `theme` + `toggleTheme` + localStorage persist |
| `src/components/common/ThemeProvider.tsx` | New — reads theme store, sets `data-theme` on `<html>` |
| `src/components/common/index.ts` | Export `ThemeProvider` |
| `src/main.tsx` | Wrap `<App />` with `<ThemeProvider>` |
| `src/components/ui/FaIcon.tsx` | New — thin FA wrapper |
| `src/components/layout/index.tsx` | Liquid glass nav; theme toggle button in Header; FA icons in BottomNav/Header |
| `src/pages/ProductResultPage.tsx` | FA icons (Bell, BellOff, Share2, ChevronLeft, Clock) |
| `src/components/product/PriceComparisonTable.tsx` | FA icons (Lock, ExternalLink) |
| `src/pages/SearchPage.tsx` | FA icons (Trash2, Clock) |
| `src/pages/DashboardPage.tsx` | FA icons (RefreshCw, LayoutGrid, List) |
| `src/pages/AuthPage.tsx` | FA icons (Eye, EyeOff, Mail) |
| `src/pages/LandingPage.tsx` | FA icon (ShieldCheck → faShieldHalved) |

---

## 7. Out of Scope

- Backend / Supabase changes
- Spec B features (hot right now, personal search history)
- PWA icon regeneration
- Font changes (Space Grotesk + DM Sans remain)
- Any page layout or structural changes

---

## 8. Success Criteria

- [ ] No text renders below 14px anywhere in the app
- [ ] Dark mode is the default; toggling persists across sessions
- [ ] Light mode renders warm neutral palette with full contrast compliance
- [ ] Bottom nav floats as a pill with frosted glass on both themes
- [ ] All listed navigation/UI icons replaced with Font Awesome Free
- [ ] `Radar` and data icons remain Lucide
- [ ] Build passes with zero TypeScript errors

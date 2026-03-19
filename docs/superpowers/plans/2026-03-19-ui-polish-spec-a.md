# UI Polish Spec A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise minimum font size to 14px, add user-toggled dark/light mode, convert the bottom nav to a floating liquid-glass pill, and replace nav/UI icons with Font Awesome Free.

**Architecture:** Font size is a two-token Tailwind change. Theme is a Zustand slice + CSS `[data-theme="light"]` override block + a `ThemeProvider` component that sets the attribute on `<html>`. The nav becomes a fixed-position pill with its own `.liquid-glass-nav` CSS class. Font Awesome icons are installed and wrapped in a thin `FaIcon` component, then swapped in per-file.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v3, Zustand (persist middleware), Font Awesome Free (`@fortawesome/react-fontawesome`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/fontawesome-svg-core`), Vite.

**Spec:** `docs/superpowers/specs/2026-03-19-ui-polish-spec-a-design.md`

---

## File Map

| Action | Path | What changes |
|--------|------|--------------|
| Modify | `tailwind.config.ts` | `fontSize.xs` → 14px, `fontSize.sm` → 15px |
| Modify | `src/index.css` | Add `[data-theme="light"] :root` block + `.liquid-glass-nav` class + update `--page-bottom-pad` |
| Modify | `src/store/index.ts` | Add `useThemeStore` slice with persist |
| **Create** | `src/components/common/ThemeProvider.tsx` | Reads store, sets `data-theme` on `<html>` |
| Modify | `src/components/common/index.tsx` | Export `ThemeProvider` |
| Modify | `src/main.tsx` | Wrap `<App />` with `<ThemeProvider>` |
| **Create** | `src/components/ui/FaIcon.tsx` | Thin FontAwesomeIcon wrapper |
| Modify | `src/components/layout/index.tsx` | Liquid glass nav CSS; theme toggle button in Header; FA icons in BottomNav + Header |
| Modify | `src/pages/ProductResultPage.tsx` | FA: Bell, BellOff, Share2→ShareNodes, ChevronLeft, Clock |
| Modify | `src/components/product/PriceComparisonTable.tsx` | FA: Lock, ExternalLink→ArrowUpRightFromSquare |
| Modify | `src/pages/SearchPage.tsx` | FA: Trash2→TrashCan, Clock |
| Modify | `src/pages/DashboardPage.tsx` | FA: RefreshCw→Rotate, LayoutGrid→BorderAll, List |
| Modify | `src/pages/AuthPage.tsx` | FA: Eye, EyeOff→EyeSlash, Mail→Envelope |
| Modify | `src/pages/LandingPage.tsx` | FA: ShieldCheck→ShieldHalved |

---

## Task 1: Install Font Awesome packages

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install FA packages**

```bash
npm install @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons @fortawesome/fontawesome-svg-core
```

- [ ] **Step 2: Verify install**

```bash
npm ls @fortawesome/react-fontawesome
```
Expected: prints `@fortawesome/react-fontawesome@x.x.x` with no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install Font Awesome Free packages"
```

---

## Task 2: Font size token bump

**Files:**
- Modify: `tailwind.config.ts` lines 78–79

Current values:
```ts
xs:    ['0.75rem',  { lineHeight: '1rem' }],
sm:    ['0.875rem', { lineHeight: '1.25rem' }],
```

- [ ] **Step 1: Update `tailwind.config.ts` font sizes**

Replace those two lines with:
```ts
xs:    ['0.875rem',   { lineHeight: '1.25rem' }],
sm:    ['0.9375rem',  { lineHeight: '1.375rem' }],
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```
Expected: no TypeScript errors, `dist/` updated.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: raise minimum font size — xs=14px, sm=15px"
```

---

## Task 3: Theme store slice

**Files:**
- Modify: `src/store/index.ts` — append `useThemeStore` after the last store

- [ ] **Step 1: Append theme slice to `src/store/index.ts`**

Add at the very end of the file:

```ts
// ─── Theme Store ───────────────────────────────────────────────────────────────
type Theme = 'dark' | 'light'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark' as Theme,
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
    }),
    {
      name: 'price-radar-theme',
    },
  ),
)
```

Note: `create` and `persist` are already imported at the top of the file — no new imports needed.

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/store/index.ts
git commit -m "feat: add useThemeStore with dark/light toggle + localStorage persist"
```

---

## Task 4: ThemeProvider component + wire into main.tsx

**Files:**
- Create: `src/components/common/ThemeProvider.tsx`
- Modify: `src/components/common/index.tsx` — add export line
- Modify: `src/main.tsx` — wrap `<App />`

- [ ] **Step 1: Create `src/components/common/ThemeProvider.tsx`**

```tsx
import { useEffect } from 'react'
import { useThemeStore } from '@/store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore(s => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <>{children}</>
}
```

- [ ] **Step 2: Export from `src/components/common/index.tsx`**

Add this line at the top (after the existing GlassBackground export):
```ts
export { ThemeProvider } from './ThemeProvider'
```

- [ ] **Step 3: Wrap `<App />` in `src/main.tsx`**

Replace the current file content with:
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { ThemeProvider } from './components/common'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/common/ThemeProvider.tsx src/components/common/index.tsx src/main.tsx
git commit -m "feat: ThemeProvider sets data-theme on html element"
```

---

## Task 5: Light mode CSS token block + liquid glass nav CSS

**Files:**
- Modify: `src/index.css` — add `[data-theme="light"]` block + `.liquid-glass-nav` class + update `--page-bottom-pad`

- [ ] **Step 1: Add light mode token override block**

In `src/index.css`, add this block **after the closing `}` of `@layer base { :root { ... } }` block** (after line 107, before the `/* ─── PWA Safe Area ─── */` comment):

```css
/* ─── Light Mode Tokens ─── */
:root[data-theme="light"] {
  --background:          222 22% 98%;
  --surface:             0 0% 100%;
  --surface-raised:      40 10% 95%;
  --foreground:          230 40% 14%;
  --card:                0 0% 100%;
  --card-foreground:     230 40% 14%;
  --popover:             0 0% 100%;
  --popover-foreground:  230 40% 14%;
  --primary:             190 96% 43%;
  --primary-foreground:  0 0% 100%;
  --accent:              190 96% 43%;
  --accent-foreground:   0 0% 100%;
  --accent-hover:        190 80% 55%;
  --secondary:           40 10% 92%;
  --secondary-foreground: 230 40% 14%;
  --muted:               40 10% 95%;
  --muted-foreground:    220 9% 46%;
  --destructive:         345 80% 50%;
  --destructive-foreground: 0 0% 100%;
  --ring:                190 96% 43%;
  --signal-low:          160 70% 38%;
  --signal-high:         345 80% 50%;
  --signal-neutral:      220 9% 46%;

  /* Glass tokens — light */
  --glass-bg:     rgba(255, 255, 255, 0.65);
  --glass-border: rgba(0, 0, 0, 0.08);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.80);
}

/* Light mode body background (rgba-based, can't use CSS var) */
:root[data-theme="light"] body {
  background-color: #FAFAF8;
}
```

- [ ] **Step 2: Update `--page-bottom-pad` to account for pill nav height**

In the `:root` block (around line 61), change:
```css
--page-bottom-pad: calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 1rem);
```
to:
```css
--page-bottom-pad: calc(80px + env(safe-area-inset-bottom, 0px));
```

- [ ] **Step 3: Add `.liquid-glass-nav` component class**

In the `@layer components { ... }` block (after `.glow-cyan`), add:

```css
/* Liquid glass nav pill */
.liquid-glass-nav {
  border-radius: 32px;
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  /* Dark mode (default) */
  background: rgba(8, 18, 36, 0.60);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.28),
    0 2px 8px rgba(0, 0, 0, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

[data-theme="light"] .liquid-glass-nav {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(0, 0, 0, 0.07);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.90);
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build 2>&1 | tail -5
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/index.css
git commit -m "feat: add light mode CSS tokens and liquid-glass-nav class"
```

---

## Task 6: FaIcon wrapper component

**Files:**
- Create: `src/components/ui/FaIcon.tsx`

- [ ] **Step 1: Create `src/components/ui/FaIcon.tsx`**

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

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/FaIcon.tsx
git commit -m "feat: add FaIcon wrapper for Font Awesome icons"
```

---

## Task 7: Liquid glass nav + theme toggle + FA icons in layout

**Files:**
- Modify: `src/components/layout/index.tsx`

This is the most complex task. It changes:
1. `Header`: add theme toggle button (faMoon/faSun) before UserMenuButton; replace `WifiOff` with `faWifi`
2. `BottomNav`: replace glass pill layout with `.liquid-glass-nav` (floating, not full-width); replace Lucide icons with FA; fix label font size to `text-[11px]`

- [ ] **Step 1: Read the current full file**

Read `src/components/layout/index.tsx` fully to understand the current structure before editing.

- [ ] **Step 2: Update imports**

Replace the lucide-react import line:
```tsx
import { Home, Search, LayoutDashboard, User, Radar, WifiOff } from 'lucide-react'
```
with:
```tsx
import { Radar } from 'lucide-react'
import { faHouse, faMagnifyingGlass, faTableCells, faUser, faWifi, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '@/components/ui/FaIcon'
import { useThemeStore } from '@/store'
```

**Note:** `faUser` is used in two places in this file: the `NAV_TABS` array (Account tab) AND the `UserMenuButton` avatar fallback where `<User className="h-4 w-4 text-accent" />` is rendered. Both must be replaced.

- [ ] **Step 3: Add theme toggle button to Header**

In the `Header` component, inside `<div className="flex items-center gap-2">`, add this **before** `<UserMenuButton />`:

```tsx
<ThemeToggleButton />
```

And add the `ThemeToggleButton` function after `UserMenuButton` (before the BottomNav section):

```tsx
function ThemeToggleButton() {
  const { theme, toggleTheme } = useThemeStore()
  return (
    <button
      onClick={toggleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <FaIcon
        icon={theme === 'dark' ? faMoon : faSun}
        className="h-4 w-4"
        aria-hidden="true"
      />
    </button>
  )
}
```

- [ ] **Step 4: Replace `User` avatar fallback in `UserMenuButton`**

Find the block inside `UserMenuButton` that renders when `!user?.avatar_url`:
```tsx
<User className="h-4 w-4 text-accent" aria-hidden="true" />
```
Replace with:
```tsx
<FaIcon icon={faUser} className="h-4 w-4 text-accent" aria-hidden="true" />
```

- [ ] **Step 5: Replace WifiOff in Header offline indicator**

Replace:
```tsx
<WifiOff className="h-3 w-3 text-amber-400" aria-hidden="true" />
```
with:
```tsx
<FaIcon icon={faWifi} className="h-3 w-3 text-amber-400 opacity-50" aria-hidden="true" />
```

- [ ] **Step 6: Update `NAV_TABS` to use FA icons**

Replace the current `NAV_TABS` array:
```tsx
const NAV_TABS = [
  { path: '/', label: 'Home', icon: Home, exactMatch: true },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/dashboard', label: 'Watchlist', icon: LayoutDashboard, requiresAuth: true },
  { path: '/settings', label: 'Account', icon: User },
]
```
with:
```tsx
const NAV_TABS = [
  { path: '/', label: 'Home', icon: faHouse, exactMatch: true },
  { path: '/search', label: 'Search', icon: faMagnifyingGlass },
  { path: '/dashboard', label: 'Watchlist', icon: faTableCells, requiresAuth: true },
  { path: '/settings', label: 'Account', icon: faUser },
]
```

- [ ] **Step 7: Rewrite `BottomNav` as floating pill**

Replace the entire `BottomNav` function with:

```tsx
export function BottomNav() {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const isActive = (tab: typeof NAV_TABS[0]) => {
    if (tab.exactMatch) return location.pathname === tab.path
    return location.pathname.startsWith(tab.path)
  }

  const handleTabClick = (tab: typeof NAV_TABS[0]) => {
    if (tab.requiresAuth && !isAuthenticated) {
      navigate('/auth', { state: { returnTo: tab.path } })
      return
    }
    navigate(tab.path)
  }

  return (
    <nav
      className="liquid-glass-nav fixed left-4 right-4 z-40 flex"
      aria-label="Main navigation"
      style={{
        bottom: 0,
        marginBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        height: '56px',
      }}
    >
      {NAV_TABS.map(tab => {
        const active = isActive(tab)

        return (
          <button
            key={tab.path}
            onClick={() => handleTabClick(tab)}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1',
              'min-h-[44px] min-w-[44px]',
              'transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
              active ? 'text-accent' : 'text-muted-foreground hover:text-foreground',
            )}
            aria-current={active ? 'page' : undefined}
            aria-label={tab.label}
          >
            <div className="relative">
              <FaIcon
                icon={tab.icon}
                className={cn('h-5 w-5 transition-transform', active && 'scale-110')}
                aria-hidden="true"
              />
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-accent"
                  style={{ boxShadow: '0 0 8px rgba(6, 182, 212, 0.8)' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </div>
            <span
              className={cn(
                'text-[11px] font-medium',
                active ? 'text-accent' : 'text-muted-foreground',
              )}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 8: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/components/layout/index.tsx
git commit -m "feat: liquid glass floating pill nav + theme toggle + FA icons in layout"
```

---

## Task 8: FA icons in ProductResultPage

**Files:**
- Modify: `src/pages/ProductResultPage.tsx`

Replacement map for this file:
- `Bell` → `faBell`
- `BellOff` → `faBellSlash`
- `Share2` → `faShareNodes`
- `ChevronLeft` → `faChevronLeft`
- `Clock` → `faClock`

- [ ] **Step 1: Read the current file**

Read `src/pages/ProductResultPage.tsx` fully to see where each icon is used and how it's rendered.

- [ ] **Step 2: Update lucide-react import**

Remove `Bell`, `BellOff`, `Share2`, `ChevronLeft`, `Clock` from the lucide-react import. Keep any icons not in the replacement map.

Add FA import:
```tsx
import { faBell, faBellSlash, faShareNodes, faChevronLeft, faClock } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '@/components/ui/FaIcon'
```

- [ ] **Step 3: Replace icon usages**

For each occurrence:
- `<Bell className="h-4 w-4 ..." />` → `<FaIcon icon={faBell} className="h-4 w-4 ..." />`
- `<BellOff className="h-4 w-4 ..." />` → `<FaIcon icon={faBellSlash} className="h-4 w-4 ..." />`
- `<Share2 className="..." />` → `<FaIcon icon={faShareNodes} className="..." />`
- `<ChevronLeft className="..." />` → `<FaIcon icon={faChevronLeft} className="..." />`
- `<Clock className="..." />` → `<FaIcon icon={faClock} className="..." />`

Keep all existing `className`, `aria-hidden`, and other props.

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/ProductResultPage.tsx
git commit -m "feat: replace Lucide icons with Font Awesome in ProductResultPage"
```

---

## Task 9: FA icons in PriceComparisonTable

**Files:**
- Modify: `src/components/product/PriceComparisonTable.tsx`

Replacement map:
- `Lock` → `faLock`
- `ExternalLink` → `faArrowUpRightFromSquare`

- [ ] **Step 1: Read the current file**

Read `src/components/product/PriceComparisonTable.tsx` fully.

- [ ] **Step 2: Update imports and replace icons**

Remove `Lock`, `ExternalLink` from lucide-react import. Add:
```tsx
import { faLock, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '@/components/ui/FaIcon'
```

Replace:
- `<Lock className="..." />` → `<FaIcon icon={faLock} className="..." />`
- `<ExternalLink className="..." />` → `<FaIcon icon={faArrowUpRightFromSquare} className="..." />`

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/product/PriceComparisonTable.tsx
git commit -m "feat: replace Lucide icons with Font Awesome in PriceComparisonTable"
```

---

## Task 10: FA icons in SearchPage

**Files:**
- Modify: `src/pages/SearchPage.tsx`

Replacement map:
- `Trash2` → `faTrashCan`
- `Clock` → `faClock`

- [ ] **Step 1: Read the current file**

Read `src/pages/SearchPage.tsx` fully.

- [ ] **Step 2: Update imports and replace icons**

Remove `Trash2`, `Clock` from lucide-react import. Add:
```tsx
import { faTrashCan, faClock } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '@/components/ui/FaIcon'
```

Replace each icon usage keeping existing props.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/SearchPage.tsx
git commit -m "feat: replace Lucide icons with Font Awesome in SearchPage"
```

---

## Task 11: FA icons in DashboardPage

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

Replacement map:
- `RefreshCw` → `faRotate`
- `LayoutGrid` → `faBorderAll`
- `List` → `faList`

- [ ] **Step 1: Read the current file**

Read `src/pages/DashboardPage.tsx` fully.

- [ ] **Step 2: Update imports and replace icons**

Remove `RefreshCw`, `LayoutGrid`, `List` from lucide-react import. Add:
```tsx
import { faRotate, faBorderAll, faList } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '@/components/ui/FaIcon'
```

Replace each icon usage keeping existing props.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/DashboardPage.tsx
git commit -m "feat: replace Lucide icons with Font Awesome in DashboardPage"
```

---

## Task 12: FA icons in AuthPage

**Files:**
- Modify: `src/pages/AuthPage.tsx`

Replacement map:
- `Eye` → `faEye`
- `EyeOff` → `faEyeSlash`
- `Mail` → `faEnvelope`

- [ ] **Step 1: Read the current file**

Read `src/pages/AuthPage.tsx` fully.

- [ ] **Step 2: Update imports and replace icons**

Remove `Eye`, `EyeOff`, `Mail` from lucide-react import. Add:
```tsx
import { faEye, faEyeSlash, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '@/components/ui/FaIcon'
```

Replace each icon usage keeping existing props.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AuthPage.tsx
git commit -m "feat: replace Lucide icons with Font Awesome in AuthPage"
```

---

## Task 13: FA icon in LandingPage

**Files:**
- Modify: `src/pages/LandingPage.tsx`

Replacement map:
- `ShieldCheck` → `faShieldHalved`

- [ ] **Step 1: Read the current file**

Read `src/pages/LandingPage.tsx` and find the `ShieldCheck` usage.

- [ ] **Step 2: Update imports and replace icon**

Remove `ShieldCheck` from lucide-react import. Add:
```tsx
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from '@/components/ui/FaIcon'
```

Replace the usage keeping existing props.

- [ ] **Step 3: Verify full TypeScript build is clean**

```bash
npx tsc --noEmit 2>&1
```
Expected: zero errors across the entire project.

- [ ] **Step 4: Final build check**

```bash
npm run build 2>&1 | tail -10
```
Expected: build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/LandingPage.tsx
git commit -m "feat: replace ShieldCheck with faShieldHalved in LandingPage"
```

---

## Success Criteria Checklist

Before declaring the implementation complete, verify each item manually in the running dev server (`npm run dev`):

- [ ] No text renders below 14px anywhere in the app (spot-check with browser DevTools)
- [ ] Dark mode is default on first load; toggling to light mode and reloading persists the choice
- [ ] Light mode renders the warm neutral palette (off-white background, dark navy text, cyan accent)
- [ ] The theme toggle button (moon/sun) appears in the header
- [ ] Bottom nav floats as a pill with frosted glass — does not touch screen edges
- [ ] Nav floats above content — content scrolls behind it correctly
- [ ] All listed nav/UI icons show Font Awesome variants
- [ ] `Radar` logo icon and chart/data icons remain Lucide
- [ ] `npm run build` passes with zero TypeScript errors

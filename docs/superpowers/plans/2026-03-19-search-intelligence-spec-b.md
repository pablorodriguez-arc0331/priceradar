# Search Intelligence Spec B — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the global "recently checked" list with personal search history (per-user or per-device) and add a "Hot right now" section on SearchPage showing the most-tracked products.

**Architecture:** Personal history branches on auth state — signed-in users read/write `search_history` in Supabase; anonymous users read/write `price-radar-history` in localStorage. Hot products use a Supabase RPC (`get_hot_products`) that groups `tracked_products` by `product_id` and returns those with ≥2 watchers. Both sections reuse the existing product card markup and price-enrichment pattern from `useRecentProducts`.

**Tech Stack:** React 18, TypeScript, Zustand (`useAuthStore`), Supabase JS client (`@supabase/supabase-js`), localStorage.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `supabase/migrations/0007_search_history.sql` | **Create** | `search_history` table + RLS + index + `get_hot_products` RPC |
| `src/services/supabase.ts` | **Modify** | Add `recordSearchHistory`, `getUserSearchHistory`, `getProductsByIds`, `getHotProducts` |
| `src/hooks/index.ts` | **Modify** | Add `usePersonalHistory` (replaces `useRecentProducts` call in SearchPage), add `useHotProducts` |
| `src/pages/SearchPage.tsx` | **Modify** | Wire `usePersonalHistory` + `useHotProducts`; add hot section; update heading |
| `src/pages/ProductResultPage.tsx` | **Modify** | Record view on successful product load (both auth paths) |

---

## Task 1: SQL Migration

**Files:**
- Create: `supabase/migrations/0007_search_history.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- search_history: per-user product view history
CREATE TABLE search_history (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id  uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  checked_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

-- RLS: users can only read/write their own rows
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own history"
  ON search_history
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fast per-user ordered reads
CREATE INDEX idx_search_history_user_checked
  ON search_history (user_id, checked_at DESC);

-- RPC: returns product_ids ordered by watcher count (≥2 watchers only)
CREATE OR REPLACE FUNCTION get_hot_products(p_limit int DEFAULT 6)
RETURNS TABLE(product_id uuid, watcher_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT tp.product_id, COUNT(*) AS watcher_count
  FROM tracked_products tp
  GROUP BY tp.product_id
  HAVING COUNT(*) >= 2
  ORDER BY watcher_count DESC
  LIMIT p_limit;
$$;
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use `mcp__claude_ai_Supabase__apply_migration` with the SQL above, or run:
```bash
# If using Supabase CLI:
supabase db push
# Or apply directly in Supabase Dashboard > SQL Editor
```

Expected: no errors; `search_history` table and `get_hot_products` function visible in Supabase.

- [ ] **Step 3: Verify via Supabase**

Run in SQL editor:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name = 'search_history';

SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'get_hot_products';
```
Expected: both rows returned.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0007_search_history.sql
git commit -m "feat: add search_history table and get_hot_products RPC"
```

---

## Task 2: Service Functions

**Files:**
- Modify: `src/services/supabase.ts` (append after `getRecentProducts`)

- [ ] **Step 1: Add `recordSearchHistory`**

Append to `src/services/supabase.ts` after `getRecentProducts`:

```typescript
// ─── Search history (per-user) ────────────────────────────────────────────────

export async function recordSearchHistory(userId: string, productId: string) {
  const { error } = await supabase
    .from('search_history')
    .upsert(
      { user_id: userId, product_id: productId, checked_at: new Date().toISOString() },
      { onConflict: 'user_id,product_id' },
    )

  if (error) throw error
}
```

- [ ] **Step 2: Add `getUserSearchHistory`**

```typescript
export async function getUserSearchHistory(userId: string, limit = 6) {
  const { data, error } = await supabase
    .from('search_history')
    .select('product_id, checked_at, product:products(*, price_signals(*))')
    .eq('user_id', userId)
    .order('checked_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []) as Array<{ product_id: string; checked_at: string; product: any }>
}
```

- [ ] **Step 3: Add `getProductsByIds`**

```typescript
export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return []
  const { data, error } = await supabase
    .from('products')
    .select('*, price_signals(*)')
    .in('id', ids)

  if (error) throw error
  return data ?? []
}
```

- [ ] **Step 4: Add `getHotProducts`**

```typescript
// ─── Hot products (most-watched, ≥2 watchers) ─────────────────────────────────

export async function getHotProducts(limit = 6) {
  const { data: hotRows, error } = await supabase
    .rpc('get_hot_products', { p_limit: limit })

  if (error) throw error
  if (!hotRows || hotRows.length === 0) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productIds = (hotRows as any[]).map(r => r.product_id as string)

  const { data: products } = await supabase
    .from('products')
    .select('*, price_signals(*)')
    .in('id', productIds)

  // Return in watcher-count order (hotRows is already sorted)
  const productMap = new Map((products ?? []).map(p => [p.id, p]))
  return productIds.map(id => productMap.get(id)).filter(Boolean)
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npm run build
```

Expected: zero TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/services/supabase.ts
git commit -m "feat: add recordSearchHistory, getUserSearchHistory, getProductsByIds, getHotProducts service functions"
```

---

## Task 3: Hooks

**Files:**
- Modify: `src/hooks/index.ts`

The two new hooks follow the exact enrichment pattern of `useRecentProducts` (fetch rows → get live prices via `getCurrentPricesForProducts` → merge `live_price` / `live_retailer` into each row).

- [ ] **Step 1: Add imports at top of `src/hooks/index.ts`**

The existing import line:
```typescript
import { getProductWithPricing, fetchPricesForUrl, getRecentProducts, getCurrentPricesForProducts, getComparisonPrices } from '@/services/supabase'
```

Replace with:
```typescript
import { getProductWithPricing, fetchPricesForUrl, getRecentProducts, getCurrentPricesForProducts, getComparisonPrices, recordSearchHistory, getUserSearchHistory, getProductsByIds, getHotProducts } from '@/services/supabase'
import { useAuthStore } from '@/store'
```

- [ ] **Step 2: Add `usePersonalHistory` hook**

Append after `useRecentProducts`:

```typescript
// ─── usePersonalHistory — personal search history (per-user or per-device) ───
export function usePersonalHistory(limit = 6) {
  const { user, isAuthenticated } = useAuthStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allData, setAllData] = useState<any[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    ;(async () => {
      try {
        if (isAuthenticated && user) {
          // ── Signed-in: read from Supabase search_history ───────────────────
          const rows = await getUserSearchHistory(user.id, limit)
          if (cancelled) return

          const ids = rows.map(r => r.product_id)
          const currentPrices = await getCurrentPricesForProducts(ids).catch(() => [])
          if (cancelled) return

          const priceMap = new Map<string, { price: number; retailer: string }>()
          for (const cp of currentPrices) {
            if (!priceMap.has(cp.product_id)) {
              priceMap.set(cp.product_id, {
                price: Number(cp.price),
                retailer: cp.retailer?.name ?? cp.retailer?.slug ?? '',
              })
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const enriched = rows.map((r: any) => {
            const live = priceMap.get(r.product_id)
            return {
              ...r.product,
              live_price: live?.price ?? null,
              live_retailer: live?.retailer ?? null,
            }
          })

          if (!cancelled) { setAllData(enriched); setIsLoading(false) }
        } else {
          // ── Anonymous: read from localStorage ─────────────────────────────
          const raw = localStorage.getItem('price-radar-history')
          const arr: Array<{ productId: string; checkedAt: string }> = raw ? JSON.parse(raw) : []
          const ids = arr.slice(0, limit).map(e => e.productId)

          if (ids.length === 0) {
            if (!cancelled) { setAllData([]); setIsLoading(false) }
            return
          }

          const products = await getProductsByIds(ids)
          if (cancelled) return

          const currentPrices = await getCurrentPricesForProducts(ids).catch(() => [])
          if (cancelled) return

          const priceMap = new Map<string, { price: number; retailer: string }>()
          for (const cp of currentPrices) {
            if (!priceMap.has(cp.product_id)) {
              priceMap.set(cp.product_id, {
                price: Number(cp.price),
                retailer: cp.retailer?.name ?? cp.retailer?.slug ?? '',
              })
            }
          }

          // Maintain localStorage order (most recently checked first)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const productMap = new Map((products as any[]).map((p: any) => [p.id, p]))
          const enriched = ids
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map(id => productMap.get(id) as any)
            .filter(Boolean)
            .map(p => {
              const live = priceMap.get(p.id)
              return { ...p, live_price: live?.price ?? null, live_retailer: live?.retailer ?? null }
            })

          if (!cancelled) { setAllData(enriched); setIsLoading(false) }
        }
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [isAuthenticated, user?.id, limit])

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const data = allData.filter(p => !dismissed.has(p.id))
  return { data, isLoading, dismiss }
}
```

- [ ] **Step 3: Add `useHotProducts` hook**

Append after `usePersonalHistory`:

```typescript
// ─── useHotProducts — products most people are watching ───────────────────────
export function useHotProducts(limit = 6) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getHotProducts(limit)
        if (cancelled) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ids = (rows as any[]).map((r: any) => r.id as string)
        const currentPrices = await getCurrentPricesForProducts(ids).catch(() => [])
        if (cancelled) return

        const priceMap = new Map<string, { price: number; retailer: string }>()
        for (const cp of currentPrices) {
          if (!priceMap.has(cp.product_id)) {
            priceMap.set(cp.product_id, {
              price: Number(cp.price),
              retailer: cp.retailer?.name ?? cp.retailer?.slug ?? '',
            })
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enriched = (rows as any[]).map((r: any) => {
          const live = priceMap.get(r.id)
          return { ...r, live_price: live?.price ?? null, live_retailer: live?.retailer ?? null }
        })

        if (!cancelled) { setData(enriched); setIsLoading(false) }
      } catch {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [limit])

  return { data, isLoading }
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npm run build
```

Expected: zero TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/index.ts
git commit -m "feat: add usePersonalHistory and useHotProducts hooks"
```

---

## Task 4: SearchPage

**Files:**
- Modify: `src/pages/SearchPage.tsx`

- [ ] **Step 1: Update imports**

Replace:
```typescript
import { faTrashCan, faClock } from '@fortawesome/free-solid-svg-icons'
```
With:
```typescript
import { faTrashCan, faClock, faFire } from '@fortawesome/free-solid-svg-icons'
```

Replace:
```typescript
import { useRecentProducts, useDocumentTitle } from '@/hooks'
```
With:
```typescript
import { usePersonalHistory, useHotProducts, useDocumentTitle } from '@/hooks'
import { useAuthStore } from '@/store'
```

- [ ] **Step 2: Update `SearchPage` component body**

Replace the top of `SearchPage` function (the hook call and heading):

```typescript
export function SearchPage() {
  const { isAuthenticated } = useAuthStore()
  const { data: recentProducts, isLoading: recentLoading, dismiss } = usePersonalHistory(6)
  const { data: hotProducts, isLoading: hotLoading } = useHotProducts(6)
  const [hotDismissed, setHotDismissed] = useState(false)
  useDocumentTitle('Check a Price — PriceRadar')
```

Note: `useState` is already imported from React at line 1 — no change needed there.

- [ ] **Step 3: Update the heading text**

Replace:
```tsx
<h2 id="recent-heading" className="text-sm font-semibold text-foreground">
  Recently checked
</h2>
```
With:
```tsx
<h2 id="recent-heading" className="text-sm font-semibold text-foreground">
  {isAuthenticated ? 'Your recently checked' : 'Recently checked on this device'}
</h2>
```

- [ ] **Step 4: Add "Hot right now" section**

Insert the hot section between `<URLSearchInput size="large" autoFocus />` and the recently-checked section. The full block to insert:

```tsx
{/* Hot right now */}
{!hotDismissed && (hotLoading || hotProducts.length > 0) && (
  <motion.section
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    aria-labelledby="hot-heading"
    className="space-y-3"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <FaIcon icon={faFire} className="h-4 w-4 text-orange-400" aria-hidden="true" />
        <h2 id="hot-heading" className="text-sm font-semibold text-foreground">
          Hot right now
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">Products lots of people are watching.</p>
        <button
          onClick={() => setHotDismissed(true)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss hot products section"
          type="button"
        >
          <FaIcon icon={faTrashCan} className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div className="space-y-2">
      {hotLoading
        ? Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 animate-pulse"
            >
              <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-muted" />
                <div className="h-2.5 w-1/3 rounded bg-muted" />
              </div>
              <div className="h-4 w-14 rounded bg-muted" />
            </div>
          ))
        : hotProducts.map((product, i) => {
            const signal = product.price_signals?.[0]
            const retailer = product.live_retailer ?? getRetailerName(product.source_url ?? '')
            const retailerColor = RETAILER_COLORS[retailer]
            const displayPrice: number | null =
              product.live_price ??
              (signal?.current_best_price > 0 ? Number(signal.current_best_price) : null)

            return (
              <motion.div key={product.id} variants={itemVariants}>
                <a
                  href={`/product/${product.id}`}
                  className="glass-card flex items-center gap-3 rounded-xl p-3 hover:brightness-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`${product.name}${signal ? ` — ${signal.label}` : ''}`}
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/20">
                    <ProductImage
                      src={product.image_url}
                      alt={product.name}
                      category={product.category}
                      className="h-full w-full p-1"
                      iconClassName="h-4 w-4"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {retailerColor && (
                        <span className="flex items-center gap-1">
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${retailerColor}`}
                            aria-hidden="true"
                          />
                          <span className="text-xs text-muted-foreground">{retailer}</span>
                        </span>
                      )}
                      {displayPrice !== null && (
                        <>
                          <span className="text-muted-foreground/40 text-xs">·</span>
                          <span className="price text-xs font-medium text-foreground">
                            {formatPrice(displayPrice)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {signal && (
                    <SignalBadge
                      verdict={signal.verdict}
                      label={signal.label}
                      size="inline"
                      animated={false}
                    />
                  )}
                </a>
              </motion.div>
            )
          })}
    </div>
  </motion.section>
)}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npm run build
```

Expected: zero TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/SearchPage.tsx
git commit -m "feat: add Hot right now section and personal history heading on SearchPage"
```

---

## Task 5: ProductResultPage — Record View

**Files:**
- Modify: `src/pages/ProductResultPage.tsx`

When a product loads successfully (i.e., `product` becomes non-null), record the view:
- Signed-in → call `recordSearchHistory(userId, productId)` (fire-and-forget)
- Anonymous → write to `price-radar-history` in localStorage (upsert: remove existing entry for same ID, prepend new entry with current timestamp, trim to 20)

- [ ] **Step 1: Add `recordSearchHistory` import**

Replace:
```typescript
import { useAuthStore, useTrackedStore, useToast } from '@/store'
```
With:
```typescript
import { recordSearchHistory } from '@/services/supabase'
import { useAuthStore, useTrackedStore, useToast } from '@/store'
```

- [ ] **Step 2: Add the recording `useEffect` after existing useEffects**

Insert after the `useEffect` that calls `fetchTracked` (around line 32):

```typescript
// Record this product view in personal history
useEffect(() => {
  if (!product || !id) return

  if (isAuthenticated && user) {
    // Fire-and-forget — don't block the UI
    recordSearchHistory(user.id, id).catch(() => {})
  } else {
    // Anonymous: upsert into localStorage
    try {
      const key = 'price-radar-history'
      const raw = localStorage.getItem(key)
      const arr: Array<{ productId: string; checkedAt: string }> = raw ? JSON.parse(raw) : []
      const filtered = arr.filter(e => e.productId !== id)
      filtered.unshift({ productId: id, checkedAt: new Date().toISOString() })
      localStorage.setItem(key, JSON.stringify(filtered.slice(0, 20)))
    } catch { /* ignore storage errors */ }
  }
}, [product?.id, isAuthenticated, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 3: Verify TypeScript**

```bash
npm run build
```

Expected: zero TypeScript errors.

- [ ] **Step 4: Smoke test (manual)**

With dev server running (`npm run dev`):
1. Open SearchPage — "Hot right now" section visible if any products have ≥2 watchers
2. Check a product (paste Amazon URL) → navigate to product result page → navigate back → product appears in personal history
3. Sign out → re-check a product → product appears under "Recently checked on this device"
4. Sign in → personal history shows only your products
5. Dismiss "Hot right now" → section hidden for the session

- [ ] **Step 5: Commit**

```bash
git add src/pages/ProductResultPage.tsx
git commit -m "feat: record product view in personal search history on ProductResultPage"
```

---

## Success Criteria Verification

After all tasks, confirm each criterion from the spec:

- [ ] Signed-in users on SearchPage see only products they personally checked, ordered by most recent
- [ ] Anonymous users see only products checked on the current device, ordered by most recent
- [ ] "Hot right now" section appears above personal history when ≥1 product has ≥2 watchers
- [ ] "Hot right now" section is hidden when no qualifying products exist
- [ ] Re-checking the same product moves it to the top of personal history (no duplicates)
- [ ] Build passes with zero TypeScript errors (`npm run build`)

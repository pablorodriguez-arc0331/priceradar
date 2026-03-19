# PriceRadar Search Intelligence — Spec B Design
**Date:** 2026-03-19
**Status:** Approved
**Scope:** Personal search history (per-user or per-device) + "Hot right now" trending section on SearchPage

---

## 1. Goals

1. Replace the global "recently checked" list with a **personal search history** — signed-in users see only products they have checked; anonymous users see only products they have checked on the current device.
2. Add a **"Hot right now"** section to SearchPage showing the products most users are actively tracking — using existing `tracked_products` data, no new tracking infrastructure.

---

## 2. Personal Search History

### 2.1 When to Record

A history entry is written when a product result page successfully loads — specifically when `ProductResultPage` receives non-null `data` from `useProduct`. One entry per product per identity (upsert: re-checking the same product updates `checked_at` rather than adding a duplicate).

### 2.2 Anonymous Users — localStorage

- **Key:** `price-radar-history`
- **Value:** JSON array of `{ productId: string; checkedAt: string }`, sorted most-recent first, capped at 20 entries.
- **Write:** On successful product load in `ProductResultPage`, upsert the entry — if the product ID already exists in the array, remove it first, then prepend the updated entry with the new `checkedAt`. Trim to 20 entries after prepend. This ensures no duplicates and always shows the most recent check at the top.
- **Read:** `usePersonalHistory` reads the array, fetches product rows by ID from Supabase, enriches with live prices.

### 2.3 Signed-In Users — Supabase

**New table:**
```sql
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

-- Index for fast per-user ordered reads
CREATE INDEX idx_search_history_user_checked
  ON search_history (user_id, checked_at DESC);
```

**Write:** `recordSearchHistory(userId, productId)` — upserts a row, setting `checked_at = now()` on conflict.

**Read:** `getUserSearchHistory(userId, limit)` — selects rows for `user_id` ordered by `checked_at DESC`, joins to `products` + `price_signals`, enriches with live prices (same pattern as existing `getRecentProducts`).

### 2.4 `usePersonalHistory(limit)` Hook

Replaces the existing `useRecentProducts` hook on SearchPage.

```
if isAuthenticated:
  fetch from search_history via getUserSearchHistory(user.id, limit)
else:
  read localStorage array → fetch product details by IDs → enrich with live prices
```

Returns `{ data, isLoading, dismiss }` — same shape as the current `useRecentProducts` return value so SearchPage changes are minimal.

**Note:** `useRecentProducts` is used only in `SearchPage`. It can be replaced in-place; no other callers need updating.

### 2.5 SearchPage Heading

| State | Heading |
|-------|---------|
| Signed in | "Your recently checked" |
| Anonymous | "Recently checked on this device" |

---

## 3. Hot Right Now

### 3.1 Data Source

Queries the existing `tracked_products` table — no new tracking table or migration needed (beyond the `search_history` table above).

```sql
SELECT tp.product_id, COUNT(*) AS watcher_count
FROM tracked_products tp
GROUP BY tp.product_id
HAVING COUNT(*) >= 2
ORDER BY watcher_count DESC
LIMIT 6;
```

Results are then joined to `products` + `price_signals` and enriched with live prices (same enrichment pattern as `getRecentProducts`).

**Minimum threshold:** 2 watchers. Products tracked by only 1 user are excluded — avoids surfacing a single person's preference as trending.

**New service function:** `getHotProducts(limit)` in `src/services/supabase.ts`.

### 3.2 `useHotProducts(limit)` Hook

```
fetch getHotProducts(limit)
return { data, isLoading }
```

No dismiss state — the section can be dismissed per-session (see 3.3).

### 3.3 SearchPage UI

**Section heading:** "Hot right now" with a 🔥 emoji.
**Subtext:** "Products lots of people are watching."
**Visibility:** Section renders only when `data.length >= 1` after loading (the `HAVING COUNT(*) >= 2` filter is enforced server-side).
**Dismissible:** A session-only dismiss (React state, not persisted) using the existing close button pattern. Dismissed state resets on next visit.
**Card UI:** Reuses the existing recently-checked product card component — no new card component.

### 3.4 SearchPage Layout (top to bottom)

1. Title + subtitle (unchanged)
2. URL input (unchanged)
3. **"Hot right now"** section (new — shown above personal history)
4. **Personal history** section (replaces global "recently checked")
5. How-to instructions (unchanged)

---

## 4. Files to Change

| File | Change |
|------|--------|
| Supabase migration (new `.sql` file) | Create `search_history` table + RLS + index |
| `src/services/supabase.ts` | Add `recordSearchHistory`, `getUserSearchHistory`, `getHotProducts` |
| `src/hooks/index.ts` | Add `usePersonalHistory` (replaces `useRecentProducts` on SearchPage); add `useHotProducts` |
| `src/pages/SearchPage.tsx` | Wire `usePersonalHistory` + `useHotProducts`; add hot section; update heading |
| `src/pages/ProductResultPage.tsx` | Record view on successful product load |

---

## 5. Out of Scope

- Cross-device sync for anonymous users (history stays on the device)
- Merging localStorage history into Supabase on sign-in
- Search history management UI (clearing history, etc.)
- Backend changes beyond the `search_history` table and three new service functions
- Personalisation beyond history (recommendations, etc.)

---

## 6. Success Criteria

- [ ] Signed-in users on SearchPage see only products they personally checked, ordered by most recent
- [ ] Anonymous users see only products checked on the current device, ordered by most recent
- [ ] "Hot right now" section appears above personal history when ≥1 product has ≥2 watchers
- [ ] "Hot right now" section is hidden when no qualifying products exist
- [ ] Re-checking the same product moves it to the top of personal history (no duplicates)
- [ ] Build passes with zero TypeScript errors

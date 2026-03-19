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

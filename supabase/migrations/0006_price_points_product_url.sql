-- 0006_price_points_product_url.sql
-- Add product_url, product_title, and match_confidence to price_points.
-- These fields are populated for cross-retailer comparison rows (Walmart, Best Buy)
-- by the Gemini-powered matching logic in fetch-prices.

ALTER TABLE price_points
  ADD COLUMN IF NOT EXISTS product_url     TEXT,
  ADD COLUMN IF NOT EXISTS product_title   TEXT,
  ADD COLUMN IF NOT EXISTS match_confidence NUMERIC;

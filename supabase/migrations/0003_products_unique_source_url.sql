-- Add UNIQUE constraint on products.source_url required for upsert
alter table public.products add constraint products_source_url_unique unique (source_url);

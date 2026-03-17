-- ============================================================
-- Price Radar — Supabase Schema
-- Migration: 0001_initial_schema
-- ============================================================

-- ─── Retailers ───────────────────────────────────────────────
create table public.retailers (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  slug                    text not null unique,
  logo_url                text,
  affiliate_url_template  text not null,
  is_active               boolean not null default true,
  created_at              timestamptz not null default now()
);

-- Seed retailers
insert into public.retailers (name, slug, affiliate_url_template) values
  ('Amazon',   'amazon',  'https://www.amazon.com/dp/{{asin}}?tag=priceradar05-20'),
  ('Walmart',  'walmart', 'https://www.walmart.com/search?q={{query}}'),
  ('eBay',     'ebay',    'https://www.ebay.com/sch/i.html?_nkw={{query}}'),
  ('Best Buy', 'bestbuy', 'https://www.bestbuy.com/site/searchpage.jsp?st={{query}}'),
  ('Target',   'target',  'https://www.target.com/s?searchTerm={{query}}');

-- ─── Products ────────────────────────────────────────────────
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  image_url   text,
  asin        text,                    -- Amazon ASIN
  category    text,
  source_url  text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_products_asin on public.products(asin) where asin is not null;

-- ─── Price Points ─────────────────────────────────────────────
create table public.price_points (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  retailer_id uuid not null references public.retailers(id),
  price       numeric(10,2) not null,
  currency    text not null default 'USD',
  captured_at timestamptz not null default now(),
  is_current  boolean not null default false
);

create index idx_price_points_product on public.price_points(product_id, captured_at desc);
create index idx_price_points_current on public.price_points(product_id, retailer_id) where is_current = true;

-- When a new current price is set, clear old current flag
create or replace function public.set_current_price()
returns trigger language plpgsql as $$
begin
  if new.is_current then
    update public.price_points
    set is_current = false
    where product_id = new.product_id
      and retailer_id = new.retailer_id
      and id != new.id
      and is_current = true;
  end if;
  return new;
end;
$$;

create trigger trg_set_current_price
  before insert or update on public.price_points
  for each row execute function public.set_current_price();

-- ─── Price Signals (computed, cached) ────────────────────────
create table public.price_signals (
  id                      uuid primary key default gen_random_uuid(),
  product_id              uuid not null references public.products(id) on delete cascade unique,
  verdict                 text not null check (verdict in ('low','high','neutral','no_data')),
  label                   text not null,
  subtext                 text not null,
  percentile              numeric(5,2),
  signal_strength         numeric(5,2),
  reference_range_days    integer not null default 90,
  historical_low          numeric(10,2),
  historical_high         numeric(10,2),
  current_best_price      numeric(10,2),
  current_best_retailer   text,
  last_checked_at         timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index idx_price_signals_product on public.price_signals(product_id);

-- ─── User Profiles (extends Supabase auth.users) ──────────────
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  name                text,
  avatar_url          text,
  plan                text not null default 'free' check (plan in ('free','paid')),
  email_alerts        boolean not null default true,
  push_alerts         boolean not null default false,
  stripe_customer_id  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Subscriptions ────────────────────────────────────────────
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade unique,
  stripe_subscription_id  text unique,
  stripe_price_id         text,
  status                  text not null default 'inactive',
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ─── Tracked Products ─────────────────────────────────────────
create table public.tracked_products (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  product_id          uuid not null references public.products(id) on delete cascade,
  alert_target_price  numeric(10,2),
  alert_enabled       boolean not null default true,
  alert_status        text not null default 'active' check (alert_status in ('active','triggered','paused')),
  added_at            timestamptz not null default now(),
  last_checked_at     timestamptz not null default now(),
  unique (user_id, product_id)
);

create index idx_tracked_products_user on public.tracked_products(user_id);
create index idx_tracked_products_product on public.tracked_products(product_id);

-- ─── Price Alerts ─────────────────────────────────────────────
create table public.price_alerts (
  id                      uuid primary key default gen_random_uuid(),
  tracked_product_id      uuid not null references public.tracked_products(id) on delete cascade,
  triggered_at            timestamptz not null default now(),
  trigger_price           numeric(10,2) not null,
  delivery_method         text not null default 'email' check (delivery_method in ('email','push','both')),
  delivered               boolean not null default false
);

create index idx_price_alerts_tracked on public.price_alerts(tracked_product_id);

-- ─── Row Level Security ───────────────────────────────────────

-- profiles: users can only read/update their own
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- tracked_products: per-user isolation
alter table public.tracked_products enable row level security;
create policy "Users can manage own tracked products" on public.tracked_products
  using (auth.uid() = user_id);

-- price_alerts: per-user via tracked_products
alter table public.price_alerts enable row level security;
create policy "Users can view own alerts" on public.price_alerts for select
  using (
    exists (
      select 1 from public.tracked_products tp
      where tp.id = tracked_product_id and tp.user_id = auth.uid()
    )
  );

-- subscriptions: per-user
alter table public.subscriptions enable row level security;
create policy "Users can view own subscription" on public.subscriptions for select
  using (auth.uid() = user_id);

-- Public read access (no auth needed for product browsing)
alter table public.products enable row level security;
create policy "Products are public" on public.products for select using (true);

alter table public.price_points enable row level security;
create policy "Price points are public" on public.price_points for select using (true);

alter table public.price_signals enable row level security;
create policy "Signals are public" on public.price_signals for select using (true);

alter table public.retailers enable row level security;
create policy "Retailers are public" on public.retailers for select using (true);

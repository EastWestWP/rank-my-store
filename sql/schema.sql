create extension if not exists "uuid-ossp";

create table if not exists templates (
  id uuid primary key default uuid_generate_v4(),
  shop text not null,
  name text not null,
  is_default boolean not null default false,
  blocks jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists templates_shop_idx on templates (shop);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  shop text not null,
  shopify_product_id text not null,
  title text not null,
  status text not null default 'needed_improvement',
  cached_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop, shopify_product_id)
);

create index if not exists products_shop_idx on products (shop);
create index if not exists products_status_idx on products (status);

create table if not exists product_snapshots (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  source text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists product_snapshots_product_idx on product_snapshots (product_id);

create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  shop text not null,
  type text not null,
  status text not null default 'queued',
  template_id uuid references templates(id),
  filter jsonb,
  created_by text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  error text
);

create index if not exists jobs_shop_idx on jobs (shop);
create index if not exists jobs_status_idx on jobs (status);

create table if not exists job_items (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  product_id uuid references products(id),
  shopify_product_id text not null,
  status text not null default 'queued',
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists job_items_job_idx on job_items (job_id);
create index if not exists job_items_status_idx on job_items (status);

create extension if not exists "pgcrypto";

-- ========================
-- PRODUCTS
-- ========================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prix numeric(10,2) not null check (prix >= 0),
  categorie text not null check (
    lower(categorie) in ('plats', 'burgers', 'sandwichs', 'desserts', 'boissons')
  ),
  image_url text,
  disponible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========================
-- ORDERS
-- ========================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  nom_client text not null,
  total numeric(10,2) not null check (total >= 0),
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'en_preparation', 'prete')),
  type_service text not null
    check (type_service in ('sur_place', 'a_emporter')),
  temps_estime integer check (temps_estime >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========================
-- ORDER ITEMS
-- ========================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  nom text not null,
  prix numeric(10,2) not null check (prix >= 0),
  quantite integer not null check (quantite > 0),
  image_url text,
  created_at timestamptz not null default now()
);

-- ========================
-- INDEX
-- ========================
create index if not exists idx_products_categorie on public.products(categorie);
create index if not exists idx_products_disponible on public.products(disponible);
create index if not exists idx_orders_statut on public.orders(statut);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_type_service on public.orders(type_service);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

-- ========================
-- UPDATED_AT TRIGGER
-- ========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();


-- ========================
-- ENABLE RLS
-- ========================
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- ========================
-- POLICIES
-- ========================

-- PRODUCTS (lecture publique)
create policy "public read products"
on public.products
for select
to public
using (true);

-- ADMIN PRODUCTS (temporaire full access)
create policy "public all products"
on public.products
for all
to public
using (true)
with check (true);

-- ORDERS (création + lecture)
create policy "public insert orders"
on public.orders
for insert
to public
with check (true);

create policy "public read orders"
on public.orders
for select
to public
using (true);

-- ADMIN ORDERS (update statut)
create policy "public update orders"
on public.orders
for update
to public
using (true)
with check (true);

-- ORDER ITEMS (création + lecture)
create policy "public insert order_items"
on public.order_items
for insert
to public
with check (true);

create policy "public read order_items"
on public.order_items
for select
to public
using (true);
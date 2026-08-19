-- NeighborChef Phase 1 schema: profiles, recipes, meal planning, marketplace listings, cart-splitting orders.
-- Money is stored as integer cents throughout.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  is_seller boolean not null default false,
  seller_bio text,
  pickup_address text,
  pickup_lat double precision,
  pickup_lng double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles are readable by any authenticated user"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- recipes + recipe_ingredients
-- ---------------------------------------------------------------------------
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  photo_url text,
  servings int not null default 1,
  prep_minutes int,
  cook_minutes int,
  steps jsonb not null default '[]'::jsonb,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recipes_user_id_idx on public.recipes (user_id);

create trigger recipes_set_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

alter table public.recipes enable row level security;

create policy "users manage their own recipes"
  on public.recipes for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  sort_order int not null default 0
);

create index recipe_ingredients_recipe_id_idx on public.recipe_ingredients (recipe_id);

alter table public.recipe_ingredients enable row level security;

create policy "users manage ingredients of their own recipes"
  on public.recipe_ingredients for all
  to authenticated
  using (exists (
    select 1 from public.recipes
    where recipes.id = recipe_ingredients.recipe_id
    and recipes.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.recipes
    where recipes.id = recipe_ingredients.recipe_id
    and recipes.user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- meal_plan_entries (shopping list is derived client-side, not stored)
-- ---------------------------------------------------------------------------
create table public.meal_plan_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  plan_date date not null,
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'dinner', 'snack')),
  servings_planned int not null default 1,
  created_at timestamptz not null default now()
);

create index meal_plan_entries_user_date_idx on public.meal_plan_entries (user_id, plan_date);

alter table public.meal_plan_entries enable row level security;

create policy "users manage their own meal plan entries"
  on public.meal_plan_entries for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- listings (marketplace)
-- ---------------------------------------------------------------------------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  cook_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  photo_url text,
  price_cents int not null check (price_cents >= 0),
  quantity_available int not null default 0 check (quantity_available >= 0),
  category text not null default 'other' check (category in ('main', 'dessert', 'bakery', 'snack', 'other')),
  pickup_start timestamptz not null,
  pickup_end timestamptz not null,
  pickup_location text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  status text not null default 'active' check (status in ('active', 'paused', 'sold_out', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pickup_window_valid check (pickup_end > pickup_start)
);

create index listings_status_cook_idx on public.listings (status, cook_id);

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

alter table public.listings enable row level security;

create policy "active listings are readable by anyone, own listings always readable"
  on public.listings for select
  to authenticated
  using (status = 'active' or cook_id = auth.uid());

create policy "sellers can insert their own listings"
  on public.listings for insert
  to authenticated
  with check (
    cook_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and is_seller = true)
  );

create policy "cooks can update their own listings"
  on public.listings for update
  to authenticated
  using (cook_id = auth.uid())
  with check (cook_id = auth.uid());

create policy "cooks can delete their own listings"
  on public.listings for delete
  to authenticated
  using (cook_id = auth.uid());

-- ---------------------------------------------------------------------------
-- orders + order_items (one order per cook per checkout; cart splits by cook)
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  cook_id uuid not null references public.profiles (id) on delete cascade,
  total_price_cents int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'ready', 'picked_up', 'cancelled')),
  cook_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_buyer_idx on public.orders (buyer_id);
create index orders_cook_idx on public.orders (cook_id);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Buyers may only transition pending -> cancelled; cooks may set any status/cook_note.
create or replace function public.enforce_order_transition()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() = old.buyer_id and auth.uid() <> old.cook_id then
    if old.status <> 'pending' or new.status <> 'cancelled' then
      raise exception 'Buyers may only cancel an order while it is pending';
    end if;
    -- buyers cannot change anything else about the order
    if new.cook_note is distinct from old.cook_note
      or new.total_price_cents is distinct from old.total_price_cents then
      raise exception 'Buyers may only change order status to cancelled';
    end if;
  end if;
  return new;
end;
$$;

create trigger orders_enforce_transition
  before update on public.orders
  for each row execute function public.enforce_order_transition();

alter table public.orders enable row level security;

create policy "orders are visible to buyer and cook"
  on public.orders for select
  to authenticated
  using (auth.uid() = buyer_id or auth.uid() = cook_id);

create policy "buyer or cook can update an order"
  on public.orders for update
  to authenticated
  using (auth.uid() = buyer_id or auth.uid() = cook_id)
  with check (auth.uid() = buyer_id or auth.uid() = cook_id);

-- No direct insert policy: orders are only created via the place_order() RPC below (security definer).

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  listing_id uuid not null references public.listings (id),
  quantity int not null check (quantity > 0),
  unit_price_cents int not null,
  subtotal_cents int not null
);

create index order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

create policy "order items are visible via their parent order"
  on public.order_items for select
  to authenticated
  using (exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
    and (orders.buyer_id = auth.uid() or orders.cook_id = auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- place_order RPC: transactional checkout for one cook's items from the cart.
-- Locks listing rows, verifies stock, snapshots current price (never trusts
-- client-supplied prices), decrements inventory, and creates the order.
-- ---------------------------------------------------------------------------
create or replace function public.place_order(p_cook_id uuid, p_items jsonb)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_listing public.listings%rowtype;
  v_quantity int;
  v_subtotal int;
  v_total int := 0;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.orders (buyer_id, cook_id, total_price_cents, status)
  values (auth.uid(), p_cook_id, 0, 'pending')
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::int;
    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid quantity in cart item';
    end if;

    select * into v_listing
    from public.listings
    where id = (v_item ->> 'listing_id')::uuid
    and cook_id = p_cook_id
    for update;

    if not found then
      raise exception 'Listing % not found for this cook', (v_item ->> 'listing_id');
    end if;

    if v_listing.status <> 'active' then
      raise exception 'Listing "%" is no longer available', v_listing.title;
    end if;

    if v_listing.quantity_available < v_quantity then
      raise exception 'Not enough stock for "%": % available, % requested',
        v_listing.title, v_listing.quantity_available, v_quantity;
    end if;

    v_subtotal := v_listing.price_cents * v_quantity;
    v_total := v_total + v_subtotal;

    insert into public.order_items (order_id, listing_id, quantity, unit_price_cents, subtotal_cents)
    values (v_order_id, v_listing.id, v_quantity, v_listing.price_cents, v_subtotal);

    update public.listings
    set quantity_available = quantity_available - v_quantity,
        status = case when quantity_available - v_quantity <= 0 then 'sold_out' else status end
    where id = v_listing.id;
  end loop;

  update public.orders set total_price_cents = v_total where id = v_order_id;

  return v_order_id;
end;
$$;

grant execute on function public.place_order(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage buckets: recipe-photos, listing-photos, avatars.
-- Public read; write restricted to a path prefixed with the caller's own uid.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('recipe-photos', 'recipe-photos', true),
  ('listing-photos', 'listing-photos', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "public read access to app photo buckets"
  on storage.objects for select
  to public
  using (bucket_id in ('recipe-photos', 'listing-photos', 'avatars'));

create policy "users can upload to their own folder in app photo buckets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('recipe-photos', 'listing-photos', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can update their own files in app photo buckets"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('recipe-photos', 'listing-photos', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users can delete their own files in app photo buckets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('recipe-photos', 'listing-photos', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

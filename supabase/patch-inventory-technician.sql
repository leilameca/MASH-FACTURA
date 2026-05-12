-- MASH Flow - Inventory + technician role patch
-- Run this in Supabase SQL Editor after schema.sql / patch-module-enums.sql.

begin;

alter type public.user_role add value if not exists 'tecnico';

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  unit text not null default 'unidad',
  current_stock numeric(12,2) not null default 0 check (current_stock >= 0),
  minimum_stock numeric(12,2) not null default 0 check (minimum_stock >= 0),
  unit_cost numeric(12,2) not null default 0 check (unit_cost >= 0),
  supplier_id uuid references public.suppliers(id) on delete set null,
  notes text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_materials (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_cost numeric(12,2) not null default 0 check (unit_cost >= 0),
  total_cost numeric(12,2) not null default 0 check (total_cost >= 0),
  notes text,
  used_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_inventory_items_updated_at on public.inventory_items;
create trigger set_inventory_items_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

drop trigger if exists set_order_materials_updated_at on public.order_materials;
create trigger set_order_materials_updated_at
before update on public.order_materials
for each row execute function public.set_updated_at();

create index if not exists idx_inventory_items_name on public.inventory_items using gin (to_tsvector('spanish', coalesce(name, '') || ' ' || coalesce(notes, '')));
create index if not exists idx_inventory_items_category on public.inventory_items (category);
create index if not exists idx_inventory_items_is_active on public.inventory_items (is_active);
create index if not exists idx_inventory_items_supplier_id on public.inventory_items (supplier_id);
create index if not exists idx_order_materials_order_id on public.order_materials (order_id);
create index if not exists idx_order_materials_inventory_item_id on public.order_materials (inventory_item_id);
create index if not exists idx_order_materials_created_at on public.order_materials (created_at desc);

alter table public.inventory_items enable row level security;
alter table public.order_materials enable row level security;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid()
$$;

drop policy if exists "Authenticated users can manage inventory items" on public.inventory_items;
create policy "Authenticated users can manage inventory items"
on public.inventory_items for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff', 'tecnico'))
with check (public.current_user_role() in ('admin', 'manager', 'staff', 'tecnico'));

drop policy if exists "Authenticated users can manage order materials" on public.order_materials;
create policy "Authenticated users can manage order materials"
on public.order_materials for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff', 'tecnico'))
with check (public.current_user_role() in ('admin', 'manager', 'staff', 'tecnico'));

-- Harden technician access at the database layer. Existing broad policies are
-- replaced on sensitive tables so technicians cannot read/write modules outside
-- orders, inventory, order materials, images, and their own profile.

drop policy if exists "Authenticated users can manage clients" on public.clients;
create policy "Authenticated non-technicians can manage clients"
on public.clients for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'))
with check (public.current_user_role() in ('admin', 'manager', 'staff'));

drop policy if exists "Authenticated users can manage products" on public.products;
create policy "Authenticated non-technicians can manage products"
on public.products for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'))
with check (public.current_user_role() in ('admin', 'manager', 'staff'));

drop policy if exists "Authenticated users can manage quotes" on public.quotes;
create policy "Authenticated non-technicians can manage quotes"
on public.quotes for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'))
with check (public.current_user_role() in ('admin', 'manager', 'staff'));

drop policy if exists "Authenticated users can manage quote items" on public.quote_items;
create policy "Authenticated non-technicians can manage quote items"
on public.quote_items for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'))
with check (public.current_user_role() in ('admin', 'manager', 'staff'));

drop policy if exists "Authenticated users can manage invoices" on public.invoices;
create policy "Authenticated non-technicians can manage invoices"
on public.invoices for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'))
with check (public.current_user_role() in ('admin', 'manager', 'staff'));

drop policy if exists "Authenticated users can manage invoice items" on public.invoice_items;
create policy "Authenticated non-technicians can manage invoice items"
on public.invoice_items for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'))
with check (public.current_user_role() in ('admin', 'manager', 'staff'));

drop policy if exists "Authenticated users can manage payments" on public.payments;
create policy "Authenticated non-technicians can manage payments"
on public.payments for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'))
with check (public.current_user_role() in ('admin', 'manager', 'staff'));

drop policy if exists "Authenticated users can manage expenses" on public.expenses;
create policy "Authenticated non-technicians can manage expenses"
on public.expenses for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'))
with check (public.current_user_role() in ('admin', 'manager', 'staff'));

drop policy if exists "Authenticated users can manage suppliers" on public.suppliers;
create policy "Authenticated non-technicians can manage suppliers"
on public.suppliers for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'))
with check (public.current_user_role() in ('admin', 'manager', 'staff'));

drop policy if exists "Authenticated users can manage supplier payments" on public.supplier_payments;
create policy "Authenticated non-technicians can manage supplier payments"
on public.supplier_payments for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'))
with check (public.current_user_role() in ('admin', 'manager', 'staff'));

drop policy if exists "Authenticated users can manage documents" on public.documents;
create policy "Authenticated non-technicians can manage documents"
on public.documents for all
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'))
with check (public.current_user_role() in ('admin', 'manager', 'staff'));

drop policy if exists "Authenticated users can read business settings" on public.business_settings;
create policy "Authenticated non-technicians can read business settings"
on public.business_settings for select
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'));

drop policy if exists "Authenticated users can update business settings" on public.business_settings;
create policy "Authenticated non-technicians can update business settings"
on public.business_settings for update
to authenticated
using (public.current_user_role() in ('admin', 'manager', 'staff'))
with check (public.current_user_role() in ('admin', 'manager', 'staff'));

commit;

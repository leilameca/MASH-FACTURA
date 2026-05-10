-- MASH Flow - Supabase schema v1.0
-- Martinez Star Home / MASH
-- Paste this file into the Supabase SQL Editor and run it once.

begin;

create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

do $$ begin
  create type public.user_role as enum ('admin', 'manager', 'staff', 'viewer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.quote_status as enum ('draft', 'sent', 'approved', 'rejected', 'expired', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.invoice_status as enum ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum (
    'nuevo',
    'cotizado',
    'aprobado',
    'encargado',
    'en_fabricacion',
    'en_reparacion',
    'esperando_materiales',
    'listo',
    'en_camino',
    'entregado',
    'pagado',
    'cancelado'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_priority as enum ('baja', 'media', 'alta');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_type as enum ('fabricacion', 'reparacion', 'venta', 'instalacion', 'mantenimiento');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.repair_status as enum ('recibido', 'diagnosticado', 'en_reparacion', 'listo', 'entregado', 'cancelado');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_method as enum ('efectivo', 'transferencia', 'tarjeta', 'qik', 'cheque', 'otro');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.expense_category as enum ('materiales', 'envio', 'servicios', 'nomina', 'alquiler', 'herramientas', 'suplidores', 'transporte', 'publicidad', 'otros');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.document_type as enum ('cotizacion', 'factura', 'garantia', 'albaran', 'albaran_entrega', 'albaran_recogida', 'recibo', 'recibo_pago', 'orden', 'otro');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.document_status as enum ('draft', 'generated', 'sent', 'signed', 'void');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.image_type as enum ('reference', 'before', 'during', 'after', 'receipt', 'product', 'other');
exception when duplicate_object then null;
end $$;

-- ============================================================================
-- COMMON TRIGGERS
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- TABLES
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  phone text,
  avatar_url text,
  role public.user_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  whatsapp text,
  email text,
  address text,
  reference text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  phone text,
  whatsapp text,
  email text,
  address text,
  category text,
  tax_id text,
  notes text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  suggested_price numeric(12,2) not null default 0 check (suggested_price >= 0),
  internal_cost numeric(12,2) not null default 0 check (internal_cost >= 0),
  estimated_margin numeric(8,4) generated always as (
    case
      when suggested_price > 0 then round(((suggested_price - internal_cost) / suggested_price), 4)
      else 0
    end
  ) stored,
  image_url text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  quote_number text not null unique,
  status public.quote_status not null default 'draft',
  issue_date date not null default current_date,
  valid_until date,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  tax_enabled boolean not null default false,
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  pickup_fee numeric(12,2) not null default 0 check (pickup_fee >= 0),
  installation_fee numeric(12,2) not null default 0 check (installation_fee >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  required_deposit numeric(12,2) not null default 0 check (required_deposit >= 0),
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_valid_dates check (valid_until is null or valid_until >= issue_date)
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  internal_cost numeric(12,2) not null default 0 check (internal_cost >= 0),
  line_total numeric(12,2) generated always as (round(quantity * unit_price, 2)) stored,
  line_cost numeric(12,2) generated always as (round(quantity * internal_cost, 2)) stored,
  line_margin numeric(12,2) generated always as (round((quantity * unit_price) - (quantity * internal_cost), 2)) stored,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  quote_id uuid references public.quotes(id) on delete set null,
  invoice_number text not null unique,
  ncf text,
  status public.invoice_status not null default 'draft',
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  tax_enabled boolean not null default false,
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  pickup_fee numeric(12,2) not null default 0 check (pickup_fee >= 0),
  installation_fee numeric(12,2) not null default 0 check (installation_fee >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  amount_paid numeric(12,2) not null default 0 check (amount_paid >= 0),
  balance_due numeric(12,2) generated always as (greatest(total - amount_paid, 0)) stored,
  payment_method public.payment_method,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quote_item_id uuid references public.quote_items(id) on delete set null,
  description text not null,
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  internal_cost numeric(12,2) not null default 0 check (internal_cost >= 0),
  line_total numeric(12,2) generated always as (round(quantity * unit_price, 2)) stored,
  line_cost numeric(12,2) generated always as (round(quantity * internal_cost, 2)) stored,
  line_margin numeric(12,2) generated always as (round((quantity * unit_price) - (quantity * internal_cost), 2)) stored,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  quote_id uuid references public.quotes(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  order_number text unique,
  order_type public.order_type not null default 'fabricacion',
  status public.order_status not null default 'nuevo',
  priority public.order_priority not null default 'media',
  estimated_delivery_date date,
  actual_delivery_date date,
  responsible uuid references public.profiles(id) on delete set null,
  internal_notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_delivery_dates check (
    actual_delivery_date is null
    or estimated_delivery_date is null
    or actual_delivery_date >= created_at::date
  )
);

create table if not exists public.order_images (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  image_url text not null,
  storage_path text,
  image_type public.image_type not null default 'reference',
  caption text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.repairs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  order_id uuid references public.orders(id) on delete set null,
  repair_number text unique,
  pickup_date date,
  pickup_time time,
  pickup_address text,
  delivered_by text,
  estimated_review_days integer not null default 3 check (estimated_review_days >= 0),
  furniture_type text,
  material text,
  color text,
  condition_status text,
  condition_notes text,
  problem_description text,
  accessories_received text,
  diagnosis text,
  repair_cost numeric(12,2) not null default 0 check (repair_cost >= 0),
  status public.repair_status not null default 'recibido',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.repair_images (
  id uuid primary key default gen_random_uuid(),
  repair_id uuid not null references public.repairs(id) on delete cascade,
  image_url text not null,
  storage_path text,
  image_type public.image_type not null default 'before',
  caption text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  invoice_id uuid references public.invoices(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  payment_method public.payment_method not null,
  payment_date date not null default current_date,
  reference text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers(id) on delete set null,
  category public.expense_category not null default 'otros',
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  expense_date date not null default current_date,
  payment_method public.payment_method,
  receipt_url text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplier_payments (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  expense_id uuid references public.expenses(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  payment_method public.payment_method not null,
  payment_date date not null default current_date,
  reference text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  repair_id uuid references public.repairs(id) on delete set null,
  document_type public.document_type not null,
  document_number text not null,
  pdf_url text not null,
  storage_path text,
  status public.document_status not null default 'generated',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_type, document_number)
);

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Martinez Star Home',
  brand_name text not null default 'MASH',
  tax_id text,
  email text,
  phone text,
  whatsapp text,
  address text,
  logo_url text,
  default_tax_rate numeric(5,4) not null default 0.1800 check (default_tax_rate >= 0),
  currency text not null default 'DOP',
  quote_prefix text not null default 'COT',
  invoice_prefix text not null default 'FAC',
  order_prefix text not null default 'PED',
  repair_prefix text not null default 'REP',
  quote_terms text,
  invoice_terms text,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.business_settings (business_name, brand_name)
select 'Martinez Star Home', 'MASH'
where not exists (select 1 from public.business_settings);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_suppliers_updated_at on public.suppliers;
create trigger set_suppliers_updated_at
before update on public.suppliers
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_quotes_updated_at on public.quotes;
create trigger set_quotes_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

drop trigger if exists set_quote_items_updated_at on public.quote_items;
create trigger set_quote_items_updated_at
before update on public.quote_items
for each row execute function public.set_updated_at();

drop trigger if exists set_invoices_updated_at on public.invoices;
create trigger set_invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

drop trigger if exists set_invoice_items_updated_at on public.invoice_items;
create trigger set_invoice_items_updated_at
before update on public.invoice_items
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_repairs_updated_at on public.repairs;
create trigger set_repairs_updated_at
before update on public.repairs
for each row execute function public.set_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists set_expenses_updated_at on public.expenses;
create trigger set_expenses_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

drop trigger if exists set_supplier_payments_updated_at on public.supplier_payments;
create trigger set_supplier_payments_updated_at
before update on public.supplier_payments
for each row execute function public.set_updated_at();

drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists set_business_settings_updated_at on public.business_settings;
create trigger set_business_settings_updated_at
before update on public.business_settings
for each row execute function public.set_updated_at();

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_clients_full_name on public.clients using gin (to_tsvector('spanish', coalesce(full_name, '')));
create index if not exists idx_clients_phone on public.clients (phone);
create index if not exists idx_clients_email on public.clients (email);
create index if not exists idx_clients_created_at on public.clients (created_at desc);

create index if not exists idx_suppliers_name on public.suppliers using gin (to_tsvector('spanish', coalesce(name, '')));
create index if not exists idx_suppliers_category on public.suppliers (category);
create index if not exists idx_suppliers_is_active on public.suppliers (is_active);

create index if not exists idx_products_name on public.products using gin (to_tsvector('spanish', coalesce(name, '') || ' ' || coalesce(description, '')));
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_is_active on public.products (is_active);

create index if not exists idx_quotes_client_id on public.quotes (client_id);
create index if not exists idx_quotes_status on public.quotes (status);
create index if not exists idx_quotes_issue_date on public.quotes (issue_date desc);
create index if not exists idx_quotes_quote_number on public.quotes (quote_number);
create index if not exists idx_quote_items_quote_id on public.quote_items (quote_id);
create index if not exists idx_quote_items_product_id on public.quote_items (product_id);

create index if not exists idx_invoices_client_id on public.invoices (client_id);
create index if not exists idx_invoices_quote_id on public.invoices (quote_id);
create index if not exists idx_invoices_status on public.invoices (status);
create index if not exists idx_invoices_issue_date on public.invoices (issue_date desc);
create index if not exists idx_invoices_invoice_number on public.invoices (invoice_number);
create index if not exists idx_invoice_items_invoice_id on public.invoice_items (invoice_id);
create index if not exists idx_invoice_items_product_id on public.invoice_items (product_id);

create index if not exists idx_orders_client_id on public.orders (client_id);
create index if not exists idx_orders_quote_id on public.orders (quote_id);
create index if not exists idx_orders_invoice_id on public.orders (invoice_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_priority on public.orders (priority);
create index if not exists idx_orders_estimated_delivery_date on public.orders (estimated_delivery_date);
create index if not exists idx_order_images_order_id on public.order_images (order_id);

create index if not exists idx_repairs_client_id on public.repairs (client_id);
create index if not exists idx_repairs_order_id on public.repairs (order_id);
create index if not exists idx_repairs_status on public.repairs (status);
create index if not exists idx_repairs_pickup_date on public.repairs (pickup_date desc);
create index if not exists idx_repair_images_repair_id on public.repair_images (repair_id);

create index if not exists idx_payments_client_id on public.payments (client_id);
create index if not exists idx_payments_invoice_id on public.payments (invoice_id);
create index if not exists idx_payments_payment_date on public.payments (payment_date desc);

create index if not exists idx_expenses_supplier_id on public.expenses (supplier_id);
create index if not exists idx_expenses_category on public.expenses (category);
create index if not exists idx_expenses_expense_date on public.expenses (expense_date desc);

create index if not exists idx_supplier_payments_supplier_id on public.supplier_payments (supplier_id);
create index if not exists idx_supplier_payments_expense_id on public.supplier_payments (expense_id);
create index if not exists idx_supplier_payments_payment_date on public.supplier_payments (payment_date desc);

create index if not exists idx_documents_client_id on public.documents (client_id);
create index if not exists idx_documents_order_id on public.documents (order_id);
create index if not exists idx_documents_invoice_id on public.documents (invoice_id);
create index if not exists idx_documents_quote_id on public.documents (quote_id);
create index if not exists idx_documents_document_type on public.documents (document_type);
create index if not exists idx_documents_created_at on public.documents (created_at desc);

-- ============================================================================
-- RLS
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.products enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_images enable row level security;
alter table public.repairs enable row level security;
alter table public.repair_images enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.suppliers enable row level security;
alter table public.supplier_payments enable row level security;
alter table public.documents enable row level security;
alter table public.business_settings enable row level security;

-- Profiles: users can read team profiles, but only update their own profile.
drop policy if exists "Authenticated users can read profiles" on public.profiles;
create policy "Authenticated users can read profiles"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Basic internal-app policy: any authenticated user can manage operational data.
-- For stricter roles later, replace these with role-based policies using profiles.role.

drop policy if exists "Authenticated users can manage clients" on public.clients;
create policy "Authenticated users can manage clients"
on public.clients for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage products" on public.products;
create policy "Authenticated users can manage products"
on public.products for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage quotes" on public.quotes;
create policy "Authenticated users can manage quotes"
on public.quotes for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage quote items" on public.quote_items;
create policy "Authenticated users can manage quote items"
on public.quote_items for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage invoices" on public.invoices;
create policy "Authenticated users can manage invoices"
on public.invoices for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage invoice items" on public.invoice_items;
create policy "Authenticated users can manage invoice items"
on public.invoice_items for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage orders" on public.orders;
create policy "Authenticated users can manage orders"
on public.orders for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage order images" on public.order_images;
create policy "Authenticated users can manage order images"
on public.order_images for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage repairs" on public.repairs;
create policy "Authenticated users can manage repairs"
on public.repairs for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage repair images" on public.repair_images;
create policy "Authenticated users can manage repair images"
on public.repair_images for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage payments" on public.payments;
create policy "Authenticated users can manage payments"
on public.payments for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage expenses" on public.expenses;
create policy "Authenticated users can manage expenses"
on public.expenses for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage suppliers" on public.suppliers;
create policy "Authenticated users can manage suppliers"
on public.suppliers for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage supplier payments" on public.supplier_payments;
create policy "Authenticated users can manage supplier payments"
on public.supplier_payments for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage documents" on public.documents;
create policy "Authenticated users can manage documents"
on public.documents for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can read business settings" on public.business_settings;
create policy "Authenticated users can read business settings"
on public.business_settings for select
to authenticated
using (true);

drop policy if exists "Authenticated users can update business settings" on public.business_settings;
create policy "Authenticated users can update business settings"
on public.business_settings for update
to authenticated
using (true)
with check (true);

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('order-images', 'order-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('repair-images', 'repair-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('receipts', 'receipts', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('generated-documents', 'generated-documents', false, 20971520, array['application/pdf']),
  ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for product/order/repair images.
drop policy if exists "Public can view public MASH images" on storage.objects;
create policy "Public can view public MASH images"
on storage.objects for select
to public
using (bucket_id in ('order-images', 'repair-images', 'product-images'));

-- Authenticated users can manage all MASH storage buckets.
drop policy if exists "Authenticated users can upload MASH files" on storage.objects;
create policy "Authenticated users can upload MASH files"
on storage.objects for insert
to authenticated
with check (bucket_id in ('order-images', 'repair-images', 'receipts', 'generated-documents', 'product-images'));

drop policy if exists "Authenticated users can read private MASH files" on storage.objects;
create policy "Authenticated users can read private MASH files"
on storage.objects for select
to authenticated
using (bucket_id in ('receipts', 'generated-documents'));

drop policy if exists "Authenticated users can update MASH files" on storage.objects;
create policy "Authenticated users can update MASH files"
on storage.objects for update
to authenticated
using (bucket_id in ('order-images', 'repair-images', 'receipts', 'generated-documents', 'product-images'))
with check (bucket_id in ('order-images', 'repair-images', 'receipts', 'generated-documents', 'product-images'));

drop policy if exists "Authenticated users can delete MASH files" on storage.objects;
create policy "Authenticated users can delete MASH files"
on storage.objects for delete
to authenticated
using (bucket_id in ('order-images', 'repair-images', 'receipts', 'generated-documents', 'product-images'));

commit;

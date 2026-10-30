-- ============================================================================
-- LAIRA CHARMS — INITIAL DATABASE SCHEMA MIGRATION (00001)
-- ============================================================================

-- Ensure required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Custom Enum Types
create type user_role as enum ('customer', 'admin');
create type product_type as enum ('ready_made', 'customizable', 'bespoke_quote');
create type stock_mode as enum ('tracked', 'unlimited', 'made_to_order');
create type product_status as enum ('draft', 'published', 'archived');
create type custom_request_status as enum ('submitted', 'under_review', 'quote_issued', 'accepted', 'declined', 'cancelled');
create type quotation_status as enum ('draft', 'published', 'accepted', 'declined', 'expired', 'superseded');
create type payment_status as enum ('awaiting_payment', 'verification_pending', 'verified', 'rejected', 'refunded');
create type order_status as enum (
  'pending_payment',
  'awaiting_verification',
  'confirmed',
  'in_production',
  'ready_to_ship',
  'shipped',
  'delivered',
  'on_hold',
  'cancelled',
  'refunded'
);
create type message_visibility as enum ('customer_and_admin', 'internal_admin_only');

-- ----------------------------------------------------------------------------
-- 1. Profiles Table (Linked to Supabase auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);

-- Auto-create profile trigger on auth.users creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, phone, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'phone',
    'customer'
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. Customer Addresses
-- ----------------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  province text not null,
  postal_code text,
  delivery_notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_addresses_user_id on public.addresses(user_id);

-- ----------------------------------------------------------------------------
-- 3. Categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_categories_slug on public.categories(slug);

-- ----------------------------------------------------------------------------
-- 4. Products & Media
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  slug text unique not null,
  title text not null,
  description text not null,
  product_type product_type not null default 'ready_made',
  base_price_minor bigint not null check (base_price_minor >= 0),
  currency text not null default 'PKR',
  status product_status not null default 'draft',
  stock_mode stock_mode not null default 'tracked',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  lead_time_days integer not null default 3 check (lead_time_days >= 0),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_category on public.products(category_id);

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  alt_text text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_media_product on public.product_media(product_id);

-- ----------------------------------------------------------------------------
-- 5. Option Groups & Values (Fixed Customization)
-- ----------------------------------------------------------------------------
create table if not exists public.option_groups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  is_required boolean not null default false,
  sort_order integer not null default 0
);

create index if not exists idx_option_groups_product on public.option_groups(product_id);

create table if not exists public.option_values (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.option_groups(id) on delete cascade,
  label text not null,
  price_delta_minor bigint not null default 0,
  is_available boolean not null default true,
  sort_order integer not null default 0
);

create index if not exists idx_option_values_group on public.option_values(group_id);

-- ----------------------------------------------------------------------------
-- 6. Custom Requests & Quotations (Bespoke Flow)
-- ----------------------------------------------------------------------------
create table if not exists public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  guest_email text,
  guest_token_hash text,
  title text not null,
  brief text not null,
  product_reference_id uuid references public.products(id) on delete set null,
  desired_delivery_date date,
  status custom_request_status not null default 'submitted',
  assigned_admin_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_custom_request_owner check (customer_id is not null or (guest_email is not null and guest_token_hash is not null))
);

create table if not exists public.custom_request_media (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_requests(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_requests(id) on delete cascade,
  version integer not null default 1,
  status quotation_status not null default 'draft',
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'PKR',
  scope text not null,
  production_days integer not null check (production_days >= 0),
  valid_until timestamptz not null,
  created_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique(request_id, version)
);

create index if not exists idx_quotations_request on public.quotations(request_id);

-- ----------------------------------------------------------------------------
-- 7. Orders, Items & Status History
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  customer_id uuid references public.profiles(id) on delete set null,
  guest_email text,
  guest_token_hash text,
  shipping_address_snapshot jsonb not null,
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  shipping_minor bigint not null check (shipping_minor >= 0),
  total_minor bigint not null check (total_minor >= 0),
  currency text not null default 'PKR',
  order_status order_status not null default 'pending_payment',
  payment_status payment_status not null default 'awaiting_payment',
  notes text,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_order_owner check (customer_id is not null or (guest_email is not null and guest_token_hash is not null))
);

create index if not exists idx_orders_reference on public.orders(reference);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_guest_email on public.orders(guest_email);
create index if not exists idx_orders_status on public.orders(order_status, payment_status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_title text not null,
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  quantity integer not null check (quantity > 0),
  total_minor bigint not null check (total_minor >= 0),
  customization_snapshot jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  previous_status order_status not null,
  new_status order_status not null,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_type text not null default 'system',
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_status_history_order on public.order_status_history(order_id);

-- ----------------------------------------------------------------------------
-- 8. Payments & Manual Proof Records
-- ----------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'PKR',
  status payment_status not null default 'awaiting_payment',
  payment_method_snapshot jsonb not null,
  proof_storage_path text,
  proof_submitted_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_payments_status on public.payments(status);

-- ----------------------------------------------------------------------------
-- 9. Conversations & Realtime Messaging
-- ----------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  context_type text not null default 'general', -- 'general', 'product', 'custom_request', 'quotation', 'order'
  context_id uuid,
  customer_id uuid references public.profiles(id) on delete set null,
  guest_email text,
  guest_token_hash text,
  title text not null default 'Inquiry',
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conversations_customer on public.conversations(customer_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_type text not null, -- 'customer', 'admin', 'system'
  body text not null,
  visibility message_visibility not null default 'customer_and_admin',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at);

create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 10. Store Settings & Audit Logs
-- ----------------------------------------------------------------------------
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_email text,
  action text not null,
  entity text not null,
  entity_id text not null,
  details jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_entity on public.audit_logs(entity, entity_id);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id);

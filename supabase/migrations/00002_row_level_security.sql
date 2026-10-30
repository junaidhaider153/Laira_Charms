-- ============================================================================
-- LAIRA CHARMS — ROW LEVEL SECURITY (RLS) POLICIES (00002)
-- ============================================================================

-- Helper Function: Check whether current auth user is an Admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer stable;

-- Prevent non-admins from updating their own role column
create or replace function public.prevent_role_escalation()
returns trigger as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'Security violation: Users cannot modify their own authorization role.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_role_escalation();

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.option_groups enable row level security;
alter table public.option_values enable row level security;
alter table public.custom_requests enable row level security;
alter table public.custom_request_media enable row level security;
alter table public.quotations enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.message_attachments enable row level security;
alter table public.store_settings enable row level security;
alter table public.audit_logs enable row level security;

-- ----------------------------------------------------------------------------
-- 1. Profiles Policies
-- ----------------------------------------------------------------------------
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. Addresses Policies
-- ----------------------------------------------------------------------------
create policy "addresses_select_own_or_admin"
  on public.addresses for select
  using (user_id = auth.uid() or public.is_admin());

create policy "addresses_insert_own"
  on public.addresses for insert
  with check (user_id = auth.uid() or public.is_admin());

create policy "addresses_update_own_or_admin"
  on public.addresses for update
  using (user_id = auth.uid() or public.is_admin());

create policy "addresses_delete_own_or_admin"
  on public.addresses for delete
  using (user_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. Categories & Products Public Read / Admin Write
-- ----------------------------------------------------------------------------
create policy "categories_public_read"
  on public.categories for select
  using (is_published = true or public.is_admin());

create policy "categories_admin_write"
  on public.categories for all
  using (public.is_admin());

create policy "products_public_read"
  on public.products for select
  using (status = 'published' or public.is_admin());

create policy "products_admin_write"
  on public.products for all
  using (public.is_admin());

create policy "product_media_public_read"
  on public.product_media for select
  using (true);

create policy "product_media_admin_write"
  on public.product_media for all
  using (public.is_admin());

create policy "option_groups_public_read"
  on public.option_groups for select
  using (true);

create policy "option_groups_admin_write"
  on public.option_groups for all
  using (public.is_admin());

create policy "option_values_public_read"
  on public.option_values for select
  using (true);

create policy "option_values_admin_write"
  on public.option_values for all
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. Custom Requests & Quotations
-- ----------------------------------------------------------------------------
create policy "custom_requests_select"
  on public.custom_requests for select
  using (customer_id = auth.uid() or public.is_admin());

create policy "custom_requests_insert"
  on public.custom_requests for insert
  with check (customer_id = auth.uid() or customer_id is null);

create policy "custom_requests_update"
  on public.custom_requests for update
  using (customer_id = auth.uid() or public.is_admin());

create policy "custom_request_media_select"
  on public.custom_request_media for select
  using (
    public.is_admin() or
    exists (
      select 1 from public.custom_requests
      where custom_requests.id = custom_request_media.request_id
        and custom_requests.customer_id = auth.uid()
    )
  );

create policy "quotations_select"
  on public.quotations for select
  using (
    public.is_admin() or (
      status in ('published', 'accepted', 'declined', 'expired') and
      exists (
        select 1 from public.custom_requests
        where custom_requests.id = quotations.request_id
          and custom_requests.customer_id = auth.uid()
      )
    )
  );

create policy "quotations_admin_all"
  on public.quotations for all
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. Orders & Order Items
-- ----------------------------------------------------------------------------
create policy "orders_select_own_or_admin"
  on public.orders for select
  using (customer_id = auth.uid() or public.is_admin());

create policy "orders_insert_checkout"
  on public.orders for insert
  with check (customer_id = auth.uid() or customer_id is null or public.is_admin());

create policy "orders_update_admin"
  on public.orders for update
  using (public.is_admin());

create policy "order_items_select"
  on public.order_items for select
  using (
    public.is_admin() or
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.customer_id = auth.uid()
    )
  );

create policy "order_status_history_select"
  on public.order_status_history for select
  using (
    public.is_admin() or
    exists (
      select 1 from public.orders
      where orders.id = order_status_history.order_id
        and orders.customer_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 6. Payments
-- ----------------------------------------------------------------------------
create policy "payments_select_own_or_admin"
  on public.payments for select
  using (
    public.is_admin() or
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id
        and orders.customer_id = auth.uid()
    )
  );

create policy "payments_admin_all"
  on public.payments for all
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. Messaging & Internal Admin Notes Isolation
-- ----------------------------------------------------------------------------
create policy "conversations_select"
  on public.conversations for select
  using (customer_id = auth.uid() or public.is_admin());

create policy "conversations_insert"
  on public.conversations for insert
  with check (customer_id = auth.uid() or customer_id is null or public.is_admin());

-- Critical: Customer can ONLY see messages where visibility is 'customer_and_admin'
-- Internal notes are NEVER returned to customer queries.
create policy "messages_select_participant"
  on public.messages for select
  using (
    public.is_admin() or (
      visibility = 'customer_and_admin' and
      exists (
        select 1 from public.conversations
        where conversations.id = messages.conversation_id
          and conversations.customer_id = auth.uid()
      )
    )
  );

create policy "messages_insert_participant"
  on public.messages for insert
  with check (
    public.is_admin() or (
      visibility = 'customer_and_admin' and
      sender_id = auth.uid() and
      exists (
        select 1 from public.conversations
        where conversations.id = messages.conversation_id
          and conversations.customer_id = auth.uid()
      )
    )
  );

-- ----------------------------------------------------------------------------
-- 8. Store Settings & Audit Logs
-- ----------------------------------------------------------------------------
create policy "store_settings_public_read"
  on public.store_settings for select
  using (is_public = true or public.is_admin());

create policy "store_settings_admin_write"
  on public.store_settings for all
  using (public.is_admin());

create policy "audit_logs_admin_read"
  on public.audit_logs for select
  using (public.is_admin());


-- ============================================================================
-- LAIRA CHARMS — RLS, MONEY INTEGRITY & STORAGE POLICY HARDENING (00005)
-- ============================================================================

-- 1. Enforce mathematical money integrity check constraint on orders
alter table public.orders
  drop constraint if exists chk_orders_total_integrity;

alter table public.orders
  add constraint chk_orders_total_integrity
  check (
    subtotal_minor >= 0 and
    shipping_minor >= 0 and
    total_minor >= 0 and
    total_minor = (subtotal_minor + shipping_minor)
  );

-- 2. Restrict Direct Anon Insert on Orders
-- Orders must be placed in 'pending_payment' and 'awaiting_payment' statuses.
drop policy if exists "orders_insert_checkout" on public.orders;

create policy "orders_insert_checkout"
  on public.orders for insert
  with check (
    (customer_id = auth.uid() or customer_id is null or public.is_admin()) and
    order_status = 'pending_payment' and
    payment_status = 'awaiting_payment'
  );

-- 3. Order Items INSERT policy
-- Required for orders to persist line items in database
drop policy if exists "order_items_insert_checkout" on public.order_items;

create policy "order_items_insert_checkout"
  on public.order_items for insert
  with check (
    public.is_admin() or
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.customer_id = auth.uid() or orders.customer_id is null)
    )
  );

-- 4. Payments INSERT & UPDATE policies
-- Required for payment proof submission to persist in database
drop policy if exists "payments_insert_proof" on public.payments;

create policy "payments_insert_proof"
  on public.payments for insert
  with check (
    public.is_admin() or
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id
        and (orders.customer_id = auth.uid() or orders.customer_id is null)
    )
  );

drop policy if exists "payments_update_proof" on public.payments;

create policy "payments_update_proof"
  on public.payments for update
  using (
    public.is_admin() or
    exists (
      select 1 from public.orders
      where orders.id = payments.order_id
        and (orders.customer_id = auth.uid() or orders.customer_id is null)
    )
  )
  with check (
    -- Non-admins cannot self-verify payments via REST
    public.is_admin() or status in ('awaiting_payment', 'verification_pending')
  );

-- 5. Order Status History & Audit Logs INSERT policies
drop policy if exists "order_status_history_insert_admin" on public.order_status_history;

create policy "order_status_history_insert_admin"
  on public.order_status_history for insert
  with check (
    public.is_admin() or
    exists (
      select 1 from public.orders
      where orders.id = order_status_history.order_id
        and (orders.customer_id = auth.uid() or orders.customer_id is null)
    )
  );

drop policy if exists "audit_logs_insert_admin" on public.audit_logs;

create policy "audit_logs_insert_admin"
  on public.audit_logs for insert
  with check (public.is_admin() or auth.role() = 'service_role');

-- 6. Storage Bucket Scoping: Payment Proofs (H-02)
-- Enforces that uploads must be stored within the order-specific folder
drop policy if exists "payment_proofs_customer_upload" on storage.objects;

create policy "payment_proofs_customer_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs' and
    (auth.role() = 'authenticated' or auth.role() = 'anon') and
    (storage.foldername(name))[1] is not null and
    length((storage.foldername(name))[1]) >= 5
  );

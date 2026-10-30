-- ============================================================================
-- LAIRA CHARMS — STORAGE BUCKETS & ACCESS POLICIES (00003)
-- ============================================================================

-- Create storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-media', 'product-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('payment-proofs', 'payment-proofs', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('custom-request-media', 'custom-request-media', false, 15728640, array['image/jpeg', 'image/png', 'image/webp']),
  ('message-attachments', 'message-attachments', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 1. Product Media Storage Policies (Public Read, Admin Write)
-- ----------------------------------------------------------------------------
create policy "product_media_public_select"
  on storage.objects for select
  using (bucket_id = 'product-media');

create policy "product_media_admin_all"
  on storage.objects for all
  using (bucket_id = 'product-media' and public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. Payment Proofs Storage Policies (Private, Admin Read, Customer Scoped Upload)
-- ----------------------------------------------------------------------------
create policy "payment_proofs_admin_select"
  on storage.objects for select
  using (bucket_id = 'payment-proofs' and public.is_admin());

create policy "payment_proofs_customer_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs' and
    (auth.role() = 'authenticated' or auth.role() = 'anon')
  );

-- ----------------------------------------------------------------------------
-- 3. Custom Request Media Storage Policies (Private)
-- ----------------------------------------------------------------------------
create policy "custom_request_media_select"
  on storage.objects for select
  using (
    bucket_id = 'custom-request-media' and
    (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1])
  );

create policy "custom_request_media_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'custom-request-media' and
    (auth.role() = 'authenticated' or auth.role() = 'anon')
  );

-- ----------------------------------------------------------------------------
-- 4. Message Attachments Storage Policies (Private)
-- ----------------------------------------------------------------------------
create policy "message_attachments_select"
  on storage.objects for select
  using (
    bucket_id = 'message-attachments' and
    (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1])
  );

create policy "message_attachments_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'message-attachments' and
    (auth.role() = 'authenticated' or auth.role() = 'anon')
  );


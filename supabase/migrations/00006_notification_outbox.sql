-- ============================================================================
-- LAIRA CHARMS — NOTIFICATION OUTBOX & REFINED CONSTRAINTS (00006)
-- ============================================================================

-- 1. Create Notification Outbox Table for Reliable Transactional Emails
create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  idempotency_key text not null unique,
  recipient_email text not null,
  recipient_name text not null,
  subject text not null,
  html_content text not null,
  text_content text not null,
  metadata jsonb default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed', 'dead_letter')),
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  last_attempt_at timestamptz,
  next_attempt_at timestamptz default now(),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Performance Indexes for Outbox Queue Processing
create index if not exists idx_notification_outbox_queue 
  on public.notification_outbox (status, next_attempt_at);

create index if not exists idx_notification_outbox_idempotency 
  on public.notification_outbox (idempotency_key);

-- 3. Row Level Security for Outbox
alter table public.notification_outbox enable row level security;

-- Admin access policy (Service role automatically bypasses RLS)
drop policy if exists "notification_outbox_admin_all" on public.notification_outbox;
create policy "notification_outbox_admin_all"
  on public.notification_outbox for all
  using (public.is_admin());

-- 4. Automatically update updated_at timestamp
drop trigger if exists trg_notification_outbox_updated_at on public.notification_outbox;
create trigger trg_notification_outbox_updated_at
  before update on public.notification_outbox
  for each row
  execute function public.handle_updated_at();

-- 5. Standardize 7-14 Business Days Crafting Lead Time Constraint
alter table public.products 
  drop constraint if exists chk_products_lead_time;

alter table public.products 
  add constraint chk_products_lead_time 
  check (lead_time_days >= 7 and lead_time_days <= 14);

-- ============================================================================
-- LAIRA CHARMS — INITIAL SEED DATA (00004)
-- ============================================================================

-- Seed Categories
insert into public.categories (id, slug, name, description, sort_order, is_published)
values
  ('11111111-1111-1111-1111-111111111101', 'ready-made-charms', 'Ready-Made Charms', 'In-stock handcrafted polymer clay and resin keychains ready for immediate dispatch.', 1, true),
  ('11111111-1111-1111-1111-111111111102', 'personalized-charms', 'Personalized Charms', 'Pre-configured customized keychains with custom initials, color palettes and clasp choices.', 2, true),
  ('11111111-1111-1111-1111-111111111103', 'bespoke-atelier', 'Bespoke Atelier', 'One-of-a-kind custom designed keepsakes sculpted according to your concept.', 3, true)
on conflict (slug) do nothing;

-- Seed Store Settings (Bank / Manual Payment Details & Shipping Policy)
insert into public.store_settings (key, value, is_public)
values
  ('payment_instructions', '{
    "bank_name": "Meezan Bank Limited",
    "account_title": "Laira Charms Workshop",
    "account_number": "01020304050607",
    "iban": "PK00MEZN0001020304050607",
    "instructions": "Transfer exact order total via online banking or ATM transfer. Upload a clean, legible screenshot showing transaction reference and timestamp."
  }'::jsonb, true),
  ('shipping_policy', '{
    "standard_rate_minor": 25000,
    "free_shipping_threshold_minor": 300000,
    "estimated_days": "3 to 5 business days across Pakistan",
    "supported_cities": ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Nationwide"]
  }'::jsonb, true)
on conflict (key) do nothing;

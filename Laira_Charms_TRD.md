**LAIRA CHARMS**

Technical Requirements Document (TRD)

Architecture, technology, data, integrations, security and operations

_Prepared for product planning and Antigravity-assisted implementation_

# 1. Purpose and architecture principles

This TRD defines the technical constraints and solution architecture for Laira Charms. It is a single-merchant commerce platform. The architecture should remain simple enough for a small store and robust enough to protect customer data, payments evidence, custom quotations and operational records.

- Use managed services where they materially reduce operational burden.
- Keep PostgreSQL as the source of truth for transactional business data.
- Enforce authorization close to the data using RLS plus server-side checks.
- Use server-authoritative pricing and order creation.
- Separate payment verification from order fulfilment.
- Use progressive enhancement and accessible interaction patterns.
- Keep external integrations behind adapters so providers can be replaced.
- Prefer stable, supported releases over experimental features; record exact versions and lockfile.

# 2. Recommended stack and version policy

| **Layer**            | **Recommendation**                                                                           | **Version policy / rationale**                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime              | Node.js LTS compatible with selected Next.js/Vitest versions                                 | Use current supported LTS at implementation; verify engine requirements.                                                                        |
| Framework            | Next.js App Router                                                                           | Research snapshot: Next.js 16.4.2 is latest stable patch listed for 16.4 line on 30 Oct 2026; re-check official changelog at project bootstrap. |
| UI                   | React + Type-safe components + CSS Modules or Tailwind (choose one after design token proof) | Use framework-compatible stable React; do not mix styling systems without explicit reason.                                                      |
| Language             | TypeScript strict mode                                                                       | Pin exact version in lockfile; no implicit any; runtime validation still required.                                                              |
| Database             | Supabase PostgreSQL                                                                          | Managed database; migrations in source control.                                                                                                 |
| Authentication       | Supabase Auth                                                                                | Email/password initially; reset, verification and secure sessions.                                                                              |
| Storage              | Supabase Storage                                                                             | Public bucket only for intentionally public product media; private buckets for payment proof, message attachments and custom references.        |
| Realtime             | Supabase Realtime                                                                            | Broadcast/Presence/DB Changes only where needed; persisted messages remain in PostgreSQL.                                                       |
| Server logic         | Next.js server-only modules and Supabase Edge Functions where operationally suitable         | Never expose service-role/secret keys to browser.                                                                                               |
| Hosting              | Vercel                                                                                       | Local, Preview and Production environment separation.                                                                                           |
| Email                | Transactional email provider behind adapter (candidate: Resend)                              | Choose after sender-domain verification, deliverability, cost and regional constraints review.                                                  |
| Validation           | Zod or equivalent schema validator                                                           | Share schemas only where runtime environment and trust boundaries are clear.                                                                    |
| Unit/component tests | Vitest + Testing Library                                                                     | Use current compatible stable versions; tests run in CI.                                                                                        |
| E2E                  | Playwright                                                                                   | Chromium, Firefox, WebKit where feasible; mobile viewport/device projects.                                                                      |
| Accessibility        | axe-core integration plus manual WCAG review                                                 | Automated scans are not sufficient alone.                                                                                                       |
| Monitoring           | Structured logs + error tracking provider                                                    | Select provider before production; avoid logging secrets/PII.                                                                                   |

# 3. Logical architecture

| **Layer**               | **Responsibilities**                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Browser / presentation  | Public storefront, customer account, guest access pages and admin UI; responsive components; no privileged secrets.                   |
| Next.js server boundary | Route handlers/server actions/server components; authentication checks; schema validation; orchestration; idempotency; authorization. |
| Domain services         | Catalog, pricing, cart, checkout, quote, order, payment verification, messaging, notification and inventory rules.                    |
| Supabase Postgres       | Transactional records, constraints, indexes, row-level security, status/audit data.                                                   |
| Supabase Storage        | Product assets and private user-submitted files with independent storage policies.                                                    |
| Supabase Auth           | Customer identity and session lifecycle; admin role mapping controlled by trusted server/admin process.                               |
| Supabase Realtime       | Authorized message events, inbox updates and selected admin dashboard refresh.                                                        |
| External services       | Email delivery; future courier/payment/Instagram adapters; no dependency in core domain model.                                        |

# 4. Application structure requirements

- Use Next.js App Router with route groups separating public storefront, account, admin and guest-access experiences.
- Separate server-only domain services from client UI; add explicit server-only markers to privileged modules.
- Use Server Components by default for read-heavy public pages; Client Components only for genuine interaction (gallery, cart controls, live messaging, filters as required).
- Use route handlers for webhook endpoints and APIs where HTTP semantics/integration require them; validate all input and authenticate/authorize every mutation.
- Use a single typed data-access layer; avoid ad-hoc Supabase calls scattered through UI components.
- Keep business calculations in server-side domain functions and/or database functions with transaction guarantees.
- Store migrations, seed fixtures, test data and RLS policies in version control.
- Generate typed database definitions from the schema and fail CI on type drift.

# 5. Database requirements and proposed entities

| **Entity**                              | **Important fields / constraints**                                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| profiles                                | id references auth.users; display_name, phone, role/profile metadata; role changes restricted to trusted admin process.                                                   |
| addresses                               | owner user_id nullable only for controlled guest checkout snapshot; recipient, phone, address lines, city, province, postal code, delivery notes; default flag per owner. |
| categories                              | slug unique, name, description, image, sort order, published flag.                                                                                                        |
| products                                | slug unique, title, description, product_type, base_price_minor, currency, status, stock_mode, stock_quantity/capacity, lead_time, SEO fields.                            |
| product_media                           | product_id, storage path/public URL strategy, alt text, order index, media type; enforce image limits.                                                                    |
| option_groups / option_values           | product relation, label, required flag, selection rules, value, price_delta_minor, availability and ordering.                                                             |
| custom_requests                         | customer/guest reference, title, brief, product_id nullable, desired date, status, assigned admin, timestamps.                                                            |
| custom_request_media                    | request_id, private storage path, MIME, size, scan/validation metadata.                                                                                                   |
| quotations / quote_items                | request_id, version, status, total_minor, currency, scope, lead time, valid_until, created_by, accepted_at; version unique per request.                                   |
| carts / cart_items                      | owner or guest cart token hash; product/options snapshot references; quantity; server revalidation at checkout.                                                           |
| orders / order_items                    | public opaque reference, customer_id nullable, guest email, address snapshot, totals, currency, statuses, pricing source; line-item immutable snapshots.                  |
| payments / payment_proofs               | order_id, method snapshot, amount_minor, reference, status, proof path, submitted_at, reviewed_by, reviewed_at, rejection_reason.                                         |
| order_status_history                    | order_id, old/new status, actor, note, timestamp.                                                                                                                         |
| conversations / participants / messages | context type/id, owner/guest token hash, participants, message body, sender, timestamps, status, priority, internal-note flag.                                            |
| message_attachments                     | message_id, private storage path, content type, size, upload validation metadata.                                                                                         |
| notifications / notification_outbox     | recipient, template, event id unique, delivery status, retry count, provider id, error code.                                                                              |
| store_settings                          | typed key/value settings or normalized tables for payment instructions, shipping policies and business contact.                                                           |
| audit_logs                              | actor, action, entity, entity id, before/after safe summary, timestamp, correlation id.                                                                                   |

# 6. Data integrity, money and concurrency

- Use integer minor units for PKR values (paisa) and explicit currency code; use Decimal/numeric in SQL if fractional representation is required. Never use JS binary floating-point for financial totals.
- Create orders and order_items in one database transaction; totals are recomputed from trusted rows.
- Use unique idempotency keys for order creation, payment decision events and notification outbox events.
- Use row locks or optimistic version checks for stock reservation and quotation acceptance to prevent race conditions.
- Snapshot mutable product/option/quote terms into order_items and order metadata.
- Use database constraints for nonnegative quantity/price, unique slugs, unique quote version and valid status values.
- Soft archive products rather than deleting records referenced by historical orders.
- Define retention and deletion/anonymization rules for personal data, messages, payment proofs and audit records.

# 7. Authentication and authorization

- Supabase Auth handles identity; profiles map to application profile data. Do not trust client-supplied role claims.
- Admin access must be granted through a controlled server-side administrative process; no public self-service admin registration.
- Apply RLS to every table exposed through Supabase APIs. Default deny; add narrow policies for each role and operation.
- Use server-side authorization for every admin mutation even if UI hides the action.
- Keep service-role/secret keys only in server environment or secure function secrets; never in NEXT_PUBLIC variables or browser bundles.
- Implement forgot-password and reset-password flows with safe generic responses, expiring links, token handling, session invalidation policy and rate limiting.
- Define account verification, password strength, login throttling, session expiry and suspicious activity handling.
- Guest access tokens must be cryptographically random, stored hashed, scoped to one resource, expiring, revocable and rate limited.

# 8. Storage and upload security

| **Bucket / asset**   | **Visibility and controls**                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| product-media        | Public read only for published assets; write restricted to admin; validate type/size/dimensions; sanitize filenames; optimize variants. |
| payment-proofs       | Private; customer may upload only to own pending order path; admin-only read; signed short-lived URL for review; no direct public URL.  |
| custom-request-media | Private; only requester and authorized admins can access; validate images; consider malware scanning and strip EXIF metadata.           |
| message-attachments  | Private; participants and authorized admin only; signed URL; strict MIME/size limits and safe rendering.                                |

# 9. Domain workflows and APIs

| **Workflow/API boundary** | **Requirements**                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Catalog read              | Public published product/category read; cache safely; avoid caching personalized or unpublished data.                  |
| Cart mutation             | Validate product, options, price and stock server-side; handle stale state.                                            |
| Checkout                  | Revalidate cart; calculate totals; persist order snapshot transactionally; idempotent submission.                      |
| Quote create/respond      | Admin-only quote creation; customer-only acceptance/decline; validate current version and expiry in transaction.       |
| Payment proof upload      | Issue scoped upload authorization; verify order ownership; persist metadata; status becomes Verification Pending only. |
| Payment decision          | Admin-only; require decision reason where rejected; compare-and-set status; audit; enqueue email event.                |
| Order status update       | Admin-only; validate allowed transition; audit; enqueue appropriate notification.                                      |
| Messaging                 | Verify participant; persist message; emit realtime event; notify recipient asynchronously.                             |
| Email webhook             | Verify provider signature; update delivery state; never expose provider secrets.                                       |

# 10. Realtime messaging design

- Persist every message in Postgres before broadcasting a message-created event.
- Use private Realtime channels with authorization based on conversation membership; do not use public channel names as access control.
- Client subscribes to authorized conversation; on reconnect, fetch messages after last seen cursor to recover missed events.
- Use stable message IDs, created_at ordering and cursor pagination; tolerate duplicate events idempotently.
- Read receipts and presence are optional enhancements; do not imply a customer is online unless Presence is enabled and consent/policy are clear.
- Internal admin notes must be a separate message visibility class and never broadcast to customer participants.
- Email notification should be sent for offline recipients according to notification preferences; realtime alone is not a delivery guarantee.

# 11. Email and background operations

- Use transactional outbox pattern: domain transaction writes notification event; worker/Edge Function sends it and records provider response.
- Templates required: verify email, password reset, guest access, quotation issued/expiring, order placed, proof received, proof rejected, payment verified/order confirmed, in production, shipped, delivered, cancellation/refund events, new message.
- Use retry with exponential backoff and dead-letter/error state; unique event IDs prevent duplicate emails.
- Do not include sensitive payment proof links or unnecessary personal data in email; link to authenticated/verified pages.
- Use a verified sender domain, SPF/DKIM/DMARC and test deliverability before production.

# 12. Vercel environments and deployment

| **Environment** | **Purpose and safeguards**                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Local           | Developer machine; local .env; test Supabase project or isolated local Supabase; fake email/payment data; no production secrets.   |
| Preview         | Per-branch/PR QA; preview-specific secrets and test database; seeded synthetic data; never point to live customer data by default. |
| Production      | Live domain and production Supabase; least-privilege secrets; backups; monitoring; protected main branch and approval gate.        |

- Use Git-based deployments and Vercel Preview URLs for review.
- Database migrations are reviewed and applied in controlled order; do not run destructive schema changes automatically on every preview.
- Use feature flags for risky or incomplete functionality.
- Maintain rollback plan for application deployment and forward/backward-compatible database changes.
- Configure domain, TLS, security headers, CSP where feasible, environment variables, error monitoring and uptime checks.

# 13. Performance, SEO and accessibility

- Use Next/Image or equivalent image optimization; serve responsive sizes and modern formats; reserve dimensions to prevent layout shift.
- Use font subsets/preload carefully; avoid loading multiple heavy decorative fonts.
- Defer below-the-fold imagery and nonessential animation; prioritize hero and first product row.
- Use metadata, canonical URLs, sitemap, robots, Open Graph and accurate Product structured data.
- Do not index admin, account, cart, checkout, private messages, guest order access or internal search states.
- Target WCAG 2.2 AA; test focus visibility, contrast, keyboard traps, dialog semantics, form errors, touch targets and reduced motion.
- Set performance budgets and measure representative mobile network/device conditions.

# 14. Security and privacy threat areas

| **Threat**                   | **Required mitigation**                                                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Broken access control / IDOR | RLS, server authorization, opaque IDs/tokens, cross-user negative tests.                                                            |
| Price tampering              | Server-side price calculation; quote snapshots; transactional verification.                                                         |
| Fake payment screenshot      | Manual reconciliation against account receipt; proof is not confirmation.                                                           |
| Malicious upload             | MIME sniffing, extension allowlist, size limit, image decoding, private bucket, safe download headers and scanning where available. |
| Spam/abuse in chat           | Rate limits, CAPTCHA/risk control where needed, throttling, report/block tools and admin moderation.                                |
| Session theft / CSRF         | Secure cookie/session configuration, origin checks, CSRF protection where relevant, short-lived scoped tokens.                      |
| Secret leakage               | Server-only environment variables; secret scanning; no logging; rotate on exposure.                                                 |
| Email enumeration            | Generic responses and rate limiting on account recovery/verification.                                                               |
| Stored XSS                   | Render plain text safely; sanitize any allowed rich text; never trust uploaded SVG/HTML.                                            |
| Admin compromise             | MFA where supported, least privilege, audit log, secure recovery and no shared admin accounts.                                      |

# 15. Monitoring, backup and operations

- Monitor application exceptions, server errors, failed email deliveries, failed payment review actions and database/storage usage.
- Create database backup/PITR strategy according to Supabase plan; test restore procedure before launch.
- Document admin onboarding, password recovery, payment reconciliation, order fulfilment, refund/cancellation and incident response.
- Keep an audit trail for product price edits, quotation changes, payment verification, status transitions and store settings.
- Define support contact and maintenance ownership before public launch.

# Research references

Sources were consulted on 30 October 2026. Platform features and package versions can change; revalidate before implementation.

- **Next.js App Router documentation —** <https://nextjs.org/docs/app> — App Router, Server Components, Suspense, routing and rendering foundations.
- **Next.js stable release changelog —** <https://nextjs-changelog.vercel.app/> — Release verification; the research snapshot lists Next.js 16.4.2 as the latest stable patch in the 16.4 line on 30 Oct 2026. Re-check at implementation.
- **Supabase: The Supabase way to build —** <https://supabase.com/docs/guides/getting-started/the-supabase-way-to-build> — Postgres-first architecture, Auth, RLS, Storage, Edge Functions, Realtime and secret-key handling.
- **Vercel deployment environments —** <https://vercel.com/docs/deployments/environments> — Local, Preview and Production environments.
- **Vercel Next.js deployment —** <https://vercel.com/docs/frameworks/full-stack/nextjs> — Next.js deployment on Vercel.
- **Etsy: How to send messages to buyers —** <https://help.etsy.com/hc/en-us/articles/115015654988-How-to-Send-Messages-to-Buyers> — Seller-to-buyer messaging, order-context communication and attachments.
- **Shopify: Managing customer conversations —** <https://help.shopify.com/en/manual/inbox/conversations> — Customer conversations, staff inbox, product/order-related support topics.
- **Playwright device emulation —** <https://playwright.dev/docs/emulation> — Device, viewport, touch, locale and browser emulation.
- **Playwright accessibility testing —** <https://playwright.dev/docs/accessibility-testing> — Automated accessibility checks plus manual assessment.
- **Playwright test projects —** <https://playwright.dev/docs/test-projects> — Cross-browser/device test project organization.
- **Vitest guide —** <https://vitest.dev/guide/> — Unit/component test runner guidance and Node/Vite compatibility notes.
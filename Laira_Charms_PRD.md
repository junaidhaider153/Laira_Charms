**LAIRA CHARMS**

Product Requirements Document (PRD)

Business goals, user journeys, product scope and acceptance criteria

_Prepared for product planning and Antigravity-assisted implementation_

# Document control

| **Field**          | **Value**                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| Product            | Laira Charms — single-brand handmade keychain e-commerce and business operations platform             |
| Document status    | Baseline requirements draft — visual design direction supplied; detailed brand assets pending         |
| Prepared           | 30 October 2026                                                                                       |
| Primary market     | Pakistan                                                                                              |
| Business model     | Direct-to-consumer, ready-made, configurable personalized and admin-quoted custom products            |
| Decision authority | Store owner / business owner; final policy, prices, delivery rules and content require owner approval |

# 1. Executive summary

Laira Charms is an online store for handmade keychains, including ready-made products, products with predefined fixed-price customization, and bespoke made-to-order requests requiring an administrator quotation. The website replaces informal Instagram-DM/manual-record order handling with a structured storefront, secure checkout, payment-proof review, order lifecycle management, and a first-party customer-to-admin messaging channel.

The product is a single-merchant store, not a multi-vendor marketplace. It must provide a charming, distinctive handmade brand experience while maintaining the reliability, discoverability, security and operational controls expected of a modern e-commerce application.

# 2. Business context and goals

- Establish Laira Charms as an independent online destination rather than relying exclusively on Instagram discovery and DMs.
- Make product discovery, customization, ordering, payment submission and order updates understandable on mobile devices.
- Centralize product, stock, custom requests, quotations, conversations, payments and order records in an admin workspace.
- Reduce manual transcription and missed messages while preserving human approval for bespoke designs and payment verification.
- Build a maintainable foundation that can later support courier integrations, payment gateways and approved Instagram integrations without redesigning core domain logic.

# 3. Confirmed business decisions

| **Decision**           | **Confirmed requirement**                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| Store identity         | Laira Charms                                                                                                    |
| Products               | Handmade keychains; physical products; ready-made, customized and made-to-order                                 |
| Market                 | Pakistan only; initial currency PKR; shipping coverage/rates to be configured by owner                          |
| Catalog scale          | Fewer than 50 products initially; architecture must not hard-code this limit                                    |
| Current sales process  | Instagram DMs and manual records; website becomes primary ordering and support channel                          |
| Pricing models         | Both fixed-price configurable customization and admin-quoted bespoke requests                                   |
| Checkout identity      | Both guest checkout and registered customer accounts                                                            |
| Payments               | Manual transfer using owner-configured account details; customer uploads proof; admin independently verifies    |
| Customer communication | Website messaging is the primary channel. Instagram is optional/future. WhatsApp is out of scope.               |
| Visual direction       | Use the two supplied references as direction; final brand assets and exact visual tokens may be supplied later  |
| Development process    | Build in small units; test each unit before proceeding; do not treat visual completion as functional completion |

# 4. Users and roles

| **Actor**                 | **Needs and permissions**                                                                                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Guest shopper             | Browse catalog; use search/filter; add to cart; submit guest checkout; submit custom inquiry; access own guest conversation/order through verified secure access; upload payment proof for own order. |
| Registered customer       | All shopper capabilities; manage own profile/addresses; view own orders, quotations and conversations; send messages and attachments; accept/decline quotations.                                      |
| Administrator/store owner | Manage products, images, categories, options, pricing, stock, custom requests, quotations, conversations, payment methods, payment proofs, orders, policies and store settings.                       |
| System                    | Enforce authorization, validate inputs, preserve audit trails, send transactional emails, maintain status transitions and surface operational failures.                                               |

# 5. Product scope

## 5.1 In scope for initial production release

- Responsive public storefront: homepage, shop/catalog, category pages, product detail pages, search, filters, sorting, cart, checkout, contact/help and policy pages.
- Product types: ready-made, fixed-price configurable, and bespoke quotation-required.
- Product variants/options: configurable option groups, allowed values, price adjustments, availability, required/optional selections and customer instructions.
- Custom request flow with description, optional reference images, admin review, quotation price, production estimate, expiry/validity, accept/decline and conversion to payable order.
- Guest checkout and registered customer account flows.
- Manual payment instructions, proof upload, admin verification/rejection, resubmission and audit history.
- Order management with separate payment and fulfilment statuses.
- Website-based customer-admin messaging linked to product, custom request, quotation or order context; general inquiry supported.
- Admin dashboard for catalog, stock, orders, customers, quotations, messages, payment verification and settings.
- Transactional email for account recovery, guest access verification, quotation events, order confirmation, payment updates and shipping milestones.
- Testing, accessibility, security, performance, monitoring, backups and deployment workflows.

## 5.2 Explicitly out of scope unless approved later

- Multi-vendor marketplace, seller onboarding, seller commissions or seller storefronts.
- WhatsApp messaging or WhatsApp Business API.
- Automatic Instagram DM synchronization or Meta commerce catalog synchronization in initial release.
- Automated card/payment gateway processing in initial release.
- Automated courier booking/label generation unless a provider and merchant account are approved.
- International shipping, multiple currencies, loyalty points, subscriptions, native mobile applications or AI-generated design previews.
- Public user-to-user messaging, public forums or social network features.

# 6. Functional requirements

| **ID** | **Capability**                   | **Requirement**                                                                                                                                                                             |
| ------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-001 | Storefront navigation            | All primary routes have clear navigation, active states, breadcrumbs where useful, working links and accessible mobile navigation.                                                          |
| FR-002 | Product discovery                | Customers can browse all published/available products; pagination or load-more must preserve filters and URL state.                                                                         |
| FR-003 | Search/filter/sort               | Search by product name/description/tags; filter by category, price and availability; sort by relevance/newest/price where applicable; provide empty and clear-filter states.                |
| FR-004 | Product details                  | Show gallery, name, description, price or price range, availability, production estimate, customization model, options, quantity, care notes and related products where configured.         |
| FR-005 | Product image gallery            | Images have thumbnails, full-size view/lightbox, keyboard operation, touch swipe, alt text, loading and error states; vertical page scrolling must remain possible.                         |
| FR-006 | Fixed customization              | Required option groups must be completed; price is calculated server-side from trusted product/options data; invalid or unavailable combinations are rejected.                              |
| FR-007 | Bespoke request                  | Customer submits request details and optional reference images; system issues request reference and status; admin can review and ask follow-up questions through website messaging.         |
| FR-008 | Quotation                        | Admin enters amount, currency, production estimate, scope/notes, validity deadline and any shipping assumptions; customer can accept or decline; expired/revoked quotes cannot be accepted. |
| FR-009 | Cart                             | Add/update/remove items; preserve selected options and custom text; validate current price/availability before checkout; handle stale cart and stock changes.                               |
| FR-010 | Guest checkout                   | Collect name, email, phone, delivery address and required delivery instructions; validate Pakistani phone/address fields without assuming one rigid address format.                         |
| FR-011 | Customer accounts                | Registration, login, logout, email verification policy, forgot password, reset password, session handling and profile/address management.                                                   |
| FR-012 | Order placement                  | Create order atomically with item snapshots, totals, shipping, customization and pricing basis; prevent duplicate submissions/idempotency issues.                                           |
| FR-013 | Manual payment                   | Display admin-configured bank/wallet instructions and exact payable amount/reference; allow customer proof upload; show payment instructions again from order detail.                       |
| FR-014 | Payment review                   | Admin sees proof securely, verifies actual receipt outside the screenshot, approves/rejects with reason; record actor, timestamp and audit event.                                           |
| FR-015 | Order lifecycle                  | Admin updates fulfilment status through allowed transitions; customer sees timeline and receives appropriate emails.                                                                        |
| FR-016 | Website messaging                | Customer can open general or context-linked conversation; send text and supported image attachments; admin inbox supports reply, internal notes, status, priority and filters.              |
| FR-017 | Notifications                    | Email notifications are queued/retried safely; no duplicate confirmation email on repeated events; notification failure does not corrupt order state.                                       |
| FR-018 | Admin catalog                    | Create/edit/archive products, categories, images, options, pricing, inventory and visibility; preview before publish.                                                                       |
| FR-019 | Admin settings                   | Manage payment instructions, shipping rules, contact information, store policies, production estimates and email content/settings.                                                          |
| FR-020 | Accessibility and responsiveness | All core journeys work with keyboard, screen reader semantics, zoom, touch and supported viewport sizes.                                                                                    |
| FR-021 | SEO and sharing                  | Unique titles/descriptions, canonical URLs, sitemap, robots rules, product structured data where accurate, social preview metadata and descriptive URLs.                                    |
| FR-022 | Auditability                     | Sensitive admin actions, price changes, quotation changes, payment decisions and order status changes are recorded.                                                                         |

# 7. Key customer journeys

## 7.1 Ready-made purchase

- Discover product → inspect images/details → select quantity → add to cart → checkout as guest or account → review total/address → create order → see manual payment instructions → transfer funds → upload proof → await admin verification → receive confirmed email → production/dispatch updates → delivered.

## 7.2 Fixed-price customization

- Open product → choose valid option values and enter required personalization → see price and production estimate → add configured item to cart → checkout → pay → upload proof → admin verifies → production begins.

## 7.3 Bespoke quote

- Submit custom brief and reference images → request enters admin review → conversation may clarify requirements → admin issues quote with amount, scope and production estimate → customer accepts or declines before expiry → accepted quote creates a locked payable order → payment proof → admin verification → fulfilment.

## 7.4 Customer support conversation

- Start from product/custom request/order or general contact entry → identify guest by verified email or registered session → message thread created → admin responds from inbox → customer receives notification → conversation can be resolved/reopened; complete history remains available subject to retention policy.

# 8. Business rules

| **Rule** | **Definition**                                                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-01    | All prices are stored as integer minor units (PKR paisa) or an explicitly defined decimal-safe representation; never use floating-point arithmetic for money.                    |
| BR-02    | Server is authoritative for product price, option surcharges, discounts, shipping and order totals.                                                                              |
| BR-03    | Order item snapshots preserve product name/SKU, selected options, personalization, unit price, quantity and relevant production terms at purchase time.                          |
| BR-04    | A quotation has a fixed version, expiry, price, scope and production estimate. Acceptance creates an immutable accepted snapshot; later admin edits require a new quote/version. |
| BR-05    | A customer-uploaded payment screenshot is evidence only; it never marks payment verified automatically.                                                                          |
| BR-06    | Payment status and order fulfilment status are separate state machines.                                                                                                          |
| BR-07    | Order confirmation email is sent only after an authorized admin confirms the payment/order, not merely after screenshot upload.                                                  |
| BR-08    | Guest access uses a verified email and opaque, expiring, revocable token; never use guessable order IDs as authorization.                                                        |
| BR-09    | Customer can only read/write their own account data, orders, quotations and conversations; admin authorization is enforced server-side and in database policies.                 |
| BR-10    | Inventory policy must be configurable: track stock for ready-made items; made-to-order items may use capacity/lead-time rather than on-hand stock.                               |
| BR-11    | If a product or option becomes unavailable between cart and order placement, checkout must stop and explain the change.                                                          |
| BR-12    | Admin rejection of payment proof requires a customer-readable reason and allows resubmission unless the order is cancelled/closed.                                               |

# 9. Status models

| **Domain**     | **Statuses / transitions**                                                                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Custom request | Submitted → Under review → Awaiting customer details (optional) → Quoted → Accepted / Declined / Expired / Cancelled.                                                               |
| Quotation      | Draft → Sent → Accepted / Declined / Expired / Withdrawn. Revisions create a new version; accepted version is immutable.                                                            |
| Payment        | Awaiting payment → Proof submitted / Verification pending → Verified or Rejected → Resubmitted / Refunded where applicable.                                                         |
| Order          | Pending payment → Awaiting verification → Confirmed → In production → Ready to ship → Shipped → Delivered; exception paths include On hold, Cancelled, Refund pending and Refunded. |
| Conversation   | Open → Waiting for admin / Waiting for customer → Resolved → Reopened; priority and read/unread are separate attributes.                                                            |

# 10. Non-functional requirements and quality targets

| **Quality area** | **Target / requirement**                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Responsive       | Support small phones from 320 CSS px through common phones, tablets, laptops and wide desktop; no horizontal overflow in normal content.                                                          |
| Performance      | Set Core Web Vitals budgets; target LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile on representative production traffic; optimize images/fonts and avoid oversized animation payloads. |
| Accessibility    | Target WCAG 2.2 AA; keyboard operation, visible focus, semantic landmarks, labels, contrast, alt text, reduced motion and accessible validation.                                                  |
| Security         | OWASP-informed controls; RLS on exposed tables; private proof/attachment storage; server-side authorization; rate limiting; secure cookies/session handling; secrets server-side.                 |
| Reliability      | Graceful retry/idempotency for payment decisions and email events; useful error states; no silent failures.                                                                                       |
| Maintainability  | Strict TypeScript, modular domain boundaries, documented migrations, lint/typecheck, automated tests and dependency update policy.                                                                |
| SEO              | Indexable public product/category pages; no indexing of account, admin, cart, checkout, private conversation or guest order pages.                                                                |
| Observability    | Structured server logs, error reporting, key workflow event logging and alerts for failed emails/payment review operations.                                                                       |

# 11. Acceptance and release gates

- No unresolved P0/P1 defects; all critical user journeys pass.
- All requirements have linked test cases and a recorded pass/fail result.
- Unit, integration, end-to-end, security, accessibility and responsive checks pass at agreed thresholds.
- Admin-only actions are proven inaccessible to anonymous/customer roles.
- Payment screenshot upload cannot change payment status to Verified.
- Quote acceptance uses the exact active quote version and cannot alter its amount client-side.
- Guest order/conversation access is tested for enumeration, expired tokens and cross-customer access.
- Every public route has loading, empty, error and success states as applicable.
- Mobile product gallery scroll, menu, dialogs, sticky elements and checkout are tested on real browser emulation.
- Production environment secrets, backups, domain, email sender, legal/policy content and owner operational training are complete.

# 12. Open decisions requiring owner confirmation

| **Topic**                   | **Current assumption / decision needed**                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Delivery                    | Owner to define courier(s), service areas, shipping charges, free-shipping threshold and dispatch schedule.                 |
| COD                         | Not yet confirmed. Keep configurable and disabled until owner approves operational policy.                                  |
| Payment account methods     | Owner to supply exact account holder names, bank/wallet providers, account identifiers, instructions and support contact.   |
| Refund/cancellation/returns | Owner to define policy, eligible cases, timelines and refund evidence.                                                      |
| Production estimates        | Owner to define default and product-specific lead times, rush order availability and holiday blackout dates.                |
| Inventory                   | Owner to choose stock count vs made-to-order capacity for each product.                                                     |
| Guest identity              | Email verification method and token lifetime to be selected in TRD implementation.                                          |
| Email provider/domain       | Provider and verified sending domain to be selected before production.                                                      |
| Tax/legal                   | Owner/accountant to confirm tax treatment, business disclosures, privacy policy and terms for Pakistan.                     |
| Visual identity             | Exact logo, font licenses, palette and illustration assets pending; references establish direction, not final exact tokens. |

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
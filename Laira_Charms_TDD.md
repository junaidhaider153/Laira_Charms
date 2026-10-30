**LAIRA CHARMS**

Technical Design Document (TDD)

Detailed module design, state transitions, data flows and testable implementation units

_Prepared for product planning and Antigravity-assisted implementation_

# 1. Purpose and interpretation

In this project, TDD means Technical Design Document. It describes how the requirements in the PRD/TRD are decomposed into modules, services, data flows, interfaces and testable development units. It is not a substitute for test-driven development; test-first practices are nevertheless required where practical.

# 2. Proposed application modules

| **Module**                       | **Responsibilities / dependencies**                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| M00 Project foundation           | Repository, Next.js setup, TypeScript, lint, formatting, env validation, CI, design token skeleton; dependency for all modules.      |
| M01 Identity and access          | Supabase Auth integration, profiles, roles, registration/login/logout, email verification, forgot/reset password, route guards, RLS. |
| M02 Storefront shell             | Global header/footer, navigation, responsive menu, page layout, SEO metadata, error/loading/not-found boundaries.                    |
| M03 Catalog and categories       | Category/product listing, search, filters, sorting, pagination, URL query state, empty states.                                       |
| M04 Product detail and media     | Product gallery, zoom/lightbox, thumbnail navigation, touch gestures, product content, related products, scroll behavior.            |
| M05 Product configuration        | Option groups, required fields, price preview, validation, availability and server-authoritative recalculation.                      |
| M06 Custom request and quotation | Request form, private reference uploads, admin review, quote versions, expiry, accept/decline, conversion to order.                  |
| M07 Cart and checkout            | Guest/account carts, cart persistence, address capture, shipping calculation, total review, idempotent order creation.               |
| M08 Manual payment               | Payment method settings, instructions, proof upload, secure admin review, approve/reject/resubmit, audit.                            |
| M09 Order management             | Order detail, order snapshots, state machine, admin list/detail, customer timeline, fulfilment updates.                              |
| M10 Customer messaging           | Conversation creation, participants, message persistence, private attachments, Realtime, unread/read, admin inbox, email alerts.     |
| M11 Customer account             | Profile, addresses, orders, quotes, conversations, guest-to-account claim flow if approved.                                          |
| M12 Admin operations             | Dashboard metrics, catalog CRUD, inventory, order/quote/payment/message queues, settings, audit history.                             |
| M13 Notifications                | Transactional templates, outbox, retries, provider adapter, event deduplication and delivery logs.                                   |
| M14 Quality/release              | E2E, accessibility, performance, security review, migration checks, deployment, smoke tests and runbooks.                            |

# 3. Domain model and state machines

## 3.1 Payment state machine

| **Current state**    | **Event**          | **Next state**       | **Guard / side effect**                                                                |
| -------------------- | ------------------ | -------------------- | -------------------------------------------------------------------------------------- |
| Awaiting Payment     | Proof uploaded     | Verification Pending | Order owner verified; file stored privately; proof metadata recorded.                  |
| Verification Pending | Admin approves     | Verified             | Admin authorization; reconcile external account; audit; enqueue confirmation event.    |
| Verification Pending | Admin rejects      | Rejected             | Reason required; audit; notify customer; allow resubmission if order remains eligible. |
| Rejected             | New proof uploaded | Verification Pending | New proof version; preserve previous decision/history.                                 |
| Verified             | Refund processed   | Refunded             | Authorized refund action; record reference, amount and timestamp.                      |

## 3.2 Order state machine

| **Current**           | **Allowed next state examples**       | **Constraints**                                                           |
| --------------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| Pending Payment       | Awaiting Verification, Cancelled      | Order created; payment not yet verified.                                  |
| Awaiting Verification | Confirmed, On Hold, Cancelled         | Confirmation requires verified payment or separately approved COD policy. |
| Confirmed             | In Production, Cancelled              | Admin confirms production acceptance.                                     |
| In Production         | Ready to Ship, On Hold                | Production completion recorded.                                           |
| Ready to Ship         | Shipped                               | Courier/reference optional until configured; dispatch details captured.   |
| Shipped               | Delivered                             | Delivery evidence/time optional based on courier workflow.                |
| Any eligible state    | Cancelled / Refund Pending / Refunded | Role, reason and policy checks; preserve audit history.                   |

## 3.3 Quotation lifecycle

- Admin drafts quote from custom request; draft is not visible as a payable offer.
- Publishing quote increments immutable version and sets valid_until, price, currency, scope and production estimate.
- Customer action checks authenticated/verified guest ownership, current quote version and expiry within a transaction.
- Accepting quote freezes accepted terms and creates or enables a payable order; declining records timestamp and optional reason.
- Admin revision creates a new version; previously accepted versions cannot be silently edited.

# 4. Core data flows

## 4.1 Checkout and order creation

1. Client submits cart token/items, customer identity, address, delivery choice and idempotency key.
2. Server validates schema, session/guest proof, product publication, selected option validity, stock/capacity and current price.
3. Server calculates subtotal, discounts, shipping and grand total using trusted data.
4. Transaction reserves/decrements inventory according to configured stock policy, inserts order and immutable order_items, creates initial payment record and status history.
5. Server returns opaque public order reference and safe next-step payment instructions.
6. Outbox event triggers order-received email; payment confirmation is not sent at this stage.

## 4.2 Payment proof verification

7. Customer requests upload authorization for own order and pending payment only.
8. Server validates ownership, allowed MIME, maximum size and proof count; storage upload path is scoped and non-guessable.
9. Proof metadata is persisted; payment moves to Verification Pending; customer sees waiting state.
10. Admin opens proof through short-lived signed URL and compares transfer evidence with actual bank/wallet account receipt.
11. Admin approves/rejects through server action; transaction checks current state, actor role and version; writes audit/history and outbox event.
12. Notification worker sends correct email; duplicate event attempts are deduplicated.

## 4.3 Messaging

13. Conversation creation accepts optional context (product, custom request, quote or order) after verifying the requester can reference it.
14. Guest conversation creation requires verified email; issue a secure access token stored as hash and send access link.
15. Message send validates membership, body length, attachment ownership, rate limit and status; persist message first.
16. After commit, publish private Realtime event; recipient fetches authoritative message record.
17. Admin internal note is stored with visibility=internal and excluded from customer query/realtime/email.
18. Email notification is queued when recipient is not actively reading or notification policy requires it.

# 5. Interface and route inventory

| **Route group** | **Routes / views**                                                                                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public          | / ; /shop ; /categories/\[slug\] ; /products/\[slug\] ; /search ; /custom-order ; /about ; /contact ; /faq ; /shipping ; /returns ; /privacy ; /terms                                                                                                                    |
| Auth            | /login ; /register ; /forgot-password ; /reset-password ; /verify-email ; /auth/callback                                                                                                                                                                                 |
| Customer        | /account ; /account/profile ; /account/addresses ; /account/orders ; /account/orders/\[ref\] ; /account/quotes ; /account/conversations ; /account/conversations/\[id\]                                                                                                  |
| Guest           | /guest/order/\[secure-token\] ; /guest/conversation/\[secure-token\] ; /guest/quote/\[secure-token\] — secure token validation required                                                                                                                                  |
| Commerce        | /cart ; /checkout ; /checkout/success ; /orders/\[ref\]/payment — protect access; do not rely on ref alone                                                                                                                                                               |
| Admin           | /admin ; /admin/products ; /admin/products/new ; /admin/products/\[id\] ; /admin/categories ; /admin/orders ; /admin/orders/\[id\] ; /admin/payments ; /admin/quotes ; /admin/custom-requests ; /admin/conversations ; /admin/customers ; /admin/settings ; /admin/audit |

# 6. Component design requirements

| **Component family** | **Design/behavior contract**                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SiteHeader           | Responsive navigation; menu button with accessible name/state; cart count; account entry; sticky behavior only if it does not obscure content.                       |
| ProductCard          | Image ratio consistency; title, price/starting price, availability and quick action; keyboard-accessible whole-card navigation; hover effect not required for touch. |
| ProductGallery       | Main image, thumbnail rail, optional zoom/lightbox; Escape closes; focus trapped/restored; touch swipe; vertical document scroll remains available.                  |
| OptionSelector       | Labels, required state, selected state, disabled/unavailable values, inline errors and price change explanation.                                                     |
| CartDrawer/Page      | Focus management; quantity controls; remove/undo if feasible; subtotal; empty state; persistent cart policy.                                                         |
| CheckoutForm         | Sectioned forms, inline validation, summary, loading lock during submit, idempotency, recoverable errors.                                                            |
| PaymentProofUploader | Allowed type/size help, preview, remove/replace, upload progress, failure retry, private object reference.                                                           |
| ChatThread           | Message bubbles with sender/time; attachment preview; composer; send state; pagination; reconnect recovery; no fake sent state.                                      |
| AdminDataTable       | Search/filter/sort/pagination, responsive alternative layout, empty/loading/error state, bulk action confirmation.                                                   |
| StatusBadge/Timeline | Consistent status labels and color+text semantics; history timestamps; no color-only meaning.                                                                        |
| Modal/Drawer         | Accessible dialog semantics, focus management, Escape, backdrop behavior and mobile-safe height/scroll.                                                              |

# 7. Animation and interaction implementation

- Define motion tokens for duration, easing, distance and stagger; use consistent values rather than ad-hoc animation per component.
- Use CSS transitions for hover/focus/pressed states and simple transforms; use a small, maintained motion library only if complex orchestration justifies it.
- Use IntersectionObserver-based reveal triggers for below-the-fold content; animate once or sparingly, not on every scroll tick.
- Use transform/opacity for performant motion; avoid animating layout-heavy properties such as top/left/height on large sections.
- Decorative hero objects may float/rotate subtly with slow loops; disable or simplify under prefers-reduced-motion.
- Parallax must be subtle, nonessential and disabled on reduced-motion, low-power/mobile contexts if it harms performance.
- Respect focus-visible and hover-capable media queries; never make important information appear only on hover.
- Provide skeletons only where they reduce perceived wait; do not mimic content in a misleading way.

# 8. Unit-by-unit implementation and testing plan

| **Development unit**               | **Minimum exit criteria**                                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Unit 0 — repository and guardrails | Build boots; env validation; lint/typecheck/build; CI; secrets not committed; README and conventions.                 |
| Unit 1 — database/auth/RLS         | Migrations apply cleanly; RLS matrix tests; login/register/logout/forgot/reset/verify; cross-user access denied.      |
| Unit 2 — design foundation/shell   | Tokens, typography, header/footer, navigation, responsive menu; visual snapshots and keyboard checks.                 |
| Unit 3 — catalog/search            | CRUD fixtures; search/filter/sort URL state; empty/error/loading; query and authorization tests.                      |
| Unit 4 — product detail/gallery    | Gallery scroll/touch/keyboard/lightbox; image errors; variants; viewport regression.                                  |
| Unit 5 — fixed customization       | Required/optional options; server price; invalid/tampered options; stock and unavailable combination tests.           |
| Unit 6 — custom requests/quotes    | Uploads; request state; admin review; quote version/expiry; accept/decline race and tamper tests.                     |
| Unit 7 — cart/checkout             | Guest/account; stale cart; shipping; validation; idempotency; duplicate clicks; order snapshots.                      |
| Unit 8 — manual payment            | Private proof storage; ownership; admin verification; rejection/resubmission; email outbox; no auto-verify.           |
| Unit 9 — order/admin lifecycle     | Role restrictions; allowed transitions; timeline; notifications; audit history.                                       |
| Unit 10 — messaging                | Guest verification; thread membership; realtime/reconnect; attachment security; internal note isolation; rate limits. |
| Unit 11 — customer/admin polish    | Account history, address book, admin queues, dashboard metrics, responsive table alternatives.                        |
| Unit 12 — release hardening        | Full regression, security, accessibility, performance, SEO, backup/restore, production smoke tests.                   |

# 9. Required test layers for every unit

| **Test layer**  | **What to verify**                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| Static analysis | TypeScript strict typecheck, lint, formatting, dependency audit and build.                                 |
| Unit            | Pure calculations, validators, status transition guards, formatting, pricing, permission helpers.          |
| Component       | Form behavior, error states, keyboard interaction, responsive component states, loading/empty/success.     |
| Integration     | Database queries, RLS, storage policies, auth callbacks, email outbox, transaction boundaries.             |
| Feature         | End-to-end user story from entry point to persisted outcome.                                               |
| E2E browser     | Real browser flows across Chromium/Firefox/WebKit where supported; desktop and mobile emulation.           |
| Responsive      | 320/360/390/430 px mobile, tablet, laptop and wide desktop; no clipped content or horizontal overflow.     |
| Accessibility   | Automated axe scan plus manual keyboard, focus, labels, contrast, screen reader and reduced-motion review. |
| Security        | Negative authorization tests, IDOR, XSS, CSRF, rate limit, upload abuse, price tampering and secret scan.  |
| Regression      | Previously completed critical flows re-run after any shared component/schema/auth/payment changes.         |

# 10. Definition of Done

- Requirement and acceptance criteria are linked to implementation and test IDs.
- Code is reviewed for maintainability, security, error handling and responsive behavior.
- Unit, component, integration and feature tests pass; relevant full E2E/regression suite passes.
- All loading, empty, error, disabled, success and retry states exist where applicable.
- Keyboard and mobile interaction are manually checked.
- No console errors, unhandled promise rejections, broken links or placeholder controls.
- Documentation, migration notes, environment variables and operational steps are updated.
- Preview deployment reviewed; no production deployment before explicit release gate.

# 11. Test case examples

| **ID**    | **Scenario**                                                      | **Expected result**                                                                    |
| --------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| AUTH-014  | Customer selects Forgot Password and submits registered email     | Generic confirmation; email sent if account exists; no account enumeration.            |
| PDP-008   | User swipes product gallery on phone then scrolls page vertically | Gallery responds to horizontal gesture; vertical page scroll remains natural.          |
| QUOTE-011 | Customer accepts expired quotation                                | Rejected server-side; no order/payment created; user sees clear expiry message.        |
| PAY-009   | Customer uploads screenshot                                       | Payment becomes Verification Pending, never Verified.                                  |
| PAY-015   | Customer A requests Customer B proof URL                          | Denied even if object path is known.                                                   |
| MSG-013   | Guest opens conversation with expired token                       | Access denied; safe re-verification path offered.                                      |
| MSG-021   | Admin writes internal note                                        | Visible to authorized admins only; never returned to customer API, broadcast or email. |
| ORDER-017 | Customer double-clicks Place Order                                | Exactly one order created for the same idempotency key.                                |
| RESP-004  | Open product detail at 320px viewport                             | No horizontal overflow; gallery controls and purchase CTA remain usable.               |
| A11Y-006  | Navigate checkout using keyboard only                             | All controls reachable, labelled, focus visible; validation errors announced.          |

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
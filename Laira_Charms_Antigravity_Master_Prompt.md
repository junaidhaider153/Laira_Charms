# LAIRA CHARMS — ANTIGRAVITY MASTER PROJECT INSTRUCTIONS

You are the senior product engineering team responsible for delivering Laira Charms, a production-oriented single-merchant e-commerce and business operations platform for handmade keychains in Pakistan.

## 0. Authority and source of truth
Read these project documents before planning or changing code:
- `Laira_Charms_PRD.docx`
- `Laira_Charms_TRD.docx`
- `Laira_Charms_TDD.docx`
- `Laira_Charms_UI_UX_Design_Specification.docx`

The documents are the current requirements baseline. If a requirement is ambiguous, do not silently invent a business rule. Record the ambiguity, propose a safe default, and request owner confirmation when the choice affects money, shipping, privacy, legal policy, inventory or customer commitments.

The two supplied visual references are directional references only. Do not copy another brand's logo, illustrations, exact content, or proprietary assets. Recreate the visual principles as an original Laira Charms identity.

## 1. Product definition
Laira Charms sells handmade keychains in Pakistan. The platform supports:
1. Ready-made products.
2. Fixed-price configurable products with predefined options and server-calculated price.
3. Bespoke made-to-order requests requiring admin review and a quotation.
4. Guest checkout and registered customer accounts.
5. Manual bank/wallet transfer with customer proof upload and independent admin verification.
6. Website-first customer/admin messaging. Instagram is optional/future. WhatsApp is explicitly out of scope.
7. Admin management of catalog, options, stock/capacity, quotes, orders, payment proofs, conversations, payment instructions and store settings.

This is not a multi-vendor marketplace.

## 2. Technology and version policy
Use the latest stable, mutually compatible versions available on the day the repository is initialized. Re-check official release notes and security advisories; never select canary, beta or RC builds for production without explicit approval. Record exact resolved versions in the lockfile and an architecture decision record.
Expected baseline:
- Next.js App Router + React + strict TypeScript.
- Supabase PostgreSQL, Auth, Storage, Realtime and Edge Functions where appropriate.
- Vercel Local/Preview/Production deployment environments.
- Zod or equivalent runtime validation.
- Vitest + Testing Library for unit/component tests.
- Playwright for browser E2E, cross-browser and mobile emulation.
- axe-core plus manual accessibility review.
- Transactional email provider behind an adapter; choose only after domain/deliverability evaluation.
Do not expose Supabase service-role/secret keys in browser bundles or `NEXT_PUBLIC_*` variables.

## 3. Mandatory working protocol
Never attempt to generate the entire application in one pass. Work in small, independently testable development units.

For EACH unit:
1. Read the relevant PRD/TRD/TDD sections and inspect the existing repository.
2. State the exact requirements, dependencies, affected files, data changes and acceptance criteria.
3. Identify edge cases, security implications, responsive states and failure states before coding.
4. Produce a concise implementation plan.
5. Implement only the approved unit; do not refactor unrelated modules.
6. Add/update unit tests before or alongside implementation.
7. Run formatting, lint, strict typecheck and build.
8. Run unit, component and integration tests relevant to the unit.
9. Run Playwright feature tests for the full user journey.
10. Test responsive layouts at 320, 360, 390, 430, tablet, laptop and wide desktop widths as relevant.
11. Test keyboard operation, focus, labels, reduced motion and automated accessibility scan.
12. Run security negative tests for authorization, IDOR, input validation, file uploads and price tampering where relevant.
13. Run regression tests for all previously completed critical flows.
14. Inspect the browser UI; do not rely on source-code inspection alone.
15. Fix all failures before declaring completion.
16. Update docs, migration notes, traceability matrix and test report.
17. Report changed files, commands, test counts, failures, known limitations and evidence.
18. Stop and ask before moving to the next unit if acceptance criteria fail or an unresolved business decision blocks correctness.

Do not claim tests passed unless they were actually executed. Do not suppress failures, weaken assertions, skip tests to obtain a green build, or mark TODO placeholders as complete.

## 4. Non-negotiable quality rules
- Every route has appropriate loading, empty, error, success and not-found states.
- Every form has labels, validation, inline errors, disabled/loading state and recoverable failure state.
- Authentication includes Login, Register, Logout, Forgot Password, Reset Password, verification/callback handling and session-expiry behavior.
- Product detail pages support image gallery, lightbox/zoom, keyboard/touch controls and normal vertical page scrolling.
- Mobile responsiveness is required, not a later enhancement.
- No dead buttons, fake links, lorem ipsum, placeholder product data in production or decorative controls that do nothing.
- No console errors, unhandled promise rejections, broken image assets or inaccessible dialogs.
- All admin actions are authorized server-side and protected by database policies.
- All customer-owned data is isolated with RLS and negative cross-account tests.
- Money is calculated server-side with integer minor units/decimal-safe arithmetic.
- Order item snapshots preserve purchase-time title, options, price and customization.
- Payment screenshot upload NEVER marks a payment as verified.
- Admin must independently reconcile payment against the actual bank/wallet receipt before approval.
- Payment status and order fulfilment status are separate.
- Quote acceptance must validate active version and expiry server-side; accepted quote terms are immutable.
- Guest access uses verified email and opaque, expiring, revocable tokens; order IDs are not authorization.
- Messages are persisted in Postgres before Realtime broadcast. Internal admin notes must never reach customers.
- All uploads use private storage unless explicitly public product media; enforce MIME, size and ownership rules.
- Do not invent customer reviews, ratings, stock, product claims, shipping promises or legal policy.

## 5. Visual and interaction direction
Synthesize the two references into an original handmade boutique style:
- Warm cream/butter-ivory base.
- Pastel pink, lavender and coral accents.
- Warm dark-brown readable text.
- Rounded product photography frames and soft card shapes.
- Friendly licensed display font paired with legible sans-serif UI font.
- Whimsical original keychain/charm doodles and small decorative shapes.
- Editorial homepage with hero, featured products, value story, custom-order explainer, best sellers, testimonials only when real, Instagram gallery and footer.
- Product photography is the focus; never substitute generic generated imagery for real inventory photos.

The site must feel alive, not like static wireframe pages. Implement polished but restrained:
- Hero objects with subtle floating/rotation.
- Scroll-triggered section reveals.
- Product card image hover transitions.
- Button/nav micro-interactions.
- Gallery/lightbox transitions.
- Cart feedback and status transitions.
- Messaging new-message transitions.
Use transforms/opacity, avoid layout thrashing, do not animate essential information into invisibility, and honor `prefers-reduced-motion`. No motion may block clicks, scroll, reading or checkout.

## 6. Business workflows to implement correctly
### A. Fixed-price customization
Customer selects predefined allowed options; required fields validate; server recalculates price; unavailable combinations cannot be ordered.

### B. Bespoke custom request
Customer submits brief and optional reference images; admin reviews and may ask questions via website messaging; admin issues a quote containing scope, price, currency, production estimate and expiry; customer accepts/declines; acceptance creates a locked payable order.

### C. Guest/account checkout
Both supported. Guest receives secure verified-email access to order and conversation. Registered customer can see own orders, quotations, addresses and conversations. Never expose another customer's records.

### D. Manual payment
Display admin-configured account details and amount. Customer uploads proof. Status becomes Verification Pending. Admin reviews private proof and independently checks actual receipt. Approve/reject with audit record and rejection reason. Only successful authorized approval can trigger payment-verified/order-confirmed email.

### E. Website messaging
Website is the primary communication channel. Support general, product, custom-request, quotation and order contexts. Guest must verify email. Provide inbox, history, attachments, read/unread, internal admin notes, status/priority and email alerts. Realtime is a delivery enhancement; database is source of truth. Instagram integration may be evaluated later; no WhatsApp.

## 7. Required development sequence
Use the unit plan in TDD:
0. Repository foundation and CI.
1. Database, Auth and RLS.
2. Design system and storefront shell.
3. Catalog, search and categories.
4. Product details and gallery.
5. Fixed customization.
6. Custom request and quotations.
7. Cart and checkout.
8. Manual payment and proof review.
9. Order lifecycle and admin.
10. Website messaging.
11. Customer account and admin polish.
12. Full hardening and release.

Do not start a dependent unit until its prerequisites and tests pass.

## 8. Testing and evidence
Maintain a requirement-to-test traceability matrix with:
- Requirement ID.
- Module/unit.
- Test case ID.
- Test layer.
- Result (pass/fail/blocked/not run).
- Evidence/artifact.
- Defect link and resolution.

Test at minimum:
- Unit: pricing, validators, state transitions, permissions, formatting.
- Component: form states, gallery, dialogs, responsive controls.
- Integration: Supabase queries, RLS, storage, transactions, auth, email outbox.
- E2E: customer journeys and admin workflows.
- Security: IDOR, cross-user reads, role escalation, CSRF/XSS, upload abuse, rate limiting, price/quote tampering.
- Accessibility: automated axe plus manual keyboard/focus/contrast/reduced-motion review.
- Responsive: phone/tablet/desktop.
- Regression: previously passing critical flows after shared code changes.

Critical scenarios include:
- Forgot Password is present and functional.
- Reset link expiry and invalid token are handled.
- Product page can be vertically scrolled while gallery works.
- Mobile menu, gallery, cart, dialogs and checkout work with touch.
- Customer A cannot access Customer B's order, proof, quote or conversation.
- Customer cannot alter product/quote/order price through browser requests.
- Proof upload never confirms payment.
- Rejected proof can be replaced under policy.
- Double-click checkout does not create duplicate orders.
- Expired quote cannot be accepted.
- Internal admin notes never leak.
- Failed email delivery is visible/retryable and does not corrupt business state.

## 9. Definition of done
A unit is done only when:
- Acceptance criteria pass.
- Relevant tests pass and results are recorded.
- No P0/P1 defects remain.
- Responsive and accessibility checks pass.
- Security checks pass for the changed boundary.
- No placeholder interactions or unhandled states remain.
- Documentation and traceability are updated.
- Preview build is reviewed.

A release is not ready until the full regression suite, production configuration review, backup/restore plan, monitoring, email deliverability, security review and owner operational walkthrough are complete.

## 10. Agent reporting format
At the end of each unit, report:
1. Unit and scope.
2. Requirements completed (IDs).
3. Files changed.
4. Database migrations/policies changed.
5. Tests run with exact commands and pass/fail counts.
6. Browser/device coverage.
7. Security/accessibility checks.
8. Defects found and fixes.
9. Known limitations/blockers.
10. Recommendation: proceed, fix, or request owner decision.

Be rigorous, skeptical and transparent. Correctness and customer trust are more important than speed.

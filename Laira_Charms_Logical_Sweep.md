# Laira Charms — Logical Sweep (Code vs. Requirements)

**Repository reviewed:** `Laira_Charms-main` (uploaded 13 Nov 2026)
**Reviewed against:** your documentation bundle (PRD / TRD / TDD / Master Prompt) **and** the owner decisions you gave me: PostEx + TCS only, shipping charges confirmed by admin, no COD, no returns/refunds, 7–14 day production.

> "Logical sweep" is not defined anywhere in the files, so I treated it as: *does the code actually behave the way the requirements say it must?* If you meant a specific earlier file or format, tell me and I will reshape this.

---

## 1. Bottom line

The project is **well structured and clean on the surface** (strict TypeScript, tidy modules, many tests), but it is **not safe to launch**. The main reason: the order and payment flow mostly runs on **in-memory data inside the server process**, and the database layer underneath does not match it. On top of that there are three money-integrity holes (client-trusted prices, placeholder bank accounts, an admin action that can fail open) and several places where the written policies contradict your decisions.

| Area | Verdict |
|---|---|
| Static quality (types, lint, unit tests) | Pass |
| Order / payment / admin logic | **Fails launch bar** (6 critical, 6 high) |
| Match to your policy decisions | **Does not match** (shipping, lead time, couriers, refunds) |
| Database security rules (RLS / storage) | **Has gaps** that also break live writes |

---

## 2. What I ran, and what I could not

| Check | Result |
|---|---|
| `npm ci` | OK |
| `npm run typecheck` (`tsc --noEmit`) | **Pass** |
| `npm run lint` | **Pass** |
| `npm test` (Vitest) | **Pass: 51 files, 253 tests** |
| `npm run build` | **Not verifiable here.** Failed only because my sandbox cannot reach Google Fonts (`next/font` fetch). Not a code defect, but run it yourself. |
| Playwright E2E (13 spec files) | **Not run** (needs browsers and a live backend). Treat E2E status as unknown. |
| Live Supabase behaviour | **Not run.** Findings in §4 come from reading the SQL migrations against the application code. |
| Depth of review | Deep: checkout, orders, payments, order admin, auth/guards, RLS, storage, outbox cron, policy pages. Lighter: messaging, custom-order, account/address, catalog admin UI. |

Important: **passing tests do not mean the logic is right here.** The 253 tests exercise the in-memory logic and, in one case, *lock in the wrong behaviour* (`shipping.test.ts` asserts the flat Rs. 250 fee that contradicts your decision). I found no tests for server-side price recomputation or for database policies.

---

## 3. Findings by severity

### CRITICAL — fix before any real customer or money

**C-01 · Prices are trusted from the browser** (`lib/checkout/order-service.ts`, `schemas.ts`, `CheckoutForm.tsx`)
`createOrder` totals the order from `unitPriceMinor` sent by the client. There is **no product lookup on the server**, and the schema allows a price of `0`. Anyone can place a Rs. 0 order by editing the request. This breaks BR-02 and the Master Prompt's own "server is authoritative for price" rule. Option prices and customization surcharges have the same problem.
*Fix:* order creation takes only `productId`, option IDs, quantity; server loads price from the database and recomputes everything. Add tampering tests.

**C-02 · Orders and payments live in server memory; database writes are silent and one-way** (`order-service.ts`, `payment-service.ts`, `order-admin-service.ts`)
`MEMORY_ORDERS` / `MEMORY_PAYMENTS` are the primary store. Database writes sit inside `try { } catch { }` blocks, and the Supabase client returns `{ error }` rather than throwing, which the code never checks, so failures are invisible. On Vercel, each serverless instance has its own memory: an order placed on one instance can be missing on the next, and everything vanishes on redeploy. `reviewPayment` reads **only** memory, so the admin can get "Payment record not found" for a real payment. `listCustomerOrders` also reads only memory, so a logged-in customer's history can appear empty.
*Fix:* database is the single source of truth; memory store only for tests/dev behind `allowOfflineFallback()`; check every `{ error }`; write order + items in one transaction (database function).

**C-03 · Database policies don't match what the code writes, and one is dangerously open** (`supabase/migrations/00002`)
- `order_items`: only a SELECT policy exists, so the code's insert is **denied** (silently, see C-02). Live orders would have no line items.
- `payments`: customers have no INSERT/UPDATE policy, so proof submission never persists. Same for the order status update.
- `order_status_history` and `audit_logs`: no INSERT policy even for admins, so history and the audit trail are **never saved** (TDD requires them).
- `orders_insert_checkout` lets **anyone with the public anon key** insert an order row. I found no trigger or CHECK preventing them from setting `payment_status = 'verified'` or `order_status = 'confirmed'` directly through the Supabase REST API.
- Guest orders (`customer_id` null) cannot be read back through RLS at all.
*Fix:* do order creation and payment-proof submission through server-side functions using the service-role client, close direct anon inserts, add missing admin policies, add a CHECK `total = subtotal + shipping`, and add real RLS tests.

**C-04 · Admin payment review can fail open** (`lib/payment/actions.ts → adminReviewPaymentAction`)
If Supabase is not detected as "live", the action runs as `"admin-dev-fallback"` **with no authentication**. Compare `updateOrderStatusAction`, which correctly refuses when `allowOfflineFallback()` is false. A mis-set or missing `NEXT_PUBLIC_SUPABASE_URL` on a production deploy would let anyone approve or reject payments.
*Fix:* use `guardAdmin` or the same fail-closed pattern. Add a test that this action rejects when not live in production.

**C-05 · Placeholder bank accounts are hard-coded** (`lib/payment/bank-details.ts`)
Meezan account `02100109876543`, an invented IBAN, an Islamabad F-7 branch, and EasyPaisa/JazzCash numbers `03001234567` / `03007654321` are in the source and shown to customers. Customers would send real money to the wrong accounts. The payment-method list is also fixed to `meezan | easypaisa | jazzcash` in the schema.
*Fix:* read accounts from admin-managed settings; block checkout until real details are saved; no defaults.

**C-06 · Guest access tokens are weaker than the spec** (`lib/auth/guest-token.ts`, `lib/env.ts`)
- A **default secret is written into the code** (`laira-charms-secure-guest-hmac-secret-min-32-chars`) and into `env.ts`. If `GUEST_TOKEN_SECRET` is not set in production, anyone who reads the repo can forge access tokens for any order. Env validation does not fail in production because every variable has a dummy default.
- Tokens **never expire and cannot be revoked** (BR-08 requires expiring + revocable). The stored hash is never compared; verification just recomputes the HMAC.
- The token travels in the URL query string (`?token=`), so it leaks into history, logs and referrers.
*Fix:* no default secret (crash on boot in production if missing), store token hash + expiry + revoked flag and verify against them, prefer a short-lived cookie or one-time exchange.

### HIGH

**H-01 · Order/payment state is not protected** (`payment-service.ts`)
`submitPaymentProof` forces `order_status = awaiting_verification` for *any* order that isn't paid, including cancelled, shipped or delivered ones. `reviewPayment` sets `confirmed` or `on_hold` unconditionally, so a re-click can pull a **shipped order back to "confirmed"**. Neither uses `canTransitionOrderStatus`; there is no compare-and-set (TDD §4.2).

**H-02 · Payment proof path is client-supplied and unscoped** (`payment/schemas.ts`, `00003_storage_buckets.sql`)
`proofPath` is any string of 3+ characters, never checked against the order. The storage INSERT policy lets any anonymous visitor upload to any path in `payment-proofs`, `custom-request-media` and `message-attachments`. This fails test case PAY-015 and allows storage abuse.

**H-03 · Admin can start production without verified payment** (`order/lifecycle.ts`, `order-admin-service.ts`)
`awaiting_verification → confirmed` is allowed through the plain status action, bypassing payment verification. `on_hold → in_production / ready_to_ship / shipped` is allowed from *any* hold, including a **rejected-payment** hold.

**H-04 · Live hydration bug in order transitions** (`order-admin-service.ts`)
When an order isn't in memory, the DB row (snake_case) is cast straight to `Order` (camelCase). `order.orderStatus` is then `undefined`, so every transition fails with "Illegal order transition". The lookup also interpolates user text into a PostgREST `.or()` filter.

**H-05 · Accepted quotes never become payable orders; old quote versions stay acceptable** (`custom-order-service.ts`)
Nothing in `lib/custom-order` calls order creation. After "Accept", there is no order, no payment step, nothing to pay (PRD journey 7.3 is incomplete). Acceptance checks expiry but not "is this the latest version", so an older published version can still be accepted after a newer one was issued (BR-04).

**H-06 · Idempotency replay hands out a guest token** (`order-service.ts`)
Replaying an `idempotencyKey` returns a **freshly minted guest token** for the existing order to whoever sends it. The key is client-generated and not bound to the user or the cart contents.

### Policy mismatches with your decisions

| Your decision | What the code does | Where |
|---|---|---|
| **Shipping charges: customer contacts admin** | Flat **Rs. 250**, **free over Rs. 3,000**, computed automatically and added to the total. Settings page also exposes "shipping rates" and a free-shipping threshold. Test suite enforces it. | `lib/checkout/shipping.ts`, `shipping.test.ts`, `CartView`, `CheckoutForm`, `AdminSettingsForm` |
| **No shipping line should be invented** | Customers pay a number that was never agreed with the admin. There is no "shipping pending / admin sets charge" state. | order lifecycle |
| **Couriers: PostEx and TCS** | Text says "TCS, PostEx **& others**". `COURIER_PARTNERS` also lists Trax, Leopards, Call Courier, M&P. Default courier silently falls back to `"TCS"`. | `lifecycle.ts`, `actions.ts`, settings, footer/FAQ/shipping page |
| **Production 7–14 days** | `leadTimeDays` allows 0+, defaults to 3; fixtures use 1–7. Copy says: ready-made "24 to 48 hours" (home page), "1–2 business days" (FAQ), custom "3–5 business days" (home, shipping, FAQ, settings default), custom form "7–10 business days". | `catalog-actions.ts`, `catalog-admin-service.ts`, `page.tsx`, `shipping/page.tsx`, `faq/page.tsx`, `settings-service.ts` |
| **No COD** | Correctly stated on checkout, shipping page and FAQ. | OK (consistent) |
| **No returns / no refunds** | Checkout, FAQ and returns page say so, **but** the returns page also promises "a free replacement **or a full refund**" for damaged items, the order lifecycle still has a `refunded` status (`delivered → refunded`), and the database has a `refunded` payment status. | `returns/page.tsx`, `lifecycle.ts`, `00001_initial_schema.sql` |
| **Policy disclosed before checkout** | Shown as small passive text at the bottom of checkout. **No checkbox and no stored acceptance** (policy version + timestamp on the order). It also promises "48h transit protection", which has no backing logic. | `CheckoutForm.tsx` |

**Legal note (not legal advice).** I checked the Punjab Consumer Protection Act 2005 (as amended 2025). Three points matter for you. Section 20 requires the return/refund policy to be disclosed clearly *before* the transaction is completed. Section 12 says liability for **defective products** cannot be limited or excluded by a contract or notice. Section 19 requires a receipt showing date, goods, quantity, price and the seller's name and address; I found **no receipt/invoice feature** in the code. So "no returns for change of mind" is fine as a policy, but a blanket "no refunds ever" may not hold for a genuinely defective item. The code's returns page already leans that way; the clean fix is to word it deliberately (and have a lawyer confirm) rather than leave a contradiction. This is your sister's call.

### MEDIUM / LOW

- **Tracking stored inside the `notes` text and re-parsed with regex** (`order-admin-service.ts`, `CustomerOrderTimeline.tsx`). Customer-typed order notes share that field, so a customer can write fake "Courier: … | CN: …" text. The tracking URL is unvalidated and defaults to `"#"`. Use a proper `shipments` table with an allow-list of couriers and `https://` URL validation.
- **Fake data runs in production.** A sample order ("Ayesha Noor", `LC-20261031-7788`), sample payment and sample quotes are seeded into memory at startup, so they appear in the real admin dashboard.
- **`listCustomerOrders(undefined)` returns every order** in memory. It is guarded today by `guardCustomer`, but it is a leak waiting for the next caller.
- **Five copies of `isLiveSupabaseConfigured()`**, and three of them ignore `NODE_ENV`, so production behaviour differs per file.
- **Placeholder email `customer@example.pk`** is used as a fallback recipient in four services.
- **No Content-Security-Policy header** (TRD asks "where feasible"). Other security headers are present.
- **Placeholder product images** are 134-byte stubs, and remote images depend on Unsplash.
- **README** marks only Unit 0 as completed although most units have code. Keep a real traceability matrix (the Master Prompt requires one).

### What is genuinely solid

Strict TypeScript and clean lint; money kept as integer paisa; payment-proof upload **never** auto-verifies (it only sets `verification_pending`); `guardAdmin` and `updateOrderStatusAction` fail closed; role-escalation trigger on `profiles`; internal admin notes are excluded from customer RLS; guest-token comparison is timing-safe; cron outbox endpoint refuses to run in production without `CRON_SECRET`; quote expiry is checked on the server; security headers (HSTS, nosniff, frame, referrer) are set; order reference and idempotency concept are in place.

---

## 4. Recommended fix order

1. **Money integrity:** C-01 (server pricing), C-04 (fail-closed admin review), C-05 (real accounts from settings only), C-06 (secret + expiry).
2. **One source of truth:** C-02 + C-03 + H-04. Move orders/payments to the database via server functions; fix RLS; stop swallowing errors; add DB-level tests.
3. **State machine:** H-01, H-03, H-06 plus a rule "order cannot leave `awaiting_verification` unless payment is `verified`".
4. **Your policies:** replace automatic shipping with "shipping to be confirmed by admin" (new order state, admin enters charge, payment amount unlocks after). Restrict couriers to PostEx and TCS. Enforce 7–14 days in the admin form and database CHECK, and update every copy block. Remove `refunded`. Add a checkout acceptance checkbox that stores policy version + timestamp. Add a receipt.
5. **Quote-to-order (H-05)** and a `shipments` table.
6. **Re-run:** typecheck, lint, tests, `npm run build` on your machine, then Playwright E2E against a test Supabase project.

---

## 5. Decisions I need from you / your sister

1. **Damaged or wrong item:** keep "replacement or refund" as the exception, replacement only, or truly nothing? (See the legal note.)
2. **Seller-side failure:** if she cannot make an order after being paid, how is the customer reimbursed? Today no mechanism exists.
3. **Can a customer cancel** before production starts?
4. **Real payment accounts** (bank/IBAN/wallet titles) and the seller name and address for receipts. These should come from her, ideally entered by her into the admin settings so they never sit in code.
5. **Per-product lead times** within 7–14 days.
6. **Hosting budget:** Vercel's free Hobby plan is non-commercial only, so a live store needs Pro (about $20/month), and Supabase's free tier pauses after a week of inactivity and has no backups, so Pro (about $25/month) is the safe choice for a store that holds orders and payments.

---

## 6. Note on the earlier documentation update

In my previous turn I researched PostEx, TCS, Pakistani consumer law and hosting, and began converting your Word files to Markdown. I had **not yet delivered** the updated documents. Say the word and I will finish them (incorporating your five decisions plus the findings above), and/or patch the code in the order in §4.

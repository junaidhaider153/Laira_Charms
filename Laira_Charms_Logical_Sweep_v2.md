# Laira Charms — Logical Sweep v2 and Launch Readiness

**Reviewed:** the updated `Laira_Charms-main.zip` (237 files), compared against the version I reviewed last time.
**Verdict: not ready to launch yet.** A lot was fixed, and the code is in much better shape. But customers still could not complete the core journey in production: the payment screenshot is never uploaded, order emails cannot be sent, and the bank accounts shown at checkout are still placeholders. Your shipping decision is also not implemented.

---

## 1. What I ran

| Check | Result |
|---|---|
| `npm run typecheck` | **Pass** |
| `npm run lint` | **Pass** |
| `npm test` | **Pass: 53 files, 262 tests** (was 51 / 253) |
| Production build (`next build`) | **Pass**, with two caveats. (1) My sandbox can't reach Google Fonts, so I built a scratch copy with the two `next/font` calls stubbed; your real build needs internet or self-hosted fonts. (2) It fails unless `GUEST_TOKEN_SECRET` is set at build time (see N-07). All 45 routes compiled. |
| Smoke test of the production build | 23 public pages return 200, unknown URL returns 404. `/admin/*` and `/account` redirect to `/login` when Supabase is not configured (fail closed). Cron endpoint returns 401 without the secret and 200 with it. The sample order is correctly **absent** in production. |
| Playwright end-to-end tests | **Not run** (no browsers/backend in my sandbox) |
| Live Supabase | **Not tested.** Database findings come from reading the SQL against the code. |

Passing tests still do not prove the flows work live: the tests run on in-memory data, and `shipping.test.ts` still asserts the old Rs. 250 rule.

---

## 2. Status of last sweep's findings

| ID | Finding | Status now | What remains |
|---|---|---|---|
| C-01 | Prices trusted from browser | **Fixed** for price and options (server looks up product and recomputes) | No stock or availability check at order time (N-05). If `customization` is omitted for a product that has options, required-option validation is skipped. |
| C-02 | Orders/payments only in memory, DB errors swallowed | **Partly fixed** | Writes now use the service-role client and throw in production. But idempotency is still memory-only, and **guest order reads still use the user client, which RLS blocks** (see N-12). |
| C-03 | RLS gaps | **Partly fixed** (new `00005` migration: total check, insert policies, status-restricted order insert) | Guest policies are `customer_id is null` for *anyone*, relying on UUIDs staying secret. Since writes now use service-role, those guest clauses and the anon order-insert policy can simply be removed. Storage policy is still open to anyone (see H-02). |
| C-04 | Admin payment review fails open | **Fixed** (fail-closed check + new `actions.test.ts`) | — |
| C-05 | Fake bank accounts hard-coded | **NOT fixed in the app** | `formatPaymentAccountsFromSettings()` exists but **nothing calls it**. The payment card and proof form still list the static accounts (`02100109876543`, `03001234567`, `03007654321`). |
| C-06 | Guest token weak | **Mostly fixed** (no default secret in production, 30-day expiry, hash compared) | No revoke flag; token still in URL; `lib/env.ts` production check is dead code (never imported). |
| H-01 | Unguarded state changes | **Mostly fixed** | A payment *reject* still puts a shipped or in-production order `on_hold`. |
| H-02 | Proof path unscoped | **Partly fixed** | Path must start with `payment-proofs/`, but is not tied to the order, and storage upload policy is still open. Moot until upload exists (N-01). |
| H-03 | Production without verified payment | **Partly fixed** | Rejected payments now block production. But the admin "Confirmed" status button auto-sets `paymentStatus = verified` with no proof and no review. |
| H-04 | DB row cast to Order | **Fixed** (`mapDbOrderToDomain`) | — |
| H-05 | Accepted quote creates nothing | **Fixed in code** (quote acceptance now creates an order) | The redirect link `/account/custom-orders/<id>` is a dead route (the real page is `/account/requests`), see N-09. |
| H-06 | Idempotency replay leaks token | **Fixed** (owner check) | Memory-only lookup. |

### Your policy decisions

| Decision | Status |
|---|---|
| Shipping charges: customer contacts admin | **Not implemented.** `shipping.ts` is byte-for-byte unchanged: flat Rs. 250, free over Rs. 3,000, added automatically. The default banner still says "Free delivery over Rs. 3,000". No page says "contact admin about shipping". |
| PostEx and TCS only | **Done** (`COURIER_PARTNERS`, settings default "PostEx & TCS", shipping page). |
| No COD | **Done**, consistent everywhere. |
| No returns / no refunds | **Mostly done.** Returns page is now replacement-only; `refunded` removed from transitions; checkout has an acceptance checkbox. **But:** the checkbox is client-side only (nothing stored or enforced on the server), and the home page now promises a **"30-Day Snag & Snap Warranty"** (free fix or identical replacement) that you never asked for. |
| Production 7–14 days | **Not enforced.** Product `leadTimeDays` still allows 0 (default 3); badges say "Next day drop" / "3d craft"; home page says "3-5 studio business days". FAQ (custom 7-14) and the checkbox text are correct. |
| Receipt (Punjab Act s.19) | **Added**, but titled "Tax Invoice" with no tax number, and the seller block shows only "Laira Charms" with no address. |

---

## 3. New findings

### Launch blockers

**N-01 · The payment screenshot is never uploaded** (`ProofUploadForm.tsx`)
The form builds a text path like `payment-proofs/<ref>/<time>_<name>` and submits it. No code anywhere calls `.upload()`, creates a signed URL, or reads from storage. The admin sees a path to a file that does not exist, so cannot verify any payment visually. This breaks the core journey.

**N-02 · Customer files are dropped elsewhere too**
Custom-order reference photos are added to the form data, but the server action never reads them. Chat attachments are sent as base64 to a server action; I did not verify they are stored.

**N-03 · Emails cannot work live**
The outbox writes to a `notification_outbox` table, but **no migration creates it** (zero matches in all five SQL files). The Resend provider and cron route are correctly built; the table is missing, and enqueue errors are swallowed, so order and payment emails would silently never go out.

**N-04 · The owner cannot add product photos**
The admin product form takes an image URL typed as text. Your sister cannot upload photos from her phone or computer.

**N-12 · Guest order pages can disappear** (`getOrderByReference`)
Guest orders are looked up in memory first, then in the database with the user's session. RLS blocks that read when `customer_id` is null, so on a fresh server instance a guest gets "not found" for their own order. Read with the service-role client *after* verifying the token.

**C-05 (above)** · The live UI still shows placeholder bank accounts.

**Shipping decision (above)** · customers are charged a fee that was never agreed with the admin.

### High / medium

- **N-05 No stock check:** nothing stops ordering sold-out or limited items, or an archived product if it is still found.
- **N-06 Shipping settings are decorative:** the admin "shipping" form saves values that cart and checkout never read; both use constants.
- **N-07 Deploy trap:** the messaging service creates a sample guest token at import time, so the build crashes if `GUEST_TOKEN_SECRET` is missing. Failing closed is right in production, but make that sample code lazy or dev-only.
- **N-08 Rate limiting is per-server memory:** on Vercel each instance has its own counter, so the limits (login, register, chat, custom order) are weak. Honeypots work. Add a shared store.
- **N-09 Dead link** `/account/custom-orders/<id>` after a quote is accepted.
- **N-10 "Meezan" is hard-coded in site copy** (footer, cart, checkout, FAQ, proof form). Confirm what your sister actually uses.
- **N-11 Tracking is still stored inside `order.notes`** and parsed with regex; customer-typed notes share that field.
- **N-13 Hosting and secrets:** set `GUEST_TOKEN_SECRET`, `CRON_SECRET`, Supabase keys, Resend key and a verified sending domain in Vercel. Vercel's free Hobby plan is non-commercial; Supabase free pauses after a week of inactivity and has no backups.

### Still solid
Strict TypeScript, clean lint, integer money, server-side price recalculation, proof upload never auto-verifies, admin and cron endpoints fail closed, role-escalation trigger, internal-note isolation, timing-safe tokens with expiry, security headers, sitemap/robots/Product JSON-LD/Open Graph, honeypots, receipt page, courier restricted to PostEx/TCS.

---

## 4. Launch checklist (in order)

1. **Make payments real:** upload proofs to the `payment-proofs` bucket (path = order reference, server-validated) with admin signed-URL viewing; render accounts from `store_settings` only and block checkout until they are saved.
2. **Make emails real:** add the `notification_outbox` migration; send a test order email end to end.
3. **Shipping:** replace the automatic fee with "to be confirmed by admin" (new order state; admin sets the charge; payment amount unlocks afterwards). Remove the free-shipping banner and threshold.
4. **Lead time:** enforce 7–14 in the admin form and a database CHECK; update the home page and product badges.
5. **Guest reads, stock check, "Confirmed" button bypass, reject-on-shipped, dead link.**
6. **Owner tools:** photo upload for products; seller name/address on the receipt; rename "Tax Invoice" unless she is tax-registered.
7. **Decide the warranty:** keep or remove "30-Day Snag & Snap" and have a lawyer confirm the returns wording.
8. **Re-test:** run Playwright against a test Supabase project, place a real Rs. 100 test order, verify the payment, ship it, and read every email.

## 5. Questions for you / your sister
1. Which payment methods does she actually use (bank, EasyPaisa, JazzCash, Raast)? Real account titles?
2. Keep or remove the 30-day warranty promise?
3. Is she registered for tax? What business name and address go on receipts?
4. How should shipping be quoted: by chat message, or an admin field per order?

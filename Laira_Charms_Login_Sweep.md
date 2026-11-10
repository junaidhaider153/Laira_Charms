## 1. Answers to your three questions

| Question | Answer |
|---|---|
| Why does the navbar feel stuck on every page? | The header is `position: fixed` with two stacked bars (announcement + main nav). Only `/` and `/shop` add top padding to make room. Every other page starts underneath it. Admin pages also render the public header and footer on top of the admin header. (From code; not checked visually.) |
| Why no floating chat? | It was never built. Chat exists only on `/orders/[reference]` and `/conversations/[id]`, so a visitor can't ask anything before ordering. |
| Is there a sign-in / admin login? | A login page exists at `/login` (plus `/register`, `/forgot-password`, `/reset-password`, `/verify-email`) but **nothing links to it**. There is no separate admin login. An admin is a normal account whose `profiles.role` is `admin`, and nothing creates that role (`ADMIN_BOOTSTRAP_TOKEN` is defined in `src/lib/env.ts` but never used). Worse, **no page checks login at all** (see C1). |

---

## 2. Summary of findings

| ID | Severity | Finding |
|---|---|---|
| C1 | Critical | Admin pages have no login or role check |
| C2 | Critical | Client can request admin rights in messaging actions (live mode) |
| C3 | Critical | Account pages show one hardcoded sample customer to everyone |
| C4 | Critical | Dev fallbacks fail open in production |
| H1 | High | Open redirect via login `returnTo` |
| H2 | High | No session-refresh proxy (random sign-outs) |
| H3 | High | No visible sign-in entry; no way to create an admin |
| H4 | High | Fixed navbar overlaps content; admin shows public header/footer |
| H5 | High | No pre-sale chat |
| H6 | High | Search ignores multi-word queries; raw input in database filter |
| M1 | Medium | `public/` folder missing (placeholder and category images 404, no favicon) |
| M2 | Medium | Shipping/courier rules in code disagree with your decisions |
| M3 | Medium | Admin Inquiries reads an in-memory store directly; other in-memory stores need checking |
| M4 | Medium | `useSearchParams` without `<Suspense>` on auth pages |
| M5 | Medium | Product images are hotlinked Unsplash stock photos |
| M6 | Medium | Tests don't cover access control or search |
| L1 | Low | Archive hygiene (Windows `node_modules`, `.env.local`, `.git`, `screen.png`) |
| L2 | Low | Small UX items (blank-query heading, empty-search text, toast vs chat overlap) |

---

## 3. Critical findings

### C1. Admin portal is unprotected
- **Evidence:** `requireAuth` / `requireAdmin` (in `src/lib/auth/rbac.ts`) are never called anywhere. `src/app/admin/layout.tsx` does no check. With no login, `GET /admin/orders`, `/admin/products`, `/admin/inquiries`, `/admin/conversations` all returned **HTTP 200**, and `/admin/orders` displayed order `LC-20261031-7788`. (Tested on the dev server in offline/sample-data mode.)
- **Fix:** create `src/lib/auth/guards.ts` with `guardAdmin(returnTo)`:
  - Supabase live: no profile, redirect to `/login?returnTo=<path>`; role is not `admin`, redirect to `/`.
  - Supabase not configured **and** `NODE_ENV === "production"`: redirect to `/login` (fail closed).
  - Supabase not configured **and** local dev: allow (so local work and e2e keep running).
- Call `await guardAdmin("/admin/...")` at the top of **every** admin page **and** the admin layout. A layout-only check is not enough, because layouts don't re-render on client-side navigation.
- Pass the real admin id to `listConversations` in `admin/conversations/page.tsx` (it currently uses the literal `"admin-view"`).
- **Accept when:** signed out, `/admin/*` redirects to `/login?returnTo=...`; a customer account is bounced to `/`; an admin sees the page.

### C2. Anyone can act as admin in messaging (live mode)
- **Evidence:** `src/lib/messaging/actions.ts`, `resolveActor(guestToken, requestedAdmin)`. `requestedAdmin` comes from the browser (`isAdminAction`, or `visibility === "internal_admin_only"`). On a live Supabase site, when the visitor is not signed in (or the auth lookup throws), the function falls through to the "offline dev fallback" and returns `role: "admin"`.
- **Fix:** in live mode, derive the role **only** from the signed-in user's `profiles.role`; never trust client flags; any failure becomes `{ userId: null, role: "customer" }`. Only honour `requestedAdmin` when `allowOfflineFallback()` is true.
- **Accept when:** a test with live env, no user, and `isAdminAction: true` still produces `role: "customer"`.

### C3. Account pages show a hardcoded sample customer
- **Evidence:** `src/app/(public)/account/{page,orders,addresses,requests}/page.tsx` use `const userId = SAMPLE_CUSTOMER_USER_ID`. `src/lib/account/actions.ts`'s `resolveCustomerUserId()` returns the sample id when nobody is signed in, even on a live site.
- **Fix:** add `guardCustomer(returnTo)` (same rules as `guardAdmin`, returns the real `userId`) and use it on all four pages. In `resolveCustomerUserId()`: live mode with no user throws "Please sign in…". The sample id is only allowed in local dev.
- **Accept when:** signed out, `/account*` redirects to login; signed in, you only see your own addresses and orders.

### C4. Dev fallbacks fail open in production
- **Evidence:** `src/lib/order/actions.ts` (`adminId = "admin-dev-fallback"` when Supabase is a placeholder), `src/lib/admin/catalog-actions.ts` (`verifyAdminAuth` does nothing when not live), plus C2/C3. A production deploy with missing or placeholder env vars would open these up.
- **Fix:** create `src/lib/auth/offline-mode.ts`:
  ```ts
  export function isLiveSupabaseConfigured() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(url && !url.includes("dummy-project") && !url.includes("example.com"));
  }
  export function allowOfflineFallback() {
    return !isLiveSupabaseConfigured() && process.env.NODE_ENV !== "production";
  }
  ```
  Every "dev fallback" must go through `allowOfflineFallback()`. In order/catalog admin actions, if not live **and** not `allowOfflineFallback()`, return "Unauthorized".
- **Accept when:** with placeholder keys and `NODE_ENV=production`, admin actions are refused.

---

## 4. High findings

### H1. Open redirect on login
`signInAction` in `src/lib/auth/auth-actions.ts` accepts any `returnTo` that starts with `/`, so `//evil.com` passes. **Fix:** also reject values starting with `//` or containing `\`, and only redirect when `typeof returnTo === "string"`. Also send admins to `/admin/orders` when no `returnTo` is given (look up `profiles.role` after sign-in).

### H2. No session-refresh proxy
No `proxy.ts` exists (Next 16 name for middleware). `src/lib/supabase/server.ts` itself says cookie writes are ignored "if you have middleware refreshing sessions". Result: expired tokens can't be refreshed in Server Components, so users get signed out unpredictably.
**Fix:** add `src/proxy.ts` (`export async function proxy(request)`) using `createServerClient` from `@supabase/ssr` with `getAll`/`setAll` on request and response cookies. Skip it when Supabase isn't live. Also redirect signed-out visitors from `/admin*` and `/account*` to `/login?returnTo=...` (optimistic first gate only). Use a matcher that excludes `_next/static`, `_next/image`, and static files.

### H3. Sign-in entry points
Add to `SiteHeader.tsx`:
- Desktop: a visible **Sign in** link (`/login`); when signed in, show **Sign out** (`signOutAction`), plus **Admin** (`/admin/orders`) for admins.
- Mobile drawer: **Sign in** and **Create account** buttons; when signed in, **Sign out**; for admins, an **Admin Portal** link.
- Keep the account icon as `<Link href="/account" aria-label="Account Profile">`, because the existing `SiteHeader.test.tsx` asserts it.
- Sign-in state in the header is UI only. Detect it client-side with `getSession()` plus a `profiles` role lookup, and skip it when Supabase isn't live.
- Add **Sign out** buttons to the admin layout nav and the account layout header.
- **Creating the first admin:** sign up normally, then in Supabase SQL run `update public.profiles set role = 'admin' where email = '<your email>';`. Document this in the README (`ADMIN_BOOTSTRAP_TOKEN` is unused and can be removed or implemented).

### H4. Navbar
- Change the wrapper from `fixed top-0 left-0 right-0` to a fragment: **announcement bar first (scrolls away)**, then `<header className="sticky top-0 z-50 ...">` containing the main nav and the mobile drawer.
- Remove the compensating padding: `src/app/page.tsx` (`pt-24 sm:pt-28`, use about `pt-4 sm:pt-6`) and `src/app/(public)/shop/page.tsx` (`pt-20 sm:pt-24`, use about `pt-6 sm:pt-8`).
- Render `null` from `SiteHeader`, `SiteFooter` and the chat widget when `usePathname()` starts with `/admin` (hooks first, then the early return).
- **Accept when:** the first heading on `/about`, `/faq`, `/cart`, `/checkout`, `/search` and a product page is fully visible without scrolling, and the main nav stays pinned while scrolling.

### H5. Pre-sale chat
Create `src/components/messaging/FloatingChatWidget.tsx`, mounted in `src/app/layout.tsx` after `<SiteFooter />`.
- Floating button bottom-right (`z-40`, below the cart drawer's `z-50`). Opens a dialog with **email** and **question**.
- Submit calls the existing `createConversationAction({ title: "Pre-order question", contextType: "general", guestEmail, initialMessage })`, saves `{ id, guestToken }` in `localStorage` (try/catch), then `router.push("/conversations/<id>?token=<guestToken>")`. The guest token is only returned once, which is why it is stored.
- Returning visitors see "Continue your previous conversation".
- Hidden on `/admin*`, `/conversations*`, `/orders*`. Escape closes it; label inputs; `role="dialog"`; `role="alert"` on errors.
- Move the home page "Added to Bag" toast from `bottom-6` to `bottom-24` so it doesn't sit under the button.
- Later options: WhatsApp link; FAQ-based auto-replies (that would be the "chatbot" part).

### H6. Search
- **Evidence (dev server):** `strawberry charm` returned 0, `charm strawberry` 0, `key chain` 0, `gift` 0, but `strawberry` 1 and `keychain` 2. Only the whole phrase was matched against title and description. In `catalog-service.ts` the raw query is interpolated into `.or(\`title.ilike.%${query}%,...\`)`, so a comma or parenthesis in the input can break or alter the filter. (React escaping kept XSS out: a `<script>` query was not reflected.)
- **Fix:** add `src/lib/catalog/search.ts`:
  ```ts
  export function tokenizeSearchQuery(raw?: string | null): string[] {
    if (!raw) return [];
    const t = raw.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .split(/[\s-]+/).map(s => s.trim().slice(0, 40)).filter(Boolean);
    return Array.from(new Set(t)).slice(0, 6);
  }
  export function matchesAllTokens(tokens: string[], fields: Array<string | undefined | null>) {
    if (!tokens.length) return true;
    const hay = fields.filter((f): f is string => typeof f === "string")
      .join(" ").toLowerCase().replace(/-/g, " ");
    return tokens.every(t => hay.includes(t));
  }
  ```
  - Live: for each token, chain `.or("title.ilike.%t%,description.ilike.%t%,slug.ilike.%t%")` (repeated `or` params are ANDed).
  - Fixtures: filter with `matchesAllTokens(tokens, [title, description, categoryName, slug])`.
  - Search page: `const query = (q || "").trim().slice(0, 100)`; empty-result text: "Try fewer or simpler words, or browse the full collection."
- **Accept when:** `strawberry charm`, `charm strawberry` and `key chain` all return results; `strawberry spaceship` returns 0; `a,b` and `x)` don't error.

---

## 5. Medium and low findings

- **M1. Missing `public/`.** `/images/placeholder.jpg` and `/images/category-{ready-made,personalized,bespoke}.jpg` are referenced but don't exist (404). No favicon. Add the files, plus `src/app/icon.svg`. Replace the placeholders with real photos of your charms.
- **M2. Business rules vs code.** `src/lib/checkout/shipping.ts` hardcodes Rs. 250 shipping and free above Rs. 3,000, and the header advertises the free-shipping threshold, but your decision was that customers ask the admin about shipping charges. The header listed "Trax, PostEx & TCS" while your couriers are PostEx and TCS, and `src/lib/order/actions.ts` defaults the courier to `"Trax"`. **You decide the shipping rule** (flat fee, free threshold, or "contact us"), then make the code, header banner, `/shipping` page and FAQ say the same thing. Also check that checkout and FAQ state "no COD" and "no refunds/returns".
- **M3. In-memory data stores.** Many services keep data in `MEMORY_*` Maps (orders, payments, conversations, custom requests, addresses, admin products). `src/app/admin/inquiries/page.tsx` reads `MEMORY_CUSTOM_REQUESTS` directly, so on a live site you may not see real custom requests. On Vercel, serverless instances don't share memory. For every service, confirm there is a real Supabase read/write path in live mode and that the in-memory path is only a dev fallback. I did not verify each one.
- **M4. Suspense.** `login/page.tsx` and `verify-email/page.tsx` call `useSearchParams()` without `<Suspense>`. The production build passed anyway, but wrapping them is the safe pattern (login done in my copy; verify-email still to do).
- **M5. Product images** are Unsplash hotlinks in `src/lib/catalog/fixtures.ts`. Use your own photos in the Supabase storage bucket.
- **M6. Test gaps.** 175 unit tests and the last e2e run all passed even with C1 to C4 and H6 present. Add the regression tests in Section 7.
- **L1. Archive hygiene.** `node_modules` was installed on Windows (missing Linux native binaries, so tests don't run on Linux/CI until `npm ci`). `.env.local` contains only dummy values (fine, but never zip real keys). `.git`, `.next` and a 3.4 MB `screen.png` inflated the archive to about 440 MB; exclude them.
- **L2. Small UX.** A whitespace-only search showed "Found 6 results matching ' '" (fixed by trimming). Check the `/shop` category filters on mobile and the empty-cart state during retest.

---

## 6. Verification results (original project)

| Check | Result |
|---|---|
| `tsc --noEmit` | Passed |
| ESLint | Passed |
| Vitest | 175 / 175 passed |
| Last Playwright report in the archive | Passed (not re-run) |
| Route probe, no login (dev server) | All routes 200, including `/admin/*` and `/account/*`; unknown path 404 |
| Search probe | Multi-word queries returned 0 (see H6) |

After my fixes, in my review copy: typecheck and lint clean, **199 / 199** tests (24 new), and the production build compiled. The fixes for C1 to C4, H1 to H6 and M1 are described above for Antigravity to apply.

**Still unverified:** guarded pages on a production build (they show as statically prerendered, so add `export const dynamic = "force-dynamic"` to all `/admin/*` and `/account/*` pages, and confirm the redirects); login, logout, proxy and header role detection against a real Supabase project; the full checkout and payment flow.

---

## 7. Tests to add

- `offline-mode.test.ts`: placeholder URL is not live; real URL is live; production + placeholder gives `allowOfflineFallback() === false`.
- `guards.test.ts` (mock `next/navigation` `redirect` to throw, mock `getCurrentProfile`): signed out redirects to `/login?returnTo=%2Fadmin%2Fproducts`; customer redirects to `/`; admin passes; lookup error counts as signed out; production + placeholder redirects; dev + placeholder passes.
- `actions.security.test.ts` (messaging): live env + no user + `isAdminAction: true` gives `role: "customer"`; auth lookup throws gives customer; production + placeholder gives customer.
- `search.test.ts`: tokenizer (case, duplicates, special characters, blank, cap of 6) and `getProducts` for `strawberry charm`, `key chain`, whitespace-only.
- `signInAction`: `returnTo` of `//evil.com`, `/\evil.com` and `https://evil.com` must not be followed.
- e2e: header visible on `/about` without scrolling; chat button visible on `/shop`; sign-in link visible in the header.

---

## 8. Retest checklist (what I'll run when you send the updated project)

1. `npm ci`, then typecheck, lint, unit tests, production build.
2. Signed out: `/admin/*` and `/account*` redirect to login with `returnTo`.
3. Customer account: `/admin/*` bounces home; `/account` shows only that customer's data.
4. Admin account: admin pages load; sign out works from header, account and admin nav.
5. Login with a safe `returnTo`; bad `returnTo` values ignored.
6. Header: sign-in, admin and sign-out controls on desktop and mobile; nothing hidden under the nav on every public page.
7. Floating chat: send a question as a guest, land in the thread, admin sees it in `/admin/conversations`, reply appears, "continue conversation" works after reload.
8. Search: multi-word, hyphenated, special characters, empty, no-result.
9. Add to bag, bag drawer, checkout validation (email, Pakistani phone, city), order confirmation, payment proof upload, order page chat.
10. Mobile widths (360 and 390 px): menu, bag, chat button not covering primary buttons.
11. Shipping and policy text consistent across header, `/shipping`, `/returns`, FAQ and checkout.

---
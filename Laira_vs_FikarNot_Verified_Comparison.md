# Laira Charms vs FikarNot — Verified Feature Comparison

**How this was built.** The Laira column comes from my own search of the current `Laira_Charms-main.zip` (the version uploaded today). The FikarNot column comes **only** from your `Laira_vs_FikarNot_Gap_Analysis.md`: the FikarNot zip was not uploaded this time, so I could not check it myself. Where your analysis disagrees with the current Laira code, I say so.

**Business fit applied:** handmade charms sold via Instagram, no COD, no returns/refunds, PostEx/TCS, 7–14 day production, one or two admins.

---

## 1. Your analysis is out of date on Laira

The "must fix" list in your gap analysis (section 2.1) describes an older snapshot. Against today's code:

| Claim in your analysis | What the current code shows |
|---|---|
| Emails never sent; only a console provider | A **Resend provider** and a **protected cron route** (`/api/cron/process-outbox`, scheduled in `vercel.json`) now exist. **But** the `notification_outbox` table is in no migration, so live emails still fail. |
| Owner can't add products (stock editing only) | Admin has **create / edit / delete product**, **category manager**, publish/draft. **But** images are typed URLs; there is **no file upload**. |
| No sitemap, robots, JSON-LD, Open Graph | All four exist (`sitemap.ts`, `robots.ts`, Product JSON-LD, per-product Open Graph). |
| No spam or abuse protection | **Rate limiting and honeypots** exist on login, register, reset, chat and custom order. Limits are per-server memory (weak on Vercel); no CAPTCHA. |
| Store settings hard-coded; table unused | An **admin settings screen** reads/writes `store_settings` (banner, payment details, shipping, couriers). **But** cart and checkout still use fixed constants, so the shipping settings do nothing. |
| No order invoice/receipt | A **printable receipt** exists on the order page. |
| Admin categories: No | Exists. |
| Courier tracking: not verified | Exists: courier (PostEx/TCS) + tracking number set when marking "shipped", shown on the customer timeline. Stored inside `order.notes`. |

So the gap is smaller than your document says, but **several of these features exist in code and still do not work end to end** (see `Laira_Charms_Logical_Sweep_v2.md`).

---

## 2. Corrected feature matrix

Legend: ✅ works in code · ⚠️ exists but incomplete · ❌ absent · — not relevant

| Feature | FikarNot (per your doc) | Laira (verified) | Note |
|---|---|---|---|
| Catalog, categories, product page, search | ✅ | ✅ | |
| Cart and checkout | ✅ | ✅ | Laira recomputes prices server-side now |
| Manual payment + proof | ✅ | ⚠️ | Laira form never uploads the screenshot |
| Card / PayFast | ⚠️ not ported | ❌ | Not needed now |
| Cash on delivery | ✅ | — | Your decision: no COD |
| Custom orders + quotations | ❌ | ✅ | Laira's strength; accepted quote creates an order |
| Product personalization options | ❌ | ✅ | Laira's strength |
| Chat with studio | ⚠️ AI chat not ported | ✅ | Guest + customer threads |
| Order status history | ⚠️ | ✅ | |
| Customer account, saved addresses | ✅ | ✅ | |
| Admin: orders | ✅ | ✅ | |
| Admin: products (create/edit/delete) | ✅ | ⚠️ | No image/video upload |
| Admin: categories | ✅ | ✅ | |
| Admin: settings | ✅ | ⚠️ | Shipping part not wired |
| Admin: inventory log | ✅ | ❌ | Stock is a single number; no history; no stock check at checkout |
| Admin: users / editor role | ✅ | ❌ | Only `admin` and `customer` |
| Admin: media library | ✅ | ❌ | |
| Admin: analytics dashboard | ✅ | ❌ | |
| Audit log | ✅ | ⚠️ | Written for payments/orders; no viewer screen |
| 2FA for staff | ✅ | ❌ | Worth adding: admin approves money |
| Coupons | ✅ | ❌ | |
| Product reviews + moderation | ✅ | ❌ | |
| Wishlist, recently viewed, compare | ✅ | ❌ | Basic "related products" only |
| In-app notifications | ✅ | ❌ | |
| Transactional email | ⚠️ planned | ⚠️ | Code ready; table + sending domain missing |
| Invoice / receipt | ✅ | ⚠️ | Exists; needs seller address, no "Tax Invoice" unless registered |
| SEO (sitemap, robots, JSON-LD) | ✅ | ✅ | |
| Rate limiting / honeypot | ⚠️ legacy | ⚠️ | In-memory only |
| Returns / refunds workflow | ✅ | — | Policy is no returns |
| Dark mode | ✅ | ❌ | Low value |
| Typed code, e2e and accessibility tests, CI | ❌ | ✅ | Laira stronger |

---

## 3. What to build next, ranked for Laira

**Must (blocks launch, not a FikarNot feature but a gap anyway)**
1. Real upload of payment proofs, product photos and custom-order reference photos (Supabase Storage).
2. `notification_outbox` migration + verified Resend sending domain.
3. Admin-confirmed shipping (your decision) instead of the automatic Rs. 250 fee.
4. Stock check at checkout.

**Should (copy from FikarNot, good fit)**
5. **Admin 2FA** (Supabase MFA): your sister approves payments, so protect that login.
6. **Audit-log viewer** and an **`editor` role**, if she will have a helper.
7. **Dashboard:** orders by status, pending payment proofs, revenue this month. Use existing order data.
8. **Inventory history** (who changed stock, when).

**Could (after launch)**
9. Coupons for Instagram giveaways (watch the interaction with admin-set shipping).
10. Product reviews with photos, moderated. Strong for handmade items.
11. Wishlist and recently viewed.

**Skip:** COD, returns/refunds workflow, PayFast (until you decide to take cards), comparison, dark mode.

---

## 4. FikarNot's own issues (from your document, not verified by me)

Your analysis lists eight issues. I could not check the code, but two deserve action **first if true**:

- **F1 (High): a real SQLite database inside the project** (`server/config/data/fikarnot.sqlite`, `-wal`, `-shm`) that you say contains password hashes and likely customer and order data. If that repo was ever shared, public, or pushed to a remote others can read, treat the data as exposed: delete the files, purge Git history, and make sure customers who reused passwords elsewhere are told.
- **F7 (Medium): Edge Functions deployed with `verify_jwt=false`.** Confirm each admin function checks the caller's role itself, because hiding pages in React protects nothing.

F2 (old Railway rewrites), F3 (tests still target the old server), F4 (no emails), F5 (hero video upload), F6 (AI chat and PayFast not ported) and F8 (legacy files) are housekeeping and feature gaps, in the order you listed.

---

## 5. If you want me to verify the FikarNot side
Upload the FikarNot zip again and I will check each claim and the F1–F8 list against its code.

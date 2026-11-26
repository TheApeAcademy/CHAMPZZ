# Champzz launch readiness: full test report

Date: 2026-11-26. Tested by Claude Code on branch `claude/zen-volta-9lkjsc`, using a full local copy of the app: the real database schema, real sign-in, and file storage.

## Verdict

**The app itself works.** Every feature, page and button I tested behaves correctly for every role, with no crashes.

**Production is not ready to take money online yet,** because the outside services are not wired:
- Flutterwave
- the email sender
- the AI key
- a domain

**Bank transfer plus Mark as paid works today.** A client can pay by transfer now, and Banks activates them from the console.

| Area | Result |
|---|---|
| Database security and rules (pgTAP) | **1,041 / 1,041 passed** |
| End-to-end feature tests (Playwright, phone size) | **57 / 57 passed** (plus 3 new password-reset tests, see below) |
| Page crawl: every page, every role, every button clicked | **CRAWL_SUMMARY** |
| Type check, lint, production build | Clean (3 lint warnings in the landing file, harmless) |
| Production wiring | **Not done yet:** see section 4 |

---

## 1. What was tested and how

1. **Database tests (pgTAP), 1,041 checks.**
   - Row-level security is on for every table.
   - Each role in club A can't read, change or delete club B's data (about 200 checks).
   - Payments apply once only.
   - Kid limits hold under load.
   - PIN lockout, the grace and read-only lifecycle, and the audit log.
2. **End-to-end tests, 57 scenarios.** A real browser at phone size (Pixel 7) clicks through every feature as a real user would.
   - Card payment runs against a local Flutterwave stand-in.
   - Champ Buddy runs against a local AI stand-in.
3. **Full crawl, done for this report.**
   - Seeded a realistic club: "Rising Stars Club" on the Pro plan, with a teacher, a class, a parent and a confirmed kid (Tobi).
   - Signed in as each of the six roles: visitor, Org Admin, Teacher, Parent, Kid, Super Admin.
   - Visited every page reachable from each role's menus.
   - On every page: recorded load status, crashes and console errors, sideways scroll at phone width, and broken images.
   - **Clicked every non-destructive button on every page**, each on a fresh load, and recorded what happened.
   - Skipped buttons that delete or remove things: they're covered by the scenario tests.

---

## 2. Every feature: works or not

✅ = tested and working. ⚠️ = works in code, but needs production wiring before clients use it. ❌ = missing or broken.

### Accounts and sign-in
| Feature | Status | Evidence |
|---|---|---|
| Create account (adult) | ✅ | e2e 01, crawl |
| Email confirmation on sign-up | ⚠️ | Code works. **Production needs a real email sender** (section 4) |
| Sign in / sign out: Super Admin, Org Admin, Teacher, Parent | ✅ | e2e 03 (one test per role) |
| Wrong password refused | ✅ | e2e 03 |
| **Forgot password / reset password** | ✅ **new** | **It didn't exist. Built today** (section 3), 3 new tests. Needs the email sender in production |
| Kid sign-in: username plus 4-picture PIN | ✅ | e2e 03 |
| Kid lockout after 5 wrong PINs (15 minutes, doubling) | ✅ | e2e 03, pgTAP |
| Teacher resets a kid's PIN | ✅ | e2e 03 |
| Pages redirect to Sign in when signed out, then return after sign-in | ✅ | crawl (`/o`, `/p`, `/console`, `/onboarding`, `/notifications`) |
| Club A users can't reach club B (all roles) | ✅ | e2e 04, pgTAP |
| Super Admin console hidden from everyone else (404) | ✅ | e2e 01 |

### Club setup and payment
| Feature | Status | Evidence |
|---|---|---|
| Onboarding wizard: create club | ✅ | e2e 01 |
| Club starts **pending** until paid | ✅ | e2e 01 |
| **Pay online (Flutterwave card)** | ⚠️ | Works end to end against the stand-in (pay, redirect back, club active). **Production has no Flutterwave keys.** The button is now hidden until keys are set (section 3) |
| Flutterwave webhook: verified, applied once, forged requests refused, wrong amount refused | ✅ | e2e 01 (3 tests) |
| **Pay by bank transfer** (details shown with reference) | ✅ | e2e 01. Production bank details are set |
| **Super Admin Mark as paid** (activates club, records who and when) | ✅ | e2e 01 |
| Suspend or lift a club | ✅ | pgTAP |
| Expiry: active, then grace (7 days), then read-only; nothing deleted, writes blocked | ✅ | e2e 99, pgTAP |
| Kid limit per plan, Upgrade prompt at the limit | ✅ | e2e 02 |
| Prices from the database (NGN) | ✅ | e2e 00 |
| Prices in GBP, USD, EUR, CAD | ❌ | **Only NGN prices exist in production.** The landing shows design placeholders for the others, and a club choosing GBP sees "No online prices" |

### Registration (Clubhouse)
| Feature | Status | Evidence |
|---|---|---|
| Clubhouse page per club (logo, colour, motto, news) | ✅ | e2e 11, crawl |
| Parent adds a child with the join code and picture PIN | ✅ | e2e 02 |
| New kids show as "new" until a teacher confirms | ✅ | e2e 02 |
| Approval mode | ✅ | e2e 02 |
| Join code regenerate (old code dies) | ✅ | e2e 02, crawl |
| Club full: blocked, 8 simultaneous sign-ups against a cap of 3 means exactly 3 get in | ✅ | e2e 02 |
| A forwarded code alone shows strangers nothing | ✅ | e2e 02 |

### Teachers and Org Admin workspace
| Feature | Status | Evidence |
|---|---|---|
| Club dashboard, classes, add teacher to class, kids list, Give a star | ✅ | e2e 05, crawl |
| Team: invite link, join, change role, remove, last Org Admin protected | ✅ | e2e 07, crawl |
| Check-in and check-out with parent pickup codes, wrong code refused, logged release | ✅ | e2e 07, crawl |
| Lessons with Take-Home card | ✅ | e2e 06, crawl |
| Assignments, kid hands in, teacher marks, points | ✅ | e2e 06, crawl |
| Events, parent .ics calendar | ✅ | e2e 06, crawl |
| Messages (locked for new kids, staff reply) | ✅ | e2e 06, crawl |
| Talk to Someone: anonymous, urgent alert, reply, escalation, access log | ✅ | e2e 06 |
| Certificates (issue, print, parents see them) | ✅ | e2e 07, crawl |
| Seasons | ✅ | e2e 07, crawl |
| Insights and CSV export (kids, attendance, points) | ✅ | e2e 07, crawl (all 3 downloads) |
| Search | ✅ | e2e 07, crawl |
| Club settings: name, motto, colour, faith mode, logo upload | ✅ | e2e 07, crawl |
| Name tags (print) | ✅ | e2e 05, crawl |
| Hall of Champs per class | ✅ | e2e 05, crawl |
| Road to Champ host: rules, five tiers, Half Time, scoring, history | ✅ | e2e 09 |
| Road to Champ offline (result uploads later) | ✅ | e2e 09 |
| Question bank and packs | ✅ | e2e 09, crawl |
| Arena content | ✅ | e2e 09, crawl |
| Quests (create) | ✅ | e2e 10, crawl |
| Photo checks (approve or reject kid pictures) | ✅ | e2e 10 |
| Verse recordings (listen, star) | ✅ | e2e 11 |
| Clubhouse posts (draft vs published) | ✅ | e2e 11, crawl |
| Digital Bank (staff-only vs family files) | ✅ | e2e 11, crawl |
| Champ Buddy log | ✅ | e2e 10 |
| Audit log | ✅ | crawl |
| Teacher sees no billing, team or settings | ✅ | e2e 03, crawl |

### Parents
| Feature | Status | Evidence |
|---|---|---|
| My kids dashboard (points, streak, level) | ✅ | e2e 05, crawl |
| Child progress page, weekly report, certificates | ✅ | e2e 08, crawl |
| Pickup code shown when the child is checked in | ✅ | e2e 07 |
| Champ Buddy consent switch | ✅ | e2e 10 |
| Another parent can't see my child | ✅ | e2e 08 |

### Kids (Champ Town)
| Feature | Status | Evidence |
|---|---|---|
| Home, daily visit points, Fire Streak, levels, Welcome trophy | ✅ | e2e 05, crawl |
| Little Champs mode (by class age band) | ✅ | e2e 05 |
| My Champ avatar, locked extras, Champ Card | ✅ | e2e 05, crawl |
| Hall of Champs (own club only, first names, new kids hidden) | ✅ | e2e 05 |
| Trophies | ✅ | e2e 05, crawl |
| My Class, hand in work | ✅ | e2e 06, crawl |
| Messages | ✅ | e2e 06, crawl |
| Events | ✅ | crawl |
| **All 6 Arena games** load and play, points capped once a day | ✅ | e2e 09 |
| Road to Champ Training Ground (server-checked answers) | ✅ | e2e 09 |
| Faith Quest, private journal, Champ collection | ✅ | e2e 10 |
| My Stuff upload, checked by a grown-up first | ✅ | e2e 10 |
| Reading plans, certificate at the end | ✅ | e2e 11 |
| Record-a-verse | ✅ | e2e 11 |
| Talk to Someone | ✅ | e2e 06 |
| **Champ Buddy (AI)** | ⚠️ | Works against the stand-in (Pro plan, club switch and parent consent; names never sent; distress never reaches the AI). **Production has no `ANTHROPIC_API_KEY`**, so it says it is unavailable |
| Alerts and notifications | ✅ | crawl |

### Public site
| Feature | Status | Evidence |
|---|---|---|
| Landing, Features, Safety, Pricing, Privacy, Terms load; no sideways scroll; images load | ✅ | e2e 00, crawl |
| Footer links, Sign in and Start your club buttons | ✅ | e2e 00 |
| Landing on phones | ⚠️ | 5 visual issues, handed to Claude Design (`docs/DESIGN-BRIEF-ALL-PAGES.md`) |
| Privacy and Terms | ⚠️ | Marked as drafts pending legal review |

---

## 3. Fixed today (on branch `claude/zen-volta-9lkjsc`)

1. **Forgot password: built from scratch.** Before this, an adult who forgot their password had no way back in.
   - A "Forgot your password?" link on Sign in.
   - `/forgot-password` sends a reset link. It gives the same reply whether or not the email exists, so nobody can fish for accounts.
   - `/reset-password` sets a new password; the two entries must match and it needs at least 10 characters.
   - Kid accounts are excluded: kids reset through their teacher.
   - 3 new end-to-end tests: full reset through email, no account probing, expired link refused.
2. **Email links now work on any device.** Previously a confirmation or reset link only worked in the same browser that asked for it. A parent signing up on a laptop and opening the email on their phone got a dead link. The link handler now also accepts Supabase's device-independent link format.
   - **Wiring step:** the email templates must use it; see 4.2.
3. **A failed email link now explains itself.** Before, it dropped you on Sign in with no message.
4. **The "Pay online" dead end is gone.** With no Flutterwave keys set (production today), clicking **Pay online** showed "The payment page is not available right now".
   - Now the plans and prices still show, with "Card payments are coming soon. Pay by bank transfer below…".
   - When the keys are added, the Pay online button comes back on its own.

---

## 4. Wiring checklist before clients pay (in order)

### 4.1 Payments (must do)
- [ ] **Bank transfer:** works now. Production bank details are set: Sterling Bank, account name Joshua Olusanu. Confirm those are the account you want clients paying into.
- [ ] Flutterwave account in live mode. In Vercel, set `FLUTTERWAVE_SECRET_KEY` and `FLUTTERWAVE_WEBHOOK_HASH`.
- [ ] In the Flutterwave dashboard, set the webhook URL to `https://<your domain>/api/webhooks/flutterwave` with the same hash.
- [ ] Do **one real ₦ test payment** with a Flutterwave test key on a preview deployment, before switching to live. The integration has only been tested against a stand-in; endpoint paths were taken from Flutterwave's docs (`docs/PAYMENTS.md`).
- [ ] Decide on GBP, USD, EUR and CAD: add real prices in `plan_prices`, or show NGN only on the landing for now.

### 4.2 Email (must do: without it, nobody can confirm sign-up or reset a password)
- [ ] Supabase's built-in email only sends a handful per hour and is meant for testing. In Supabase → Authentication → SMTP, use **Resend**: the `zebraish.com` domain is already verified there. Or verify a Champzz domain in Resend and send from it.
- [ ] Supabase → Authentication → URL configuration:
  - **Site URL** = your domain.
  - Add `https://<domain>/auth/callback` to the redirect allow-list.
- [ ] Supabase → Authentication → Email templates. Set the links so they work on any device:
  - Confirm signup: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup&next=/onboarding`
  - Reset password: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
- [ ] Make sure "Confirm email" is **on**.
- [ ] Turn on leaked-password protection (Supabase flagged it as off).

### 4.3 Domain
- [ ] Buy the domain and add it in Vercel.
- [ ] Set `APP_URL=https://<domain>` and `KID_EMAIL_DOMAIN=kids.<domain>` in Vercel production. Today they fall back to `champzz.vercel.app`, which works but changes later.

### 4.4 Champ Buddy (optional, Pro plan feature)
- [ ] Set `ANTHROPIC_API_KEY` in Vercel. Until then, Champ Buddy shows as unavailable, which is safe.

### 4.5 Housekeeping
- [ ] Optional: set `KID_AUTH_SECRET` (otherwise derived from the Supabase key).
- [ ] Production has 0 clubs and 1 Super Admin (you). Before the first client, do one full real run on the live site: create account, create club, Mark as paid, add a teacher, add a kid, kid signs in.
- [ ] Privacy and Terms are drafts. Get a legal read before taking money.

---

## 5. Small notes (not blockers)

- An invalid team invite link still shows "You have been invited" until the person signs in; **Accept invite** then refuses it. This is on purpose (it doesn't reveal which links are real), but the wording could be softer.
- 3 lint warnings in `landing-v2.jsx` (unused variables). Harmless.
- Supabase's security adviser lists 53 database functions as "callable by signed-in users". That's by design: each one checks the caller's role inside, and the pgTAP suite proves it (cross-club calls refused).

---

## 6. How to re-run everything

```bash
npx supabase start -x studio,logflare,vector,imgproxy,edge-runtime,realtime,postgres-meta,supavisor
npx supabase test db
npm run build && npx playwright test --trace off
```
Note: keep **storage** and **mailpit** running. The README's start command leaves them out, and then the upload tests and the password reset test fail.

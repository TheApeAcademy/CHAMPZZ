# Gate 2: foundation report (2026-11-25)

Builder's report. Not a self-certification: Banks runs the independent review.

## What was built

- **Stack:** Next.js 16.4.6 (App Router), React 19.3, TypeScript 5.9.3 strict, Tailwind 4.3, Zod 4.6, `@supabase/ssr` 0.12.7, `@supabase/supabase-js` 2.119.2. Local Supabase (Postgres 17) via CLI 3.4.0.
- **Schema** (`supabase/migrations/`): organizations, branding, plans / prices / features (editable rows, NGN prices seeded from Banks's table), currency settings for NGN, GBP, USD, EUR, CAD (tax off), subscriptions with price lock fields, checkout sessions, payments, billing events, join codes, memberships, platform admins, kids, kid credentials, guardians, consents, registration events, kid login attempts, audit log, classes, class teachers.
- **RLS** on every table, with helpers in a private `app` schema. Every client-callable function is granted on purpose, and server-only entry points (`svc_*`) run as the service role only.
- **Org lifecycle:** pending, active, grace (7 days), read_only, suspended. The onboarding wizard works while pending. A daily `pg_cron` job moves orgs along. No data is deleted on expiry.
- **Payments:**
  - Flutterwave hosted checkout with a redirect return.
  - A webhook (verif-hash check, idempotent, re-verified with Flutterwave, amount checked).
  - Super Admin **Mark as paid** for offline payments, recording who approved it and when.
  - All three go through one database function.
- **Join codes:** one active per org, regenerate kills the old one, 31^8 space from a cryptographic source.
- **Registration (Clubhouse model):**
  - A verified parent plus the join code adds a kid, who is active at once but "new" until a teacher confirms.
  - Optional approval mode per org.
  - Per-parent cap of 6 kids and an automatic pause on a sign-up spike.
  - Kid limit enforced in the database under a row lock.
  - Consent recorded for every kid.
- **Kid login:**
  - Generated username plus a 4-picture PIN (12 pictures), bcrypt hashed.
  - 5 wrong PINs locks the kid for 15 minutes, doubling up to 24 hours.
  - IP throttle, and unknown usernames take the same time as wrong PINs.
  - The kid's real auth password is a server-derived 256-bit value.
  - Teachers reset PINs (logged).
- **Screens** (design D, mobile first):
  - Landing page with pricing, ending in "Built by Zebraish".
  - Sign up, sign in and sign out.
  - Onboarding.
  - Org workspace: status, plan purchase, join code, classes, joining settings, kids with Confirm, Approve and Reset PIN.
  - Super Admin console: all orgs, Mark as paid, suspend or lift.
  - Clubhouse page with the registration form.
  - Parent page.
  - Kid sign-in and kid home in Champ and Little Champs modes. Feature tiles say "Coming soon".

## Tests that actually ran (local stack, 2026-11-25)

**Database, pgTAP:** `npx supabase test db`, 269 passed, 0 failed.

- Structure:
  - RLS is on for every table, and every tenant table has `organization_id`.
  - Only 3 tables accept direct client inserts.
  - anon can call exactly one function.
  - The signed-in function list is pinned, and service-only functions are unreachable.
- Isolation matrix: for Org Admin, Teacher, Parent and Kid in org A, against every tenant table, reads, updates and deletes of org B rows all came back as 0 or denied. That is about 200 checks, generated from the catalogue so new tables are covered automatically.
- Cross-org function calls refused. Positive controls pass: each role sees exactly what it should.
- Lifecycle, payment idempotency, kid limit, approval mode, PIN lockout and reset, grace and read_only, suspension, audit log.

**End to end, Playwright 1.63 (Chromium, Pixel 7 viewport):** `npx playwright test`, 20 passed, 0 failed. It passed on three consecutive full runs from a fresh database.

| Spec | What it proves |
|---|---|
| 01 org lifecycle | Sign up -> pending -> active by online payment with the redirect. By webhook alone: forged hash refused (401), applied once, duplicate ignored. A mismatched amount does not activate. Mark as paid records the approver and time. The console is 404 for non-admins. |
| 02 registration | Join code registration, "new" then confirmed. A forwarded code alone shows nothing and asks for sign-in. Blocked at the cap with the Upgrade prompt shown. **8 simultaneous registrations against a cap of 3: exactly 3 succeed.** A regenerated code kills the old one. Approval mode works. |
| 03 auth | Sign in and out for Super Admin, Org Admin, Teacher, Parent and Kid (picture PIN). Wrong password refused. Kid locked after 5 wrong PINs, and a teacher reset restores access. |
| 04 isolation | Org A Org Admin, Teacher, Parent and Kid cannot reach org B pages or data. A kid's username does not work in another org. |
| 05 expiry | Active -> grace -> read_only, data kept, writes blocked. |

Also clean: `tsc --noEmit`, `eslint .`, `next build`.

## Not tested or not built yet (honest list)

- **Real Flutterwave:** tested only against a local fake that mimics the documented shapes. Endpoint paths, GBP/EUR/CAD support and the v4 webhook scheme are unconfirmed (see `docs/PAYMENTS.md`). Needs Banks's test keys.
- **Email verification for parents:** the code requires a confirmed email, but the local stack auto-confirms. In production, Supabase email confirmation must be on with a real sender (domain pending). Phone OTP is not built.
- **Teacher invites:** teachers in tests are created as fixtures. The invite-by-email flow belongs to the onboarding wizard phase.
- **Grace reminders** (day 0, 3, 6) are not sent yet. They need the email/SMS provider.
- **Super Admin UI** for editing plans, price locks, impersonation and the audit log: the schema and RLS support them, but there are no screens yet.
- **Games and core features:** not in this phase, so not tested.
- **Production:** nothing deployed. No Supabase or Vercel project exists yet.

## Decisions made during the build (worth a look in review)

- **`cacheComponents` is off.** Every tenant page renders per request; no rendered output is cached across users.
- **TypeScript 5.9.3, not 7.0.** Next 16.4's own template pins TS 5.
- **Playwright 1.63.0** to match the browser installed in this environment.
- **`svc_*` wrappers in `public`.** The private `app` schema is not exposed by the API, so the server reaches its functions through wrappers that only the service role can execute (pinned by a test).
- **Supabase's default grants overrode our own.** The first test run found that anon could execute every function despite our default-deny setting. Fixed with an explicit revoke-all and re-grant, and pinned by tests.

## Before any deploy

1. Banks confirms the Supabase account and region, and the Vercel team and project names.
2. Domain bought. Set `APP_URL`, `KID_EMAIL_DOMAIN`, and the Supabase Auth site URL and email sender.
3. Secrets set in Vercel and Supabase only: `SUPABASE_SECRET_KEY`, `KID_AUTH_SECRET`, `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_WEBHOOK_HASH`. `ENABLE_TEST_HOOKS` stays `0`.
4. Banks is added to `platform_admins` with a one-off script against the confirmed project.

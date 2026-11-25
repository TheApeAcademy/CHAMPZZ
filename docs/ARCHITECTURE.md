# Champzz Architecture (proposal)

Status: **Gate 1 answers folded in (2026-11-25), see section 15**. Nothing here is built yet. Read with `docs/AUDIT.md`, which explains why each choice fixes something CCT got wrong.

---

## 1. Stack

Versions checked against the npm registry on 2026-11-24. They are re-checked on the day the foundation is scaffolded, and pinned exactly in `package.json`.

| Layer | Choice | Version seen |
|---|---|---|
| Framework | Next.js App Router, React Server Components, Server Actions | `next` 16.4.6, `react` 19.3.1 |
| Language | TypeScript, `strict: true`, `noUncheckedIndexedAccess: true` | `typescript` 7.0.2 latest. TS 7 is the new native compiler; if Next or ESLint tooling does not support it on the day, pin the newest 6.x and note it. |
| Database / Auth / Storage | Supabase (Postgres, Auth, Storage, pg_cron) | `@supabase/supabase-js` 2.119.2, `@supabase/ssr` 0.12.7, CLI `supabase` 3.4.0 |
| Validation | Zod at every server boundary | `zod` 4.6.7 |
| Styling | Tailwind CSS with design tokens as CSS variables (needed for per-org white-labelling) | `tailwindcss` 4.3.5 |
| Tests | Playwright (E2E), pgTAP via `supabase test db` (RLS and SQL), Vitest (pure logic) | `@playwright/test` 1.65.1 |
| Hosting | Vercel (app), Supabase (data) | targets to be confirmed by Banks |

Tailwind stays: the audit found no reason to leave it, and CCT's real styling problem was running three CSS systems at once. Champzz uses one: Tailwind plus a small token layer.

---

## 2. Repository layout

```
champzz/
  src/
    app/                          Next.js routes only. Thin: compose features, no business logic.
      (marketing)/                champzz public site, pricing, legal pages
      c/[org]/                    the org's Clubhouse: public page, posts, events, Join
      (auth)/                     sign in, sign up, invite accept, password reset
      console/                    Super Admin console (platform owner)
      o/[org]/                    Org Admin + Teacher workspace
      p/                          Parent dashboard (across all orgs a parent belongs to)
      k/[org]/                    Kids experience (Kids Village, games, lessons)
      api/webhooks/[provider]/    payment webhooks (route handlers, raw body)
      api/cron/                   protected endpoints only if pg_cron cannot do the job
    features/                     one folder per feature module
      <feature>/
        components/               UI for that feature
        server/                   server actions and queries ("use server" / server-only)
        schema.ts                 Zod schemas shared by form and action
        types.ts
    components/ui/                design system primitives (buttons, inputs, dialogs, tables)
    games/
      framework/                  shell, scoring, XP hooks, sound, input, accessibility
      verse-scramble/ memory-match/ who-am-i/ word-search/ jigsaw/ ark-catch/
    lib/
      supabase/
        server.ts                 per-request client from cookies (@supabase/ssr)
        browser.ts                browser client, publishable key only
        admin.ts                  service-role client, imports "server-only"
      billing/
        provider.ts               BillingProvider interface
        flutterwave.ts            Flutterwave implementation
        manual.ts                 offline payment (Mark as paid)
      entitlements/               plan feature flags and limits
      auth/                       role guards, kid login
      env.ts                      Zod-validated environment, split server / public
    types/database.ts             generated from the schema, never hand edited
  supabase/
    migrations/                   every schema change, in order, in git
    tests/                        pgTAP tests (RLS isolation matrix lives here)
    seed.sql                      local and preview seed: two fake orgs, fake people only
    config.toml
  tests/e2e/                      Playwright specs
  docs/
```

Rules that keep it clean:

- `app/` files only fetch and compose. Business rules live in `features/*/server` and in SQL.
- The service-role client lives in one file that imports `server-only`. A build fails if any client component imports it. CI also greps the built client bundle for the service-role key name.
- Database types are generated (`supabase gen types`) and checked in; CI fails if they are stale.
- Every server action starts with: parse input with Zod, resolve the caller and org, check role and entitlement, then call the DB. One helper (`orgAction()`) enforces that order so no action can skip a step.

---

## 3. Multi-tenancy

### 3.1 Tenant addressing

Path based for launch: `/c/{slug}` for the org's Clubhouse, `/o/{slug}` for staff, `/k/{slug}` for kids. No wildcard DNS or per-org certificates needed. Custom subdomains (`{slug}.champzz...`) can be added later for the Network plan without changing the data model, because the org is always resolved to an `organization_id` server-side and never trusted from the client.

### 3.2 The rules

1. Every tenant-owned table has `organization_id uuid not null references organizations(id)`, indexed.
2. RLS is enabled on **every** table in `public`, no exceptions. A pgTAP test fails the build if any table lacks RLS or any tenant table lacks `organization_id`.
3. Child tables also carry `organization_id` (denormalised on purpose) so every policy is a cheap equality check, and a composite foreign key `(organization_id, parent_id)` stops a row from pointing at another org's parent row.
4. Authorisation helpers live in a private schema `app` that PostgREST does not expose:

| Helper | Meaning |
|---|---|
| `app.uid()` | `auth.uid()` |
| `app.is_platform_admin()` | caller is in `platform_admins` |
| `app.has_org_role(org, roles[])` | caller holds an active membership in `org` with one of `roles` |
| `app.is_guardian_of(kid)` | caller is a verified guardian of `kid` |
| `app.teaches_kid(kid)` | caller teaches a class `kid` is in |
| `app.org_is_writable(org)` | org status allows writes (active or grace) |
| `app.org_has_feature(org, key)` | plan entitlement check |

All are `stable security definer set search_path = ''`, and policies call them as `(select app.fn(...))` so Postgres evaluates them once per query, not once per row.

5. Write policies always include `app.org_is_writable(organization_id)`. That one check is how `pending`, `read_only` and `suspended` are enforced in the database, not just hidden in the UI.
6. Clients never write role, status, plan, XP or limit columns. Those change only through SECURITY DEFINER functions with explicit checks, or the service role on the server. EXECUTE on every function is revoked from `public` by default (a migration sets `alter default privileges ... revoke execute ... from public`), then granted deliberately. This closes the exact trap CCT fell into twice.

### 3.3 Proving isolation

`supabase/tests/rls_isolation.sql` seeds two orgs (A and B) with one user of every role in each, then for **every** tenant table (enumerated from `information_schema`, so a new table is tested automatically) and **every** role in A asserts:

- zero rows of B are visible,
- insert, update and delete against B rows fail or affect zero rows,
- RPCs given a B id return nothing or raise.

Playwright repeats the headline cases end to end through the real app (org A teacher opens an org B URL, gets a 404, never data).

---

## 4. Identity, roles and sign-in

### 4.1 Model

- `auth.users` is the identity. `profiles` holds adult display data only, **no role column**.
- `memberships (user_id, organization_id, role, status)` with `role in ('org_admin','teacher','parent')`. One person can be a parent in one org and a teacher in another.
- `platform_admins (user_id)` for Super Admin. No API path can insert into it. Banks is added by a one-off script run with the service role against a confirmed project.
- Kids are rows in `kids`, each linked to its own auth user (needed so RLS can use `auth.uid()` for kid sessions). Kid credentials are in a separate table no client can read.

### 4.2 Adults

Email + password and magic link through Supabase Auth, session in cookies via `@supabase/ssr` (fixes S9). Teachers join by invite from their Org Admin (email link, token single use, expires). An optional "request to join" exists per org, off by default.

### 4.3 Kids: username + picture PIN

- **Username**: generated, friendly and unique within the org (e.g. `brave-lion-27`), shown on a printable login card. Never the child's real name. Devices can remember it.
- **Picture PIN**: 4 taps on a grid of 12 pictures. 20,736 combinations, which is enough only because guessing is throttled hard.
- **Storage**: `kid_credentials.pin_hash` with bcrypt via pgcrypto. No client role can select that table.
- **Throttling** (all in one SQL function so it is atomic): 5 wrong tries locks that kid for 15 minutes, doubling on repeat; separate caps per IP and per org per minute; every failure and lockout is logged. A teacher or Org Admin can unlock and reset, logged in `audit_log`.
- **Session mechanics**: the browser posts `{org, username, pin}` to a server route. The server validates with Zod, calls `app.kid_verify_pin()` with the service role, and on success signs the kid's auth user in server-side. That auth user's real password is `HMAC(KID_AUTH_SECRET, user_id)`, a 256-bit value no human ever sees, so the Supabase Auth endpoint itself cannot be brute-forced around the PIN throttle. Kid sessions are cookie-based and short-lived on shared devices (setting per org).

This replaces CCT's plaintext name-derived passcodes (S1) completely.

### 4.4 Impersonate for support

Super Admin opens an org in "support view": read-only, behind a red banner, backed by RLS (`app.is_platform_admin()` grants read). Switching to "act as" for a write requires a typed reason and writes an `audit_log` row (who, which org, when, why, start and end). No token minting for other users.

---

## 5. Data model

Grouped by area. All tenant tables carry `organization_id`, `created_at`, `updated_at`. Full DDL is written in the foundation phase as migrations.

**Platform and billing**
- `organizations` (slug, name, kind `church|club|school|other`, status, country, timezone, locale, currency, faith_mode, created_by)
- `org_branding` (logo_path, primary_color, accent_color, public_page fields)
- `plans` (code, name, kid_limit, is_custom, active, sort) editable by Super Admin
- `plan_prices` (plan_id, currency, interval `month|year`, amount_minor, active)
- `plan_features` (plan_id, feature_key, enabled, limit_value)
- `org_overrides` (org_id, feature_key or kid_limit, value, reason, set_by) for custom and Network deals
- `subscriptions` (org_id, plan_id, interval, status, current_period_start, current_period_end, grace_until, provider, provider_customer_ref, provider_subscription_ref, price_lock_amount_minor, price_lock_currency, price_lock_until)
- `payments` (org_id, subscription_id, provider `flutterwave|stripe|manual`, method `card|bank_transfer|cash|other`, provider_ref unique, amount_minor, currency, status, period_end_granted, approved_by, approved_at, note)
- `billing_events` (provider, provider_event_id, payload, received_at, processed_at, error) with `unique (provider, provider_event_id)` for idempotency
- `message_credit_ledger` (org_id, delta, reason, ref) and a balance view
- `join_codes` (org_id, code, active, created_by, revoked_at). One active per org; regenerating revokes the old one in the same transaction.
- `audit_log` (org_id nullable, actor_id, action, target_type, target_id, details, ip, at). Insert-only, no update or delete for anyone.
- `platform_admins`

**People**
- `profiles`, `memberships`, `invitations`
- `kids` (first_name, last_initial or last_name per org setting, username, birth_year_month optional, status `pending|active|archived`, approved_by, approved_at, avatar_config, level)
- `kid_credentials` (service role only)
- `kid_sensitive` (medical_notes, allergies, pickup_notes). Readable only by Org Admin and roles the org grants, every read logged.
- `guardians` (kid_id, user_id, relationship, verified_at, verified_by)
- `consents` (kid_id, guardian_user_id, policy_version, scopes jsonb e.g. photos / ai / voice_recording / messaging, granted_at, withdrawn_at, ip)
- `registration_requests` (org_id, submitted_by, kid fields, status, decided_by, decided_at, reason)

**Classes and attendance**
- `classes`, `class_teachers`, `class_kids`
- `sessions` (a class meeting on a date, in the org's timezone)
- `attendance` (session_id, kid_id, status)
- `checkins` (session_id, kid_id, checked_in_at, checked_in_by, pickup_code_hash, checked_out_at, checked_out_by, collected_by_name)

**Learning content (data, not code)**
- `content_packs` (org_id nullable = platform default, kind, faith boolean, locale, published)
- `lessons`, `lesson_steps` (step jsonb validated by Zod per step type)
- `reading_plans`, `reading_plan_days`
- `verses` (reference, text, translation), `characters`, `scenes`, `quiz_questions`
- `game_items` (game key, pack_id, payload jsonb validated by the game's Zod schema)
- `media_assets` (storage path, mime, size, licence, alt text, uploaded_by)

**Class life and safeguarding**
- `lectures`, `assignments`, `submissions`, `events`
- `notifications` (trigger-written only, as in CCT)
- `concerns` (CCT's Ears for You), `concern_replies`, `concern_notes`, `concern_access_log`. Anonymity enforced by policy and masking view, as in CCT.
- `ai_messages` (if AI companion is enabled for the org)
- `verse_recordings` (storage path, status, stars_awarded, reviewed_by)

**Engagement**
- `xp_events` (kid_id, source, source_id, amount) with `unique (kid_id, source, source_id)`, so replays never double count. The only way XP changes. Amounts come from `xp_rules` (platform defaults, org overridable), never from the client.
- `activity_days` (kid_id, day) unique, day computed in the org's timezone. Streaks are a gaps-and-islands query over this, maintained incrementally in `kid_stats`.
- `kid_stats` (xp_total, level, streak_current, streak_best, last_active_day), trigger-maintained, so leaderboards read one indexed table.
- `badges` (org_id nullable, code, criteria jsonb, starts_at, ends_at for seasonal), `kid_badges`
- `certificates` (kid_id, kind, ref, issued_at, serial)

**Schema-ready only (not built)**
- `cosmetic_items`, `kid_cosmetics`, `wishlists`, `purchases` (parent buyer only, PIN-confirmed, optional `org_revenue_share_bps`), `sponsorships`.

---

## 6. Organization lifecycle and billing

### 6.1 State machine

```
pending --payment--> active --period ends unpaid--> grace (7 days) --> read_only
   any state --Super Admin--> suspended --Super Admin--> previous state
   grace / read_only --payment--> active
```

- **pending**: Org Admin can finish the onboarding wizard (logo, colours, classes, Clubhouse page, teacher invites are drafted). No teacher, parent or kid access until active. Invites are queued and sent on activation.
- **active / grace**: everything the plan allows. Grace shows a banner and sends reminders (day 0, 3, 6).
- **read_only**: everyone can read and export, nobody can write. Data is never deleted on expiry. Retention after that is in 6.4.
- **suspended**: only Super Admin and Org Admin billing pages.

Transitions happen in exactly two SQL functions:
- `app.apply_payment(org, plan, interval, period_end, provider, ref, approved_by)`: records the payment, extends the period, sets `active`, issues a join code if none exists, applies the kid limit. Called by the webhook handler and by Mark as paid, so both paths give identical results.
- `app.lifecycle_tick()`: run daily by `pg_cron`, moves `active -> grace -> read_only` and queues reminders.

### 6.2 Provider-agnostic billing

```ts
interface BillingProvider {
  id: 'flutterwave' | 'stripe' | 'manual'
  createCheckout(input: CheckoutInput): Promise<{ url: string; reference: string }>
  verifyWebhook(rawBody: string, headers: Headers): Promise<VerifiedEvent | null>
  fetchTransaction(reference: string): Promise<ProviderTransaction>
}
```

Flutterwave webhook route (`/api/webhooks/flutterwave`):
1. Read the raw body, verify the webhook signature header against the secret hash configured in the Flutterwave dashboard, with a constant-time compare. Reject otherwise.
2. Insert into `billing_events`; on unique conflict return 200 and stop (idempotent).
3. Re-fetch the transaction from Flutterwave's verify endpoint and check status, amount, currency and our `tx_ref` match what we created. Never trust the webhook body alone.
4. Call `app.apply_payment` in one transaction; mark the event processed.

The exact Flutterwave header name, signing scheme, API version and verify endpoint are confirmed against Flutterwave's current docs at build time, not taken from memory. Keys live only in environment variables (Vercel and Supabase secrets), never in the repo or in chat. Tests use Flutterwave test mode keys plus locally signed fake events.

Stripe later is a second `BillingProvider`; nothing else changes.

### 6.3 Plans, price locks, annual, credits

- Plans and prices are rows. The proposed seed matches the brief (Starter 50 kids, Basic 150, Pro 400, Network custom; NGN 20,000 / 45,000 / 85,000 a month). Super Admin edits them in the console.
- **Founding price lock**: `subscriptions.price_lock_amount_minor` + `price_lock_until`. Checkout uses the lock while it is valid, whatever the current plan price.
- **Annual**: a `plan_prices` row with `interval = 'year'`.
- **Multi-currency** (NGN, GBP, USD, EUR, CAD): each plan has a hand-set price per currency in `plan_prices`, not a live exchange-rate conversion, so a UK church sees a clean price like a round pound figure and Banks controls every price. An org picks its billing currency at signup (default from its country) and its subscription stays in that currency. Amounts are stored in minor units (kobo, pence, cents). Flutterwave handles collection; which of the five currencies it can settle for Banks's account is confirmed against Flutterwave's docs and dashboard at build time. Final multi-currency pricing is a later discussion; the schema supports it from day one.
- **VAT**: prices are shown and charged without VAT for now. The schema keeps a `tax_rate` and `tax_inclusive` field per currency (both off) so tax can be switched on later without a migration.
- **Messaging**: usage-based credits in `message_credit_ledger`. A send debits atomically and fails cleanly at zero. Never unlimited.
- **Feature flags per plan**: `plan_features` + `org_overrides`, read through `app.org_has_feature()` in SQL and `can(org, 'feature')` in server code. UI hides locked features and shows an upgrade prompt; the DB enforces.

### 6.4 Retention after an org stops paying

Nigeria's NDPA and GDPR both say personal data should not be kept longer than needed, so "keep kids' data forever" is not the safe default. Proposed schedule, all days counted from the day the org enters `read_only`:

| Day | What happens |
|---|---|
| 0 to 90 | Read-only. Everyone can still sign in, view and export. Paying restores everything instantly. |
| 90 | Archived. Only the Org Admin can sign in, to pay or export. Kids, parents and teachers see "this club is paused". Org Admin is emailed an export link. |
| 335 | Final notice by email: deletion in 30 days unless they pay or ask to keep it. |
| 365 | Kids' personal data is deleted (names, credentials, consents, recordings, sensitive fields). Anonymised totals are kept for analytics. Payment and audit records are kept as the law requires for financial records. |

An org can ask for export or deletion at any time (section 11). Super Admin can extend any deadline with a logged reason. The numbers are settings on the platform, not hardcoded.

---

## 7. Clubhouse, join codes, registration and the kid limit

### 7.1 The Clubhouse (each org's own page)

Like a subreddit, every org gets its own page inside Champzz: its **Clubhouse** at `/c/{slug}`. Branded with the org's logo and colours, it holds the org's posts, announcements, events and the "Join" button. It is where families land from a shared link or a QR code on the church noticeboard.

What a Clubhouse never shows, signed in or not: any kid's name, photo, profile or scores. Posts are written by Org Admins and teachers only, and an org can make the whole Clubhouse members-only.

### 7.2 Registration: parent-vouched, no approval queue by default

Banks's call: Org Admins must not have to approve kids one by one. The rule from the brief still holds: a forwarded code alone must not let a stranger in. The design meets both:

1. A parent opens the Clubhouse, taps Join, enters the org's join code, and creates or signs in to a parent account **with a verified phone or email (one-time code)**. An unverified account cannot register kids.
2. The parent adds their child (first name, last initial, class or age group) and gives consent. The kid is **active immediately**: they get a username and picture PIN, and count against the kid limit. No admin click needed.
3. New kids start as **"new"** for safety. They can play, learn and earn XP straight away, but their first name stays hidden from leaderboards and Friends, and messaging is off, until a teacher confirms them. Confirming is not a separate chore: it happens naturally the first time the kid is checked in or marked present at a real session (one tap the teacher is already doing). Orgs can switch this off.
4. The Org Admin gets a **daily digest** ("6 new kids joined this week"), not a notification per kid, and can remove a kid, block a parent account, pause joining, or regenerate the join code (old code dies at once) from one screen.
5. Guard rails against a leaked code: each parent account can register at most 6 kids per org without review, registrations per code are rate-limited per hour, and a spike (for example 20 sign-ups in an hour) pauses joining automatically and alerts the Org Admin.
6. **Approval mode** is one setting per org. Orgs that want to handpick every kid (some schools and clubs will) switch it on, and step 2 becomes a request in a queue.
7. The Org Admin can also add a kid directly (walk-in, no parent account yet), recording paper consent.

The code never reveals any child's name (fixes S5). Every registration, removal and code change goes into `audit_log`.

### 7.3 Kid limit

**Kid limit in the database:**

```sql
-- inside app.activate_kid(...), called by both parent registration and approval mode
select kid_limit into v_limit from app.org_limits where org_id = v_org;
perform 1 from organizations where id = v_org for update;   -- serialises approvals per org
select count(*) into v_active from kids where organization_id = v_org and status = 'active';
if v_active >= v_limit then
  raise exception using errcode = 'P0001', message = 'kid_limit_reached';
end if;
```

The `for update` lock on the org row makes simultaneous registrations queue, so the cap can never be exceeded. At the cap, parents see "This club is full right now, ask the club leader", and the Org Admin sees "Upgrade your plan". A Playwright test fires parallel registrations at the cap and asserts exactly the allowed number succeed.

---

## 8. Faith mode

- `organizations.faith_mode` (on for churches by default, off for clubs).
- Every content pack, badge, game item and feature has a `faith` attribute. Queries filter by the org's mode in SQL, and feature keys like `reading_plans` require faith mode.
- The six games are built so the *mechanic* is neutral and the *content pack* carries the theme. Verse Scramble with a secular pack becomes "Quote Scramble"; Who Am I? uses famous scientists or animals; Ark Catch has a non-Bible skin. Same code.

---

## 9. Game framework

- `GameShell`: loading, pause, sound toggle (off by default on shared screens), reduced-motion support, large touch targets, keyboard play, screen-reader labels, end screen.
- `useGameSession`: start, score, finish. On finish it posts `{game, content_item, score, duration, client_nonce}` to a server action. The server recomputes or bounds the XP using `xp_rules` and writes one `xp_events` row keyed by the session, so a replayed request cannot double count and a client cannot claim arbitrary XP.
- Content comes from `game_items`, validated by each game's Zod schema, so Banks and orgs add items in the CMS with no code.
- Each game is its own lazy chunk (`next/dynamic`), so a kid opening one game downloads only that game.
- Pointer events everywhere (one code path for touch and mouse), no game engine, React plus CSS transforms and `requestAnimationFrame` where needed (Ark Catch).

---

## 10. Performance on slow mobile networks

- Server Components by default, client components only for interaction. Target under 150 KB gzipped JS on the kids home route, checked in CI with a bundle budget.
- Two font families at most, via `next/font`, subset.
- `next/image` with AVIF / WebP, explicit sizes, lazy below the fold. Kids Village art as compressed WebP sprites or SVG.
- Games, media, recorder and charts lazy-loaded.
- Offline: a service worker caches the kids shell, the quiz show and game assets for offline play, with results queued and synced (CCT's best idea, kept). Admin screens are online-only.
- Data saver: no autoplay video, audio fetched on demand.

---

## 11. Privacy and safety

- **Minimum data**: first name and last initial by default; birth year and month only if the org needs it; no child email or phone.
- **Consent**: a `consents` row is required before a kid becomes active, versioned against the policy text. Separate scopes for photos, AI, voice recordings and messaging; withdrawable from the parent dashboard.
- **Sensitive fields** isolated in `kid_sensitive` with a narrower policy and read logging.
- **No public exposure**: no public route ever returns a kid's name, photo or profile. Leaderboards show first name + avatar only, scoped to class or org per setting.
- **Safeguarding**: CCT's Ears for You carried over as `concerns`, plus a designated safeguarding lead role per org, response-time reminders, and Super Admin escalation visibility only when the org opts in. Adult-to-child messaging is org-visible by default (no hidden one-to-one channels) and is a plan / org setting.
- **Export and deletion** per org (Org Admin request, Super Admin confirms, logged), and per kid on guardian request.
- Designed for NDPA (Nigeria), with GDPR and COPPA readiness: consent records, data processing register, retention settings, subprocessors list.

---

## 12. Environments and deployment

- Local: `supabase start` (Docker) + `next dev`. Seed has two fake orgs and fake people only.
- Preview: a separate Supabase project or branch per PR (to confirm with Banks), Vercel preview deployments.
- Production: one Supabase project and one Vercel project, **to be named and confirmed by Banks before any deploy**. No project refs, keys or domains are assumed anywhere in this repo; all come from environment variables validated by `src/lib/env.ts`.
- CI (GitHub Actions): typecheck, lint, unit, `supabase test db` (pgTAP including the RLS matrix), Playwright against a local stack, bundle budget, stale-types check, "service role in client bundle" check.

---

## 13. Testing and definition of done

Every phase ends with tests that actually run and pass. The required Playwright suite from the brief maps to:

| Spec | Covers |
|---|---|
| `org-lifecycle.spec.ts` | sign up -> pending -> active by Flutterwave test webhook; and by Mark as paid; grace and read_only via a time-shifted `lifecycle_tick` |
| `registration.spec.ts` | Clubhouse join with code and verified parent, kid active at once, "new" until first check-in, regenerate code (old code dead), approval mode on, parallel registrations at the cap, blocked at cap with upgrade prompt |
| `auth.spec.ts` | sign in and out for Super Admin, Org Admin, Teacher, Parent, Kid (picture PIN), plus lockout after 5 wrong PINs |
| `isolation.spec.ts` | org A users of every role cannot reach org B pages or data |
| `games.spec.ts` | each game loads, plays to completion with scripted input, and records XP once |

Plus pgTAP for every policy and SQL function. Results are reported plainly: what ran, what passed, what was not tested. The builder does not certify its own work; Banks runs an independent review at each gate.

---

## 14. Build order (unchanged from the brief)

1. Audit + architecture -> **Gate 1** (this document)
2. Design directions -> **D, Champ Mix, locked 2026-11-25** (see `docs/DESIGN.md`)
3. Foundation: schema, RLS + tests, auth (adults and kids), roles, org lifecycle, plans, payments, join codes -> **Gate 2**
4. Port and improve CCT features
5. SaaS essentials: onboarding wizard, Super Admin console, check-in, analytics, audit log, export
6. Game framework + six games
7. Delight features
8. Full test pass -> independent review -> deploy after targets are confirmed

---

## 15. Gate 1 decisions (Banks, 2026-11-25)

| # | Question | Decision |
|---|---|---|
| Q1 | Targets | New Supabase project and new Vercel project, both for Champzz only. Created at the foundation phase after Banks confirms the account, region and names. |
| Q2 | Registration | No approval queue by default. Clubhouse page per org, parent-vouched registration, "new" status cleared at first check-in, daily digest, optional approval mode. See 7.2. |
| Q3 | Pending orgs | Yes, the onboarding wizard works while pending. |
| Q4 | Domain | Not bought yet. Banks buys it after the Vercel project exists. Build uses env vars, so nothing waits on it. |
| Q5 | Payments | **Flutterwave**, not Paystack. Banks has the account. Keys go into env vars, never chat or git. No VAT for now. Five currencies supported in the schema: NGN, GBP, USD, EUR, CAD (see 6.3). |
| Q6 | Email and SMS | Banks is setting up both and will send the details. |
| Q7 | AI companion | Carries over: off by default, Pro plan and up, parental consent required. |
| Q8 | Art and audio | No licence for CCT assets. All new original art and audio. |
| Q9 | Studio credit | Yes, "Built by Zebraish" at the very end of the landing page. |
| Q10 | Retention | Banks asked for a recommendation. See 6.4 (90 days read-only, archive, deletion at 365 days with notices). |
| Q11 | Quiz show | Original format, champion themed. Name to settle; see `docs/NAMING.md`. |

### Still open

- Supabase account or organization, region, and project names for Champzz.
- Email and SMS provider details (Banks to send).
- Quiz show name (see `docs/NAMING.md`).
- Per-currency prices for GBP, USD, EUR, CAD (later discussion).

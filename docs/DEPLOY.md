# Deployment state

## Supabase (production database)

- Project: `champzz`, ref `aoalfbqwjzvkkoawikii`, region eu-west-1, org "TheApeAcademy's Org" (free plan). Created 2026-11-25 on Banks's instruction.
- To free the free-plan slot, the CCT demo project `mfm-childrens-ministry` was **paused** on Banks's instruction (it can be restored from the Supabase dashboard).
- Migrations applied through the Supabase connector: `foundation`, `service_wrappers`, `schedule_lifecycle`. The connector stores them under its own timestamps, not the file names in `supabase/migrations/`.
- Verified on 2026-11-25: fingerprints of every function body, policy, column, constraint, table grant, column grant and function grant match the local database that passed the test suites; RLS is on for every table; the daily lifecycle cron job is scheduled.
- Security advisor: only intended items (the pinned public and signed-in functions, and three deny-all tables).

## Still to do before the app goes live

1. **Vercel project** in team "TheApeAcademy's projects" (awaiting Banks's go-ahead).
2. **Secrets go straight into Vercel, never chat or git:** `SUPABASE_SECRET_KEY` (Supabase dashboard > Project Settings > API keys), `KID_AUTH_SECRET` (random, 32+ chars).
3. Non-secret env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `APP_URL`, `KID_EMAIL_DOMAIN`, `OFFLINE_BANK_NAME`, `OFFLINE_ACCOUNT_NUMBER`, `OFFLINE_ACCOUNT_NAME`. `ENABLE_TEST_HOOKS=0`.
4. **Supabase Auth:** set Site URL and redirect URLs to the Vercel URL; turn on email confirmation once an email sender exists.
5. Banks signs up on the live app, then gets added to `platform_admins` (one SQL insert on this project).
6. Flutterwave keys later. Until then orgs pay by bank transfer and Banks uses Mark as paid.

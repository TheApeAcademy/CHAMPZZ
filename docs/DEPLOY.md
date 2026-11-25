# Deployment state

## Supabase (production database)

- Project: `champzz`, ref `aoalfbqwjzvkkoawikii`, region eu-west-1, org "TheApeAcademy's Org" (free plan). Created 2026-11-25 on Banks's instruction.
- To free the free-plan slot, the CCT demo project `mfm-childrens-ministry` was **paused** on Banks's instruction (it can be restored from the Supabase dashboard).
- Migrations applied through the Supabase connector: `foundation`, `service_wrappers`, `schedule_lifecycle`. The connector stores them under its own timestamps, not the file names in `supabase/migrations/`.
- Verified on 2026-11-25: fingerprints of every function body, policy, column, constraint, table grant, column grant and function grant match the local database that passed the test suites; RLS is on for every table; the daily lifecycle cron job is scheduled.
- Security advisor: only intended items (the pinned public and signed-in functions, and three deny-all tables).

## Vercel

- Project `champzz` (`prj_k2VijS5DpBEZ2A8ky5x6c1k1EEDs`) in team "TheApeAcademy's projects", linked to GitHub `TheApeAcademy/CHAMPZZ`, functions in `dub1` (Dublin, next to the database), Node 22.
- Address: `https://champzz.vercel.app`. Vercel treats `claude/quirky-gauss-2q4f0s` as the production branch because it is the only branch in the repo, so every push to it deploys to that address.
- Vercel Authentication protects every non-custom-domain address, so only signed-in team members can open it for now.
- Set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `OFFLINE_BANK_NAME`, `OFFLINE_ACCOUNT_NUMBER`, `OFFLINE_ACCOUNT_NAME`, `ENABLE_TEST_HOOKS=0`.
- Derived automatically until a domain exists: `APP_URL` (the deployment address) and `KID_EMAIL_DOMAIN` (`kids.champzz.vercel.app`). `KID_AUTH_SECRET` is derived from `SUPABASE_SECRET_KEY` when unset.

## Still to do (Banks)

1. Vercel > champzz > Settings > Environment Variables: add `SUPABASE_SECRET_KEY` (type Sensitive, Production and Preview), copied from Supabase > champzz > Project Settings > API keys > secret key. Then redeploy. Until then every page errors on purpose: the app refuses to start without it.
2. Supabase > champzz > Authentication > URL Configuration: Site URL `https://champzz.vercel.app`, add redirect URL `https://champzz.vercel.app/auth/callback`.
3. Sign up on the live app, then send the email so it can be made Super Admin.
4. Flutterwave keys later (`FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_WEBHOOK_HASH`). Until then: bank transfer plus Mark as paid.
5. Before real families use it: buy the domain, attach it in Vercel, and turn on email confirmation with a proper sender.

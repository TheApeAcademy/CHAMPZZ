# Champzz

Multi-organization platform for kids' organizations and church children's ministries.

Docs: `docs/AUDIT.md` (CCT audit), `docs/ARCHITECTURE.md`, `docs/DESIGN.md` (locked design D), `docs/NAMING.md`, `docs/PAYMENTS.md`, `docs/GATE2.md` (latest phase report).

## Run locally

Needs Node 22 and Docker.

```bash
npm install
npx supabase start -x studio,logflare,vector,imgproxy,edge-runtime,realtime,postgres-meta,supavisor,storage-api,mailpit
cp .env.example .env.local   # fill from `npx supabase status` plus random secrets
npm run dev
```

## Tests

```bash
npx supabase test db          # pgTAP: RLS, isolation, lifecycle
npm run build && npx playwright test --trace off   # end to end (resets the local DB)
```

#!/usr/bin/env bash
# Builds .env.local for CI from the running local Supabase stack.
# Test-only values: the payment and AI providers are the local fake server.
set -euo pipefail
eval "$(npx supabase status -o env)"
PUB="${PUBLISHABLE_KEY:-${ANON_KEY:-}}"
SEC="${SECRET_KEY:-${SERVICE_ROLE_KEY:-}}"
if [ -z "${API_URL:-}" ] || [ -z "$PUB" ] || [ -z "$SEC" ]; then
  echo "Could not read Supabase URL or keys from 'supabase status'" >&2
  exit 1
fi
cat > .env.local <<ENV
NEXT_PUBLIC_SUPABASE_URL=${API_URL}
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${PUB}
SUPABASE_SECRET_KEY=${SEC}
APP_URL=http://localhost:3000
KID_AUTH_SECRET=$(openssl rand -hex 32)
KID_EMAIL_DOMAIN=kids.champzz.test
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-local-fake
FLUTTERWAVE_WEBHOOK_HASH=ci-$(openssl rand -hex 16)
FLUTTERWAVE_API_BASE=http://localhost:3999/v3
ANTHROPIC_API_KEY=sk-ant-ci-fake
CHAMPZZ_ANTHROPIC_BASE_URL=http://localhost:3999/anthropic
OFFLINE_BANK_NAME=Test Bank
OFFLINE_ACCOUNT_NUMBER=0123456789
OFFLINE_ACCOUNT_NAME=Champzz Test
ENABLE_TEST_HOOKS=1
ENV
echo "Wrote .env.local for CI"

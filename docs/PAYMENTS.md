# Payments (Flutterwave)

## What the code assumes, and where it came from

The sandbox could not open developer.flutterwave.com directly (network policy), so these points come from web search results quoting Flutterwave's official docs on 2026-11-25:

| Point | Source |
|---|---|
| Webhooks carry the secret hash we set in the dashboard in a `verif-hash` header. Compare it (timing-safe) and discard the request if missing or different. | [Webhooks](https://developer.flutterwave.com/docs/webhooks), [v3 Webhooks](https://developer.flutterwave.com/v3.0/docs/webhooks) |
| Never fulfil from the webhook body. Re-verify the transaction by id and check status, `tx_ref`, currency and amount (paid amount at least the expected amount). | [Transaction Verification](https://developer.flutterwave.com/docs/transaction-verification) |
| Hosted checkout: server-side request to the create-payment endpoint with our own unique `tx_ref` and a `redirect_url`. The response holds the payment link. After payment Flutterwave redirects with `status`, `tx_ref` and `transaction_id`. | [Flutterwave Standard (v3)](https://developer.flutterwave.com/v3.0/docs/flutterwave-standard-1) |
| Amounts are in major units (the verify sample shows `amount: 3000` with `currency: "NGN"`). We store minor units and convert at the boundary. | [Transaction Verification](https://developer.flutterwave.com/docs/transaction-verification) |

## Not confirmed yet (must check with Banks's test keys before go-live)

- Exact endpoint paths used in `src/lib/billing/flutterwave.ts`: `POST /v3/payments` and `GET /v3/transactions/{id}/verify`.
- Whether Banks's account can collect GBP, EUR and CAD (USD and NGN appear in samples).
- How the newer v4 API signs webhooks (the docs only say to set a signature in the dashboard). The code uses v3 behaviour.

## How it flows

1. Org Admin picks a plan on `/o/{slug}`. The server creates a `checkout_sessions` row (our record of the expected amount and currency, honouring any founding price lock) and asks Flutterwave for a hosted link.
2. Two paths can complete it, and the database makes the second a no-op:
   - the customer's redirect to `/o/{slug}/billing/return?transaction_id=...`
   - the webhook at `/api/webhooks/flutterwave`
3. Both call `settleTransaction`, which re-verifies with Flutterwave, checks the result against the checkout record, then calls `svc_apply_payment`. That records the payment (unique on provider + reference), extends the period, sets the org active and issues a join code.

Offline payments use **Mark as paid** in the Super Admin console, which goes through the same database function with `provider = 'manual'` and records who approved it and when.

## Environment variables (Vercel and Supabase secrets only, never git or chat)

- `FLUTTERWAVE_SECRET_KEY`
- `FLUTTERWAVE_WEBHOOK_HASH`: the same random value entered in the Flutterwave dashboard webhook settings
- `FLUTTERWAVE_API_BASE`: defaults to `https://api.flutterwave.com/v3`

## Testing

`tests/e2e/fake-flutterwave.mjs` is a local stand-in that mimics the create, checkout and verify shapes above. It is used only by the Playwright suite.

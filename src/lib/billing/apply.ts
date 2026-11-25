import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { BillingProvider } from "./provider";

/**
 * Turns a provider transaction into access. Safe to call from both the
 * webhook and the customer's redirect: it re-verifies with the provider,
 * checks the result against the checkout we created, and the database makes
 * the payment idempotent on (provider, provider_ref).
 */
export async function settleTransaction(provider: BillingProvider, providerTxId: string): Promise<"applied" | "ignored"> {
  const tx = await provider.verifyTransaction(providerTxId);
  if (tx.status !== "successful") return "ignored";

  const admin = supabaseAdmin();
  const { data: checkout } = await admin
    .from("checkout_sessions")
    .select("id, organization_id, plan_id, billing_interval, currency, amount_minor, provider, status")
    .eq("tx_ref", tx.txRef)
    .maybeSingle();
  if (!checkout || checkout.provider !== provider.id) return "ignored";
  if (tx.currency !== checkout.currency || tx.amountMinor < checkout.amount_minor) return "ignored";

  const periodEnd = new Date();
  if (checkout.billing_interval === "year") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  else periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { error } = await supabaseAdmin().rpc("svc_apply_payment", {
    p_org: checkout.organization_id,
    p_plan: checkout.plan_id,
    p_interval: checkout.billing_interval,
    p_currency: checkout.currency,
    p_amount_minor: tx.amountMinor,
    p_period_end: periodEnd.toISOString(),
    p_provider: provider.id,
    p_method: tx.method,
    p_ref: tx.providerTxId,
  });
  if (error) throw new Error("Could not apply the payment.");
  await admin.from("checkout_sessions").update({ status: "paid" }).eq("id", checkout.id);
  return "applied";
}

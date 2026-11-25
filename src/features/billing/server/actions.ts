"use server";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { flutterwave } from "@/lib/billing/flutterwave";
import { env } from "@/lib/env";
import type { ActionState } from "@/components/ui/action-form";

export async function startCheckout(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { viewer, org } = await requireOrgRole(slug, ["org_admin"]);
  const parsed = z.object({ priceId: z.uuid() }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: "Pick a plan." };

  const admin = supabaseAdmin();
  const { data: price } = await admin
    .from("plan_prices")
    .select("id, plan_id, currency, billing_interval, amount_minor, active, plans!inner(name, active)")
    .eq("id", parsed.data.priceId)
    .maybeSingle();
  if (!price || !price.active || !price.plans.active || price.amount_minor <= 0) return { error: "That plan is not available." };

  // The founding price lock, if this org has one, wins while it is valid.
  const { data: sub } = await admin
    .from("subscriptions")
    .select("price_lock_amount_minor, price_lock_until")
    .eq("organization_id", org.id)
    .maybeSingle();
  const locked = sub?.price_lock_amount_minor != null && sub.price_lock_until && new Date(sub.price_lock_until) > new Date();
  const amount = locked ? sub.price_lock_amount_minor! : price.amount_minor;

  const txRef = `chz_${randomUUID()}`;
  const { error } = await admin.from("checkout_sessions").insert({
    organization_id: org.id,
    plan_id: price.plan_id,
    billing_interval: price.billing_interval,
    currency: price.currency,
    amount_minor: amount,
    provider: "flutterwave",
    tx_ref: txRef,
    created_by: viewer.userId,
  });
  if (error) return { error: "Could not start the payment. Please try again." };

  let url: string;
  try {
    ({ url } = await flutterwave.createCheckout({
      txRef,
      amountMinor: amount,
      currency: price.currency,
      redirectUrl: `${env().APP_URL}/o/${slug}/billing/return`,
      customer: { email: viewer.email ?? "", name: viewer.fullName || org.name },
      title: `Champzz ${price.plans.name}`,
    }));
  } catch {
    return { error: "The payment page is not available right now. Please try again shortly." };
  }
  redirect(url);
}

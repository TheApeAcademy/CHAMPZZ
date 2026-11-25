import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

export type PublicPlan = { id: string; name: string; kidLimit: number | null; amountMinor: number; currency: string };

/** Active monthly NGN prices, straight from the plans table (editable by Super Admin). */
export async function getPublicPlans(): Promise<PublicPlan[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("plan_prices")
    .select("id, amount_minor, currency, billing_interval, plans!inner(name, kid_limit, sort, active)")
    .eq("currency", "NGN")
    .eq("billing_interval", "month")
    .eq("active", true);
  return (data ?? [])
    .filter((p) => p.plans.active)
    .sort((a, b) => a.plans.sort - b.plans.sort)
    .map((p) => ({ id: p.id, name: p.plans.name, kidLimit: p.plans.kid_limit, amountMinor: p.amount_minor, currency: p.currency }));
}

export function formatPrice(minor: number, currency: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(minor / 100);
}

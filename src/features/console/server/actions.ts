"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePlatformAdmin } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/errors";
import type { ActionState } from "@/components/ui/action-form";

const markPaidSchema = z.object({
  planId: z.uuid(),
  interval: z.enum(["month", "year"]),
  periodEnd: z.iso.date(),
  method: z.enum(["bank_transfer", "cash", "other"]),
  amount: z.coerce.number().min(0).max(100_000_000),
  currency: z.enum(["NGN", "GBP", "USD", "EUR", "CAD"]),
  note: z.string().trim().max(500).optional(),
});

export async function markAsPaid(orgId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requirePlatformAdmin();
  const parsed = markPaidSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const d = parsed.data;
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("mark_as_paid", {
    p_org: orgId,
    p_plan: d.planId,
    p_interval: d.interval,
    p_period_end: new Date(`${d.periodEnd}T23:59:59Z`).toISOString(),
    p_method: d.method,
    p_amount_minor: Math.round(d.amount * 100),
    p_currency: d.currency,
    p_note: d.note || undefined,
  });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/console/orgs/${orgId}`);
  return { ok: "Marked as paid. The org is active." };
}

export async function setSuspended(orgId: string, suspend: boolean, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requirePlatformAdmin();
  const supabase = await supabaseServer();
  const reason = z.string().trim().max(300).safeParse(data.get("reason") ?? "");
  const { error } = suspend
    ? await supabase.rpc("suspend_organization", { p_org: orgId, p_reason: reason.success ? reason.data : "" })
    : await supabase.rpc("unsuspend_organization", { p_org: orgId });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/console/orgs/${orgId}`);
  return { ok: suspend ? "Suspended." : "Suspension lifted." };
}

"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdult, requireOrgRole } from "@/lib/auth/viewer";
import { friendlyError } from "@/lib/errors";
import { pinSchema, slugSchema } from "@/lib/validation";
import type { ActionState } from "@/components/ui/action-form";

const createOrgSchema = z.object({
  name: z.string().trim().min(2, "Please enter a name.").max(80),
  slug: slugSchema,
  kind: z.enum(["church", "club", "school", "other"]),
  country: z.string().regex(/^[A-Z]{2}$/),
  timezone: z.string().min(3).max(64),
  currency: z.enum(["NGN", "GBP", "USD", "EUR", "CAD"]),
});

export async function createOrganization(_prev: ActionState, data: FormData): Promise<ActionState> {
  await requireAdult("/onboarding");
  const parsed = createOrgSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const d = parsed.data;
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("create_organization", {
    p_name: d.name,
    p_slug: d.slug,
    p_kind: d.kind,
    p_country: d.country,
    p_timezone: d.timezone,
    p_currency: d.currency,
    p_faith_mode: d.kind === "church",
  });
  if (error) return { error: error.code === "23505" ? "That web address is taken. Try another." : friendlyError(error) };
  redirect(`/o/${d.slug}`);
}

const uuid = z.uuid();

export async function addClass(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin"]);
  const parsed = z
    .object({ name: z.string().trim().min(1, "Give the class a name.").max(60), ageBand: z.enum(["little", "champ"]) })
    .safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { error } = await supabase.from("classes").insert({ organization_id: org.id, name: parsed.data.name, age_band: parsed.data.ageBand });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}`);
  return { ok: `Class "${parsed.data.name}" added.` };
}

export async function regenerateJoinCode(slug: string): Promise<void> {
  const { org } = await requireOrgRole(slug, ["org_admin"]);
  const supabase = await supabaseServer();
  await supabase.rpc("regenerate_join_code", { p_org: org.id });
  revalidatePath(`/o/${slug}`);
}

export async function updateRegistration(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin"]);
  const mode = z.enum(["open", "approval"]).safeParse(data.get("mode"));
  if (!mode.success) return { error: "Pick a joining mode." };
  const paused = data.get("paused") === "on";
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("organizations")
    .update({ registration_mode: mode.data, joining_paused: paused, joining_paused_reason: paused ? "admin" : null })
    .eq("id", org.id);
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}`);
  return { ok: "Joining settings saved." };
}

async function kidRpc(slug: string, fn: "confirm_kid" | "approve_kid", kidId: string): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  const id = uuid.safeParse(kidId);
  if (!id.success) return { error: "Unknown kid." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc(fn, { p_kid: id.data });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}`);
  return { ok: fn === "confirm_kid" ? "Confirmed." : "Approved." };
}

export async function confirmKid(slug: string, kidId: string): Promise<ActionState> {
  return kidRpc(slug, "confirm_kid", kidId);
}

export async function approveKid(slug: string, kidId: string): Promise<ActionState> {
  return kidRpc(slug, "approve_kid", kidId);
}

export async function resetKidPin(slug: string, kidId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  const id = uuid.safeParse(kidId);
  const pin = pinSchema.safeParse(data.get("pin"));
  if (!id.success || !pin.success) return { error: "Pick 4 pictures for the new PIN." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("reset_kid_pin", { p_kid: id.data, p_pin: pin.data });
  if (error) return { error: friendlyError(error) };
  return { ok: "New PIN set. Any lockout is cleared." };
}

export async function giveStar(slug: string, kidId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  const id = uuid.safeParse(kidId);
  const note = z.string().trim().max(140).safeParse(data.get("note") ?? "");
  if (!id.success || !note.success) return { error: "Unknown kid." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("give_star", { p_kid: id.data, p_note: note.data || undefined });
  if (error) return { error: error.message === "star_limit_reached" ? "That is 5 stars from you today. Try again tomorrow." : friendlyError(error) };
  revalidatePath(`/o/${slug}`);
  return { ok: "Star given! +10 Champ Points." };
}

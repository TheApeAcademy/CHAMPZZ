"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getViewer, requireOrgRole } from "@/lib/auth/viewer";
import { env } from "@/lib/env";
import { friendlyError } from "@/lib/errors";
import { mimeFor, sniffImage } from "@/lib/images";
import type { ActionState } from "@/components/ui/action-form";

const uuid = z.uuid();

// ---------- team ----------

export async function createInvite(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin"]);
  const parsed = z.object({
    role: z.enum(["teacher", "org_admin"]),
    email: z.union([z.literal(""), z.email("That email does not look right.")]).optional(),
  }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { data: token, error } = await supabase.rpc("create_team_invite", { p_org: org.id, p_role: parsed.data.role, p_email: parsed.data.email || undefined });
  if (error || !token) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/team`);
  return {
    ok: "Invite ready. Send this link to them yourself (by WhatsApp, text or email). It works once and expires in 7 days. It will not be shown again.",
    value: `${env().APP_URL}/join/${token}`,
    valueLabel: "Invite link",
  };
}

export async function revokeInvite(slug: string, inviteId: string): Promise<void> {
  await requireOrgRole(slug, ["org_admin"]);
  const id = uuid.safeParse(inviteId);
  if (!id.success) return;
  const supabase = await supabaseServer();
  await supabase.rpc("revoke_team_invite", { p_invite: id.data });
  revalidatePath(`/o/${slug}/team`);
}

export async function changeRole(slug: string, membershipId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin"]);
  const id = uuid.safeParse(membershipId);
  const role = z.enum(["teacher", "org_admin"]).safeParse(data.get("role"));
  if (!id.success || !role.success) return { error: "Pick a role." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("change_member_role", { p_membership: id.data, p_role: role.data });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/team`);
  return { ok: "Role updated." };
}

export async function removeMember(slug: string, membershipId: string): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin"]);
  const id = uuid.safeParse(membershipId);
  if (!id.success) return { error: "Unknown member." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("remove_member", { p_membership: id.data });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/team`);
  return { ok: "Removed from the team." };
}

export async function acceptInvite(token: string): Promise<ActionState> {
  const viewer = await getViewer();
  if (viewer.kind !== "adult") return { error: "Please sign in first." };
  if (!/^[0-9a-f]{48}$/.test(token)) return { error: friendlyError({ message: "invite_invalid" }) };
  const supabase = await supabaseServer();
  const { data: slug, error } = await supabase.rpc("accept_team_invite", { p_token: token });
  if (error || !slug) return { error: friendlyError(error) };
  redirect(`/o/${slug}`);
}

// ---------- check-in ----------

export async function checkIn(slug: string, kidId: string): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  const id = uuid.safeParse(kidId);
  if (!id.success) return { error: "Unknown kid." };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("check_in_kid", { p_kid: id.data });
  const row = data?.[0];
  if (error || !row) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/checkin`);
  return { ok: row.already ? "Checked in today." : "Checked in. Their parent has the pickup code.", value: row.pickup_code, valueLabel: "Pickup code (for the printed parent stub)" };
}

export async function checkOut(slug: string, attendanceId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  const id = uuid.safeParse(attendanceId);
  const code = z.string().trim().regex(/^[0-9]{4}$/, "The pickup code is 4 numbers.").safeParse(data.get("code"));
  if (!id.success) return { error: "Unknown visit." };
  if (!code.success) return { error: code.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { data: result, error } = await supabase.rpc("check_out_kid", { p_attendance: id.data, p_code: code.data });
  if (error) return { error: friendlyError(error) };
  if (result === "wrong_code") return { error: "That code does not match. Do not release the child. Check with the parent." };
  if (result === "locked") return { error: "Too many wrong codes. An Org Admin must check ID and release the child." };
  revalidatePath(`/o/${slug}/checkin`);
  return { ok: "Checked out. Safe home!" };
}

export async function checkOutOverride(slug: string, attendanceId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin"]);
  const id = uuid.safeParse(attendanceId);
  const reason = z.string().trim().min(3, "Write a short reason.").max(250).safeParse(data.get("reason"));
  if (!id.success) return { error: "Unknown visit." };
  if (!reason.success) return { error: reason.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("check_out_override", { p_attendance: id.data, p_reason: reason.data });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/checkin`);
  return { ok: "Released and logged. The parent has been told." };
}

// ---------- certificates ----------

export async function issueCertificate(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  const parsed = z.object({
    kidId: z.uuid("Pick a kid."),
    title: z.string().trim().min(2, "Give the certificate a title.").max(80),
    reason: z.string().trim().max(200).optional(),
  }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("issue_certificate", { p_kid: parsed.data.kidId, p_title: parsed.data.title, p_reason: parsed.data.reason || undefined });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/certificates`);
  return { ok: "Certificate issued. The kid and their parents have been told." };
}

// ---------- seasons ----------

export async function createSeason(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin"]);
  const parsed = z.object({
    name: z.string().trim().min(1, "Name the season.").max(60),
    startsOn: z.iso.date("Pick a start date."),
    endsOn: z.iso.date("Pick an end date."),
  }).refine((d) => d.endsOn >= d.startsOn, { message: "The end date must be after the start." }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { error } = await supabase.from("seasons").insert({ organization_id: org.id, name: parsed.data.name, starts_on: parsed.data.startsOn, ends_on: parsed.data.endsOn });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/seasons`);
  return { ok: `Season "${parsed.data.name}" saved.` };
}

export async function deleteSeason(slug: string, seasonId: string): Promise<void> {
  await requireOrgRole(slug, ["org_admin"]);
  const id = uuid.safeParse(seasonId);
  if (!id.success) return;
  const supabase = await supabaseServer();
  await supabase.from("seasons").delete().eq("id", id.data);
  revalidatePath(`/o/${slug}/seasons`);
}

// ---------- settings and branding ----------

const ZONES = new Set(Intl.supportedValuesOf("timeZone"));

export async function updateClubSettings(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin"]);
  const parsed = z.object({
    name: z.string().trim().min(2, "Club name is too short.").max(80),
    timezone: z.string().refine((z) => ZONES.has(z) || z === "UTC", "Pick a valid time zone."),
    tagline: z.string().trim().max(140, "Keep the tagline under 140 characters."),
    motto: z.string().trim().max(400, "Keep the motto under 400 characters."),
    color: z.union([z.literal(""), z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Pick a colour.")]),
  }).safeParse({
    name: data.get("name"), timezone: data.get("timezone"), tagline: data.get("tagline") ?? "",
    motto: data.get("motto") ?? "", color: data.get("useColor") === "on" ? data.get("color") ?? "" : "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  const supabase = await supabaseServer();
  const { data: updated, error } = await supabase.from("organizations")
    .update({ name: d.name, timezone: d.timezone, faith_mode: data.get("faith") === "on" }).eq("id", org.id).select("id");
  if (error) return { error: friendlyError(error) };
  if (!updated?.length) return { error: friendlyError({ message: "organization_not_active" }) };
  const { error: bErr } = await supabase.from("org_branding")
    .upsert({ organization_id: org.id, tagline: d.tagline || null, motto: d.motto || null, primary_color: d.color || null, updated_at: new Date().toISOString() });
  if (bErr) return { error: friendlyError(bErr) };
  revalidatePath(`/o/${slug}`, "layout");
  revalidatePath(`/c/${slug}`);
  return { ok: "Club settings saved." };
}

export async function uploadLogo(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin"]);
  const file = data.get("logo");
  if (!(file instanceof File) || file.size === 0) return { error: "Pick an image first." };
  if (file.size > 512 * 1024) return { error: "That image is over 512 KB. Try a smaller one." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  // Trust the bytes, not the file name or the browser's claim. No SVG: it can carry scripts.
  const kind = sniffImage(bytes);
  if (!kind) return { error: "Use a PNG, JPG or WebP image." };
  const supabase = await supabaseServer();
  const { data: allowed } = await supabase.from("org_branding").select("organization_id").eq("organization_id", org.id).maybeSingle();
  if (!allowed) return { error: friendlyError({ message: "not_allowed" }) };
  const path = `${org.id}/logo-${crypto.randomUUID()}.${kind}`;
  const admin = supabaseAdmin();
  const { error: upErr } = await admin.storage.from("branding")
    .upload(path, bytes, { contentType: mimeFor(kind), upsert: false });
  if (upErr) return { error: "Upload failed. Please try again." };
  // the user's own session writes the path, so RLS still decides (Org Admin, club can be set up)
  const { data: updated, error } = await supabase.from("org_branding")
    .update({ logo_path: path, updated_at: new Date().toISOString() }).eq("organization_id", org.id).select("organization_id");
  if (error || !updated?.length) {
    await admin.storage.from("branding").remove([path]);
    return { error: friendlyError(error ?? { message: "organization_not_active" }) };
  }
  revalidatePath(`/o/${slug}`, "layout");
  revalidatePath(`/c/${slug}`);
  return { ok: "Logo updated." };
}

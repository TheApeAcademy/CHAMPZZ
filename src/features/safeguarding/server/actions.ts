"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getViewer, requireOrgRole } from "@/lib/auth/viewer";
import { friendlyError } from "@/lib/errors";
import type { ActionState } from "@/components/ui/action-form";

const body = z.string().trim().min(1, "Please write something first.").max(2000);
const uuid = z.uuid();

export async function kidSendConcern(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (viewer.kind !== "kid" || viewer.org.slug !== slug) return { error: "Please sign in again." };
  const text = body.safeParse(data.get("body"));
  if (!text.success) return { error: text.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("submit_concern", { p_body: text.data, p_anonymous: data.get("anonymous") === "on" });
  if (error) return { error: error.message === "too_many_messages" ? "You have sent a lot today. A grown-up will read them soon." : friendlyError(error) };
  revalidatePath(`/k/${slug}/talk`);
  return { ok: "Sent. A trusted adult will read it. You did the right thing." };
}

export async function replyConcern(path: string, concernId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (viewer.kind === "anonymous") return { error: "Please sign in again." };
  const id = uuid.safeParse(concernId);
  const text = body.safeParse(data.get("body"));
  if (!id.success || !text.success) return { error: "Please write something first." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("reply_to_concern", { p_concern: id.data, p_body: text.data });
  if (error) return { error: friendlyError(error) };
  revalidatePath(path);
  return { ok: "Reply sent." };
}

export async function setConcernStatus(slug: string, concernId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  const id = uuid.safeParse(concernId);
  const status = z.enum(["acknowledged", "in_progress", "escalated", "resolved"]).safeParse(data.get("status"));
  if (!id.success || !status.success) return { error: "Pick a status." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("set_concern_status", { p_concern: id.data, p_status: status.data });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/talk/${id.data}`);
  return { ok: status.data === "escalated" ? "Escalated. Your Org Admins have been alerted." : "Status updated." };
}

export async function addConcernNote(slug: string, concernId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  const id = uuid.safeParse(concernId);
  const text = body.safeParse(data.get("body"));
  if (!id.success || !text.success) return { error: "Please write something first." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("add_concern_note", { p_concern: id.data, p_body: text.data });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/talk/${id.data}`);
  return { ok: "Note saved. Only staff can see notes." };
}

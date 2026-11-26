"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdult } from "@/lib/auth/viewer";
import { slugSchema } from "@/lib/validation";
import { friendlyError } from "@/lib/errors";
import type { ActionState } from "@/components/ui/action-form";

/** Follow or unfollow a listed club. Adults only; the database refuses kid accounts too. */
export async function setFollow(slug: string, follow: boolean, _prev: ActionState, _data: FormData): Promise<ActionState> {
  void _prev; void _data;
  const s = slugSchema.safeParse(slug);
  if (!s.success) return { error: "That club was not found." };
  await requireAdult(`/c/${s.data}`);
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("follow_club", { p_slug: s.data, p_follow: follow });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/c/${s.data}`);
  revalidatePath("/feed");
  revalidatePath("/clubs");
  return { ok: follow ? "Following. Their posts now show in your feed." : "Unfollowed." };
}

/** A signed-in adult asks to teach at a club. An Org Admin approves it on the Team page. */
export async function requestToTeach(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const s = slugSchema.safeParse(slug);
  if (!s.success) return { error: "That club was not found." };
  await requireAdult(`/c/${s.data}`);
  const note = String(data.get("note") ?? "").slice(0, 300);
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("request_to_teach", { p_slug: s.data, p_note: note || undefined });
  if (error?.message.includes("already_on_team")) return { error: "You are already on this club's team." };
  if (error) return { error: friendlyError(error) };
  return { ok: "Request sent. The club leader will approve you, then the club shows up when you sign in." };
}

/** An Org Admin approves or declines a teaching request. */
export async function decideTeacherRequest(slug: string, requestId: string, approve: boolean, _prev: ActionState, _data: FormData): Promise<ActionState> {
  void _prev; void _data;
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("decide_teacher_request", { p_request: requestId, p_approve: approve });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/team`);
  return { ok: approve ? "Approved. They are now a teacher here." : "Declined." };
}

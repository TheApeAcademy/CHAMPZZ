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

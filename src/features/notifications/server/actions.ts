"use server";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { getViewer } from "@/lib/auth/viewer";

export async function markAllRead(path: string): Promise<void> {
  const viewer = await getViewer();
  if (viewer.kind === "anonymous") return;
  const supabase = await supabaseServer();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("recipient_id", viewer.userId).is("read_at", null);
  revalidatePath(path.startsWith("/") ? path : "/notifications");
}

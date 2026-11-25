import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

export async function unreadCounts(userId: string) {
  const supabase = await supabaseServer();
  const [{ count: unread }, { count: urgent }] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("recipient_id", userId).is("read_at", null),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("recipient_id", userId).is("read_at", null).eq("severity", "urgent"),
  ]);
  return { unread: unread ?? 0, urgent: urgent ?? 0 };
}

export async function listNotifications(userId: string) {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("notifications")
    .select("id, title, body, link, severity, read_at, created_at")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

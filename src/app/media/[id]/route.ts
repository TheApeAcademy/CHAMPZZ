import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { signedUrls } from "@/lib/uploads";

// Opens a Digital Bank file. The row is read with the viewer's own session,
// so RLS decides (staff: everything in their club; families: shared files).
export async function GET(_req: Request, ctx: RouteContext<"/media/[id]">) {
  const { id } = await ctx.params;
  if (!z.uuid().safeParse(id).success) return new Response("Not found", { status: 404 });
  const supabase = await supabaseServer();
  const { data: row } = await supabase.from("media_items").select("path").eq("id", id).maybeSingle();
  if (!row) return new Response("Not found", { status: 404 });
  const url = (await signedUrls("club-media", [row.path], 120)).get(row.path);
  if (!url) return new Response("Not found", { status: 404 });
  return new Response(null, { status: 302, headers: { location: url, "cache-control": "private, no-store" } });
}

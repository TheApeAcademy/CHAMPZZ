import { getViewer } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";

// A cell starting with = + - @ (or a tab/CR) is a formula in a spreadsheet; prefix a quote so it stays text.
function cell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function csv(header: string[], rows: unknown[][]) {
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

export async function GET(_req: Request, ctx: RouteContext<"/o/[org]/export/[kind]">) {
  const { org: slug, kind } = await ctx.params;
  const viewer = await getViewer();
  const m = viewer.kind === "adult" ? viewer.memberships.find((x) => x.org.slug === slug && x.role === "org_admin") : undefined;
  if (!m) return new Response("Not found", { status: 404 });
  const supabase = await supabaseServer();
  const orgId = m.org.id;
  let body: string;
  if (kind === "kids") {
    const { data } = await supabase.from("kids")
      .select("first_name, last_initial, username, status, confirmed_at, created_at, classes(name), kid_stats(points_total, streak_best, stars)")
      .eq("organization_id", orgId).order("first_name");
    body = csv(["first_name", "last_initial", "username", "class", "status", "confirmed_at", "joined_at", "champ_points", "best_streak", "stars"],
      (data ?? []).map((k) => [k.first_name, k.last_initial, k.username, k.classes?.name, k.status, k.confirmed_at, k.created_at,
        k.kid_stats?.[0]?.points_total ?? 0, k.kid_stats?.[0]?.streak_best ?? 0, k.kid_stats?.[0]?.stars ?? 0]));
  } else if (kind === "attendance") {
    const { data } = await supabase.from("attendance")
      .select("day, checked_in_at, checked_out_at, checkout_note, kids!inner(first_name, last_initial, username)")
      .eq("organization_id", orgId).order("day", { ascending: false }).limit(20000);
    body = csv(["day", "first_name", "last_initial", "username", "checked_in_at", "checked_out_at", "note"],
      (data ?? []).map((a) => [a.day, a.kids.first_name, a.kids.last_initial, a.kids.username, a.checked_in_at, a.checked_out_at, a.checkout_note]));
  } else if (kind === "points") {
    const { data } = await supabase.from("point_events")
      .select("at, source, points, note, kids!inner(first_name, last_initial, username)")
      .eq("organization_id", orgId).order("at", { ascending: false }).limit(50000);
    body = csv(["at", "first_name", "last_initial", "username", "source", "points", "note"],
      (data ?? []).map((p) => [p.at, p.kids.first_name, p.kids.last_initial, p.kids.username, p.source, p.points, p.note]));
  } else {
    return new Response("Not found", { status: 404 });
  }
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}-${kind}.csv"`,
      "cache-control": "private, no-store",
    },
  });
}

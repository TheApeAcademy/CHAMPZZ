import { supabaseServer } from "@/lib/supabase/server";
import { upcomingSince } from "@/lib/time";

// Calendar export for a parent: every upcoming event at the clubs their kids belong to.
// RLS limits rows to clubs where the signed-in user is a guardian or staff.
function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
function stamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return new Response("Sign in first", { status: 401 });
  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, starts_at, ends_at, location, created_at, organizations!inner(name)")
    .gte("starts_at", upcomingSince())
    .order("starts_at")
    .limit(500);
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Champzz//Events//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:Champzz events"];
  for (const e of events ?? []) {
    const end = e.ends_at ?? new Date(new Date(e.starts_at).getTime() + 60 * 60 * 1000).toISOString();
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@champzz`,
      `DTSTAMP:${stamp(e.created_at)}`,
      `DTSTART:${stamp(e.starts_at)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${esc(`${e.title} (${e.organizations.name})`)}`,
      ...(e.location ? [`LOCATION:${esc(e.location)}`] : []),
      ...(e.description ? [`DESCRIPTION:${esc(e.description)}`] : []),
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n") + "\r\n", {
    headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": 'attachment; filename="champzz-events.ics"', "cache-control": "private, no-store" },
  });
}

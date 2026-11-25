import { upcomingSince } from "@/lib/time";
import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Events" };

export default async function KidEventsPage({ params }: PageProps<"/k/[org]/events">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  const supabase = await supabaseServer();
  const { data: events } = await supabase.from("events").select("id, title, description, starts_at, location").gte("starts_at", upcomingSince()).order("starts_at");
  const fmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: k.org.timezone });
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">Events</h1>
      <ul className="flex flex-col gap-3" data-testid="kid-events">
        {(events ?? []).map((e) => (
          <li key={e.id} className="rounded-[20px] bg-surface p-4">
            <p className="font-extrabold">{e.title}</p>
            <p className="text-sm font-bold text-brand">{fmt.format(new Date(e.starts_at))}{e.location ? ` · ${e.location}` : ""}</p>
            {e.description ? <p className="text-sm">{e.description}</p> : null}
          </li>
        ))}
        {(events ?? []).length === 0 ? <li className="text-sm text-muted">Nothing planned yet.</li> : null}
      </ul>
    </KidShell>
  );
}

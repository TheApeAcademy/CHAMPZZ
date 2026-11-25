import Link from "next/link";
import { notFound } from "next/navigation";
import { AdultShell } from "@/components/shell";
import { Card } from "@/components/ui/primitives";
import { requireAdult } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { ChampAvatar } from "@/features/kids/components/champ-avatar";
import { parseAvatar } from "@/features/kids/avatar";
import { getWeekReport } from "@/features/parents/server/data";

export const metadata = { title: "Progress" };

export default async function KidProgressPage({ params }: PageProps<"/p/kids/[id]">) {
  const { id } = await params;
  const viewer = await requireAdult(`/p/kids/${id}`);
  const r = await getWeekReport(id);
  const supabase = await supabaseServer();
  // the parent must be this child's guardian (staff use the club workspace instead)
  const { data: link } = await supabase.from("guardians").select("kid_id").eq("kid_id", id).eq("user_id", viewer.userId).maybeSingle();
  if (!link) notFound();
  const [{ data: kid }, { data: badges }, { data: certs }, { data: work }, { data: visits }] = await Promise.all([
    supabase.from("kids").select("avatar, username").eq("id", id).single(),
    supabase.from("kid_badges").select("earned_at, badges!inner(name)").eq("kid_id", id).order("earned_at", { ascending: false }),
    supabase.from("certificates").select("id, title, issued_at").eq("kid_id", id).order("issued_at", { ascending: false }),
    supabase.from("submissions").select("id, submitted_at, grade, feedback, assignments!inner(title)").eq("kid_id", id).order("submitted_at", { ascending: false }).limit(10),
    supabase.from("attendance").select("day, checked_in_at, checked_out_at").eq("kid_id", id).order("day", { ascending: false }).limit(10),
  ]);
  const name = `${r.kid.first_name}${r.kid.last_initial ? ` ${r.kid.last_initial}.` : ""}`;
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <Link href="/p" className="min-h-11 py-2.5 text-sm font-extrabold underline">Back to my kids</Link>
      <section className="flex flex-wrap items-center gap-4">
        <ChampAvatar a={parseAvatar(kid?.avatar)} size={84} />
        <div>
          <h1 className="font-display text-3xl font-extrabold" data-testid="progress-name">{name}</h1>
          <p className="text-muted">{r.club.name}{r.kid.class ? ` · ${r.kid.class}` : ""} · {kid?.username}</p>
        </div>
        <Link href={`/p/kids/${id}/report`} className="ml-auto min-h-11 rounded-full bg-brand px-5 py-2.5 font-extrabold text-white">This week&apos;s report</Link>
      </section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Level", r.level, "progress-level"], ["Champ Points", r.points_total.toLocaleString("en-GB"), "progress-points"],
          ["Fire Streak", `${r.streak_current} (best ${r.streak_best})`, "progress-streak"], ["Trophies", String(badges?.length ?? 0), "progress-trophies"]].map(([l, v, t]) => (
          <div key={t} className="rounded-[16px] border border-line bg-surface p-4">
            <p className="text-sm font-bold text-muted">{l}</p>
            <p className="font-display text-2xl font-extrabold" data-testid={t}>{v}</p>
          </div>
        ))}
      </div>
      {r.next_level && r.points_to_next !== null ? (
        <div>
          <p className="mb-1 text-sm font-bold">{r.points_to_next} Champ Points to {r.next_level}</p>
          <div className="h-3 overflow-hidden rounded-full bg-line" role="progressbar" aria-label={`Progress to ${r.next_level}`}
            aria-valuemin={0} aria-valuemax={r.points_total + r.points_to_next} aria-valuenow={r.points_total}>
            <div className="h-full rounded-full bg-gold" style={{ width: `${Math.round((r.points_total / (r.points_total + r.points_to_next)) * 100)}%` }} />
          </div>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-lg font-extrabold">Trophies</h2>
          <ul className="flex flex-wrap gap-2">
            {(badges ?? []).map((b) => <li key={b.badges.name} className="rounded-full bg-gold px-3 py-1 text-sm font-extrabold text-ink">{b.badges.name}</li>)}
            {(badges ?? []).length === 0 ? <li className="text-sm text-muted">None yet.</li> : null}
          </ul>
          {(certs ?? []).length > 0 ? (
            <>
              <h3 className="mt-4 mb-2 font-extrabold">Certificates</h3>
              <ul className="flex flex-col gap-1">
                {(certs ?? []).map((c) => <li key={c.id}><Link className="font-bold underline" href={`/p/certificates/${c.id}`}>{c.title}</Link></li>)}
              </ul>
            </>
          ) : null}
        </Card>
        <Card>
          <h2 className="mb-2 text-lg font-extrabold">Class work</h2>
          <ul className="flex flex-col gap-2" data-testid="progress-work">
            {(work ?? []).map((w) => (
              <li key={w.id} className="text-sm"><strong>{w.assignments.title}</strong>: {w.grade !== null ? `${w.grade}/100` : "waiting for a mark"}{w.feedback ? `. "${w.feedback}"` : ""}</li>
            ))}
            {(work ?? []).length === 0 ? <li className="text-sm text-muted">Nothing handed in yet.</li> : null}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-2 text-lg font-extrabold">Recent visits</h2>
          <ul className="flex flex-col gap-1 text-sm" data-testid="progress-visits">
            {(visits ?? []).map((v) => (
              <li key={v.day}>{v.day}: in {new Date(v.checked_in_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}{v.checked_out_at ? `, collected ${new Date(v.checked_out_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : ""}</li>
            ))}
            {(visits ?? []).length === 0 ? <li className="text-muted">No check-ins yet.</li> : null}
          </ul>
        </Card>
      </div>
    </AdultShell>
  );
}

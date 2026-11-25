import Link from "next/link";
import { prettyDate, type WeekReport } from "@/features/parents/server/data";

function Tile({ label, value, id }: { label: string; value: string | number; id: string }) {
  return (
    <div className="rounded-[16px] bg-cream p-3 text-center print:border print:border-line">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="font-display text-2xl font-extrabold" data-testid={id}>{value}</p>
    </div>
  );
}

/** The weekly report a parent reads (and prints): numbers first, then what happened, then the Take-Home. */
export function WeekReportView({ r }: { r: WeekReport }) {
  const name = `${r.kid.first_name}${r.kid.last_initial ? ` ${r.kid.last_initial}.` : ""}`;
  const quiet = r.points_week === 0 && r.visits_week === 0 && r.checkins_week === 0 && r.work.length === 0;
  return (
    <article className="flex flex-col gap-5 rounded-[24px] border border-line bg-surface p-5 print:border-0 print:p-0" data-testid="week-report">
      <header>
        <p className="text-sm font-bold text-muted">{r.club.name}{r.kid.class ? ` · ${r.kid.class}` : ""}</p>
        <h1 className="font-display text-3xl font-extrabold">{name}&apos;s week</h1>
        <p className="font-bold text-muted" data-testid="report-range">{prettyDate(r.week_start)} to {prettyDate(r.week_end)}</p>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Champ Points this week" value={r.points_week} id="report-points" />
        <Tile label="Stars from teachers" value={r.stars_week} id="report-stars" />
        <Tile label="Days at the club" value={r.checkins_week} id="report-checkins" />
        <Tile label="Days on Champzz" value={r.visits_week} id="report-visits" />
      </div>
      <p className="rounded-[16px] bg-[#E6ECFF] p-4" data-testid="report-level">
        <strong>{r.level}</strong> with {r.points_total.toLocaleString("en-GB")} Champ Points in total.
        {r.next_level && r.points_to_next !== null ? ` ${r.points_to_next} more to reach ${r.next_level}.` : " Top level reached!"}
        {r.streak_current > 1 ? ` Fire Streak: ${r.streak_current} days.` : ""}
      </p>
      {quiet ? <p className="text-muted">A quiet week. A little encouragement goes a long way!</p> : null}
      {r.badges_week.length > 0 || r.certificates_week.length > 0 ? (
        <section>
          <h2 className="mb-2 text-lg font-extrabold">New this week</h2>
          <ul className="flex flex-wrap gap-2" data-testid="report-trophies">
            {r.badges_week.map((b) => <li key={b.name} className="rounded-full bg-gold px-3 py-1 text-sm font-extrabold text-ink">{b.name}</li>)}
            {r.certificates_week.map((c) => (
              <li key={c.id}><Link href={`/p/certificates/${c.id}`} className="inline-block rounded-full border-2 border-gold px-3 py-1 text-sm font-extrabold">Certificate: {c.title}</Link></li>
            ))}
          </ul>
        </section>
      ) : null}
      {r.work.length > 0 ? (
        <section>
          <h2 className="mb-2 text-lg font-extrabold">Class work</h2>
          <ul className="flex flex-col gap-2" data-testid="report-work">
            {r.work.map((w) => (
              <li key={`${w.title}-${w.submitted_at}`} className="rounded-[14px] border border-line p-3">
                <p className="font-extrabold">{w.title}</p>
                <p className="text-sm">{w.grade !== null ? `Marked ${w.grade}/100` : "Handed in, waiting for a mark"}{w.feedback ? `. "${w.feedback}"` : ""}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section>
        <h2 className="mb-2 text-lg font-extrabold">Take-Home</h2>
        {r.lessons.length === 0 ? <p className="text-sm text-muted">No lessons this week.</p> : (
          <ul className="flex flex-col gap-3" data-testid="report-takehome">
            {r.lessons.map((l) => (
              <li key={l.id} className="rounded-[16px] border-2 border-dashed border-gold p-4">
                <p className="font-extrabold">{l.title}</p>
                {l.memory_verse ? <p className="mt-1 text-sm italic">Memory verse: {l.memory_verse}</p> : null}
                {l.talk || l.do || l.pray ? (
                  <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-3">
                    {l.talk ? <><dt className="font-extrabold">Talk</dt><dd>{l.talk}</dd></> : null}
                    {l.do ? <><dt className="font-extrabold">Do</dt><dd>{l.do}</dd></> : null}
                    {l.pray ? <><dt className="font-extrabold">{r.club.faith_mode ? "Pray" : "Reflect"}</dt><dd>{l.pray}</dd></> : null}
                  </dl>
                ) : <p className="mt-1 text-sm text-muted">Ask {r.kid.first_name} what they learned!</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}

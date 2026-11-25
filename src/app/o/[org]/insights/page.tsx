import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { Card } from "@/components/ui/primitives";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Insights" };

type Insights = {
  kids_active: number; kids_new: number; here_today: number; points_this_week: number; work_handed_in_this_week: number;
  weekly_attendance: { week: string; count: number }[];
  not_seen: { kid_id: string; first_name: string; last_initial: string | null; last_seen: string | null }[];
};

function Stat({ label, value, id }: { label: string; value: number; id: string }) {
  return (
    <div className="rounded-[16px] border border-line bg-surface p-4">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="font-display text-3xl font-extrabold" data-testid={id}>{value.toLocaleString("en-GB")}</p>
    </div>
  );
}

/** Single-series weekly check-ins: one hue, thin bars with rounded data ends, hover values, table view below. */
function WeeklyBars({ data }: { data: Insights["weekly_attendance"] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const label = (w: string) => new Date(`${w}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="text-lg font-extrabold">Check-ins per week</figcaption>
      <div className="relative h-48 border-b border-line" aria-hidden="true">
        <div className="absolute inset-0 flex items-end gap-[2px] px-1">
          {data.map((d) => (
            <div key={d.week} className="group relative flex h-full flex-1 items-end justify-center">
              <div className="w-full max-w-10 rounded-t-[4px] bg-brand transition-opacity group-hover:opacity-80" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 2 : 0 }} />
              <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-[8px] bg-ink px-2 py-1 text-xs font-bold text-white group-hover:block">
                Week of {label(d.week)}: {d.count}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-[2px] px-1 text-[11px] text-muted" aria-hidden="true">
        {data.map((d) => <span key={d.week} className="flex-1 text-center">{label(d.week)}</span>)}
      </div>
      <details>
        <summary className="min-h-11 cursor-pointer py-2 text-sm font-extrabold underline">Show as a table</summary>
        <table className="w-full text-left text-sm" data-testid="weekly-table">
          <thead><tr className="text-muted"><th className="py-1">Week of</th><th className="py-1">Check-ins</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.week} className="border-t border-line"><td className="py-1.5">{label(d.week)}</td><td className="py-1.5 font-bold">{d.count}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}

export default async function InsightsPage({ params }: PageProps<"/o/[org]/insights">) {
  const { org: slug } = await params;
  const { viewer, org, roles } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("club_insights", { p_org: org.id });
  const i = (data ?? {}) as Insights;
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="insights" />
      <h1 className="font-display text-3xl font-extrabold">Insights</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Kids" value={i.kids_active ?? 0} id="stat-kids" />
        <Stat label="New, not yet confirmed" value={i.kids_new ?? 0} id="stat-new" />
        <Stat label="Here today" value={i.here_today ?? 0} id="stat-today" />
        <Stat label="Champ Points this week" value={i.points_this_week ?? 0} id="stat-points" />
        <Stat label="Work handed in this week" value={i.work_handed_in_this_week ?? 0} id="stat-work" />
      </div>
      <Card><WeeklyBars data={i.weekly_attendance ?? []} /></Card>
      <Card>
        <h2 className="mb-1 text-lg font-extrabold">Not seen in 3 weeks</h2>
        <p className="mb-3 text-sm text-muted">A friendly message can bring someone back.</p>
        <ul className="flex flex-col gap-1" data-testid="not-seen">
          {(i.not_seen ?? []).map((k) => (
            <li key={k.kid_id}><Link href={`/o/${slug}/messages/${k.kid_id}`} className="font-bold underline">{k.first_name}{k.last_initial ? ` ${k.last_initial}.` : ""}</Link>
              <span className="text-sm text-muted"> · {k.last_seen ? `last here ${k.last_seen}` : "never checked in"}</span></li>
          ))}
          {(i.not_seen ?? []).length === 0 ? <li className="text-sm text-muted">Everyone has been in recently.</li> : null}
        </ul>
      </Card>
      {roles.includes("org_admin") ? (
        <Card>
          <h2 className="mb-2 text-lg font-extrabold">Download your data</h2>
          <p className="mb-3 text-sm text-muted">Your club&apos;s data is yours. CSV files open in Excel, Google Sheets or Numbers. Picture PINs and Talk to Someone messages are never included.</p>
          <div className="flex flex-wrap gap-3">
            <a className="min-h-11 rounded-full border-2 border-ink px-4 py-2 text-sm font-extrabold" href={`/o/${slug}/export/kids`}>Kids (.csv)</a>
            <a className="min-h-11 rounded-full border-2 border-ink px-4 py-2 text-sm font-extrabold" href={`/o/${slug}/export/attendance`}>Attendance (.csv)</a>
            <a className="min-h-11 rounded-full border-2 border-ink px-4 py-2 text-sm font-extrabold" href={`/o/${slug}/export/points`}>Champ Points (.csv)</a>
          </div>
        </Card>
      ) : null}
    </AdultShell>
  );
}

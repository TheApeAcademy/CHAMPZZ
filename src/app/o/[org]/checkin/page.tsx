import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Pill } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { checkIn, checkOut, checkOutOverride } from "@/features/admin/server/actions";

export const metadata = { title: "Check-in" };

export default async function CheckinPage({ params, searchParams }: PageProps<"/o/[org]/checkin">) {
  const { org: slug } = await params;
  const { class: classParam } = await searchParams;
  const { viewer, org, roles } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const isAdmin = roles.includes("org_admin");
  const supabase = await supabaseServer();
  const { data: o } = await supabase.from("organizations").select("timezone").eq("id", org.id).single();
  const tz = o?.timezone ?? "UTC";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [{ data: classes }, { data: kids }, { data: visits }, { data: recent }] = await Promise.all([
    supabase.from("classes").select("id, name").eq("organization_id", org.id).eq("archived", false).order("name"),
    supabase.from("kids").select("id, first_name, last_initial, username, class_id, confirmed_at").eq("organization_id", org.id).eq("status", "active").order("first_name"),
    supabase.from("attendance").select("id, kid_id, checked_in_at, checked_out_at, checkout_note").eq("organization_id", org.id).eq("day", today),
    supabase.from("attendance").select("day").eq("organization_id", org.id).order("day", { ascending: false }).limit(2000),
  ]);
  const cls = typeof classParam === "string" ? classParam : "";
  const shown = (kids ?? []).filter((k) => !cls || k.class_id === cls);
  const byKid = new Map((visits ?? []).map((v) => [v.kid_id, v]));
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz });
  const perDay = new Map<string, number>();
  for (const r of recent ?? []) perDay.set(r.day, (perDay.get(r.day) ?? 0) + 1);
  const here = (visits ?? []).filter((v) => !v.checked_out_at).length;
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="checkin" />
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-display text-3xl font-extrabold">Check-in</h1>
        <p className="font-bold" data-testid="here-now">{here} here now · {(visits ?? []).length} today</p>
      </div>
      <p className="max-w-2xl text-sm text-muted">Checking a child in sends their parent a 4-number pickup code. To check out, the adult collecting them shows that code. A first check-in also confirms a new kid.</p>
      <nav aria-label="Class" className="flex flex-wrap gap-2">
        <Link href={`/o/${slug}/checkin`} className={`min-h-11 rounded-full px-4 py-2.5 text-sm font-extrabold ${!cls ? "bg-brand text-white" : "bg-surface"}`}>Everyone</Link>
        {(classes ?? []).map((c) => (
          <Link key={c.id} href={`/o/${slug}/checkin?class=${c.id}`} className={`min-h-11 rounded-full px-4 py-2.5 text-sm font-extrabold ${cls === c.id ? "bg-brand text-white" : "bg-surface"}`}>{c.name}</Link>
        ))}
      </nav>
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="register">
          {shown.map((k) => {
            const v = byKid.get(k.id);
            return (
              <li key={k.id} className="flex flex-col gap-2 py-3" data-testid={`register-${k.username}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold">{k.first_name}{k.last_initial ? ` ${k.last_initial}.` : ""}</span>
                  <span className="text-sm text-muted">{k.username}</span>
                  {!v ? <Pill tone="neutral">Not here</Pill> : v.checked_out_at ? <Pill tone="ok">Gone home {time.format(new Date(v.checked_out_at))}</Pill> : <Pill tone="warn">Here since {time.format(new Date(v.checked_in_at))}</Pill>}
                  {!k.confirmed_at ? <Pill tone="new">New</Pill> : null}
                </div>
                {v?.checkout_note ? <p className="text-sm text-muted">{v.checkout_note}</p> : null}
                {!v?.checked_out_at ? (
                  <ActionForm key={`in-${k.id}`} action={checkIn.bind(null, slug, k.id)} className="flex flex-col gap-2">
                    <div><Submit variant={v ? "outline" : "primary"}>{v ? "Show pickup code" : "Check in"}</Submit></div>
                  </ActionForm>
                ) : null}
                {v && !v.checked_out_at ? (
                  <div className="flex flex-col gap-3">
                    <ActionForm action={checkOut.bind(null, slug, v.id)} className="flex flex-wrap items-end gap-2">
                      <Field label="Pickup code" name="code" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} required />
                      <Submit variant="outline">Check out</Submit>
                    </ActionForm>
                    {isAdmin ? (
                      <details>
                        <summary className="min-h-11 cursor-pointer py-2 text-sm font-extrabold underline">Release without the code (Org Admin)</summary>
                        <ActionForm action={checkOutOverride.bind(null, slug, v.id)} className="flex flex-col gap-2 pt-2">
                          <Field label="Why? (logged, and the parent is told)" name="reason" required maxLength={250} />
                          <div><Submit variant="danger">Release</Submit></div>
                        </ActionForm>
                      </details>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
          {shown.length === 0 ? <li className="py-3 text-sm text-muted">No kids in this class yet.</li> : null}
        </ul>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">Attendance history</h2>
        <table className="w-full text-left text-sm" data-testid="attendance-history">
          <thead><tr className="text-muted"><th className="py-1 font-bold">Day</th><th className="py-1 font-bold">Kids checked in</th></tr></thead>
          <tbody>
            {[...perDay.entries()].slice(0, 20).map(([d, n]) => (
              <tr key={d} className="border-t border-line"><td className="py-2">{d}</td><td className="py-2 font-extrabold">{n}</td></tr>
            ))}
            {perDay.size === 0 ? <tr><td colSpan={2} className="py-2 text-muted">No check-ins yet.</td></tr> : null}
          </tbody>
        </table>
      </Card>
    </AdultShell>
  );
}

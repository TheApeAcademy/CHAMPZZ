import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Pill } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { createSeason, deleteSeason } from "@/features/admin/server/actions";

export const metadata = { title: "Seasons" };

export default async function SeasonsPage({ params }: PageProps<"/o/[org]/seasons">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin"]);
  const supabase = await supabaseServer();
  const [{ data: seasons }, { data: o }] = await Promise.all([
    supabase.from("seasons").select("id, name, starts_on, ends_on").eq("organization_id", org.id).order("starts_on", { ascending: false }),
    supabase.from("organizations").select("timezone").eq("id", org.id).single(),
  ]);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: o?.timezone ?? "UTC", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="seasons" />
      <h1 className="font-display text-3xl font-extrabold">Seasons</h1>
      <p className="max-w-2xl text-sm text-muted">A season is a stretch of time, like a term. The Hall of Champs gets a &quot;This season&quot; board that starts fresh, so newer kids can catch up.</p>
      <Card>
        <ActionForm action={createSeason.bind(null, slug)} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Name" name="name" required maxLength={60} placeholder="Autumn term" />
          <Field label="Starts" name="startsOn" type="date" required />
          <Field label="Ends" name="endsOn" type="date" required />
          <div className="sm:col-span-3"><Submit>Save season</Submit></div>
        </ActionForm>
      </Card>
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="season-list">
          {(seasons ?? []).map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-2 py-3">
              <span className="font-extrabold">{s.name}</span>
              <span className="text-sm text-muted">{s.starts_on} to {s.ends_on}</span>
              {s.starts_on <= today && today <= s.ends_on ? <Pill tone="ok">Now</Pill> : null}
              <form action={deleteSeason.bind(null, slug, s.id)} className="ml-auto"><button type="submit" className="min-h-11 text-sm font-extrabold underline">Remove</button></form>
            </li>
          ))}
          {(seasons ?? []).length === 0 ? <li className="py-3 text-sm text-muted">No seasons yet.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}

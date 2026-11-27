import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { createEvent, deleteEvent } from "@/features/classlife/server/actions";

export const metadata = { title: "Events" };

export default async function EventsPage({ params }: PageProps<"/o/[org]/events">) {
  const { org: slug } = await params;
  const { viewer, org, roles } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const isAdmin = roles.includes("org_admin");
  const supabase = await supabaseServer();
  const [{ data: events }, { data: o }] = await Promise.all([
    supabase.from("events").select("id, title, description, starts_at, location").eq("organization_id", org.id).order("starts_at"),
    supabase.from("organizations").select("timezone").eq("id", org.id).single(),
  ]);
  const fmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: o?.timezone ?? "UTC" });
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="events" />
      <h1 className="font-display text-3xl font-extrabold">Events</h1>
      {isAdmin ? (
        <Card>
          <h2 className="mb-3 text-lg font-extrabold">New event</h2>
          <ActionForm action={createEvent.bind(null, slug)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Title" name="title" required maxLength={120} />
            <Field label={`Starts (${o?.timezone ?? "club time"})`} name="startsAt" type="datetime-local" required />
            <Field label="Where (optional)" name="location" maxLength={200} />
            <Field label="Details (optional)" name="description" maxLength={2000} />
            <div><Submit>Add event</Submit></div>
          </ActionForm>
        </Card>
      ) : null}
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="event-list">
          {(events ?? []).map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-2 py-3">
              <span className="font-extrabold">{e.title}</span>
              <span className="text-sm text-muted">{fmt.format(new Date(e.starts_at))}{e.location ? ` · ${e.location}` : ""}</span>
              {isAdmin ? <form action={deleteEvent.bind(null, slug, e.id)} className="ml-auto"><button type="submit" className="min-h-11 text-sm font-extrabold underline">Remove</button></form> : null}
            </li>
          ))}
          {(events ?? []).length === 0 ? <li className="py-3 text-sm text-muted">No events yet.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}

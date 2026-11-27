import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ClassSelect } from "@/components/class-select";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Pill } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { createAssignment, setAssignmentStatus } from "@/features/classlife/server/actions";

export const metadata = { title: "Assignments" };

export default async function AssignmentsPage({ params }: PageProps<"/o/[org]/assignments">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const [{ data: classes }, { data: items }] = await Promise.all([
    supabase.from("classes").select("id, name").eq("organization_id", org.id).eq("archived", false).order("name"),
    supabase.from("assignments").select("id, title, status, due_date, classes(name), submissions(count)").eq("organization_id", org.id).order("created_at", { ascending: false }),
  ]);
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="assignments" />
      <h1 className="font-display text-3xl font-extrabold">Assignments</h1>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">New assignment</h2>
        <ActionForm action={createAssignment.bind(null, slug)} className="flex flex-col gap-3">
          <Field label="Title" name="title" required maxLength={120} />
          <label className="flex flex-col gap-1.5 text-sm font-bold">Instructions
            <textarea name="instructions" maxLength={4000} rows={3} className="rounded-[12px] border border-line bg-surface p-3 text-base font-normal" />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Due (optional)" name="dueDate" type="date" />
            <ClassSelect classes={classes ?? []} />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="publish" className="h-5 w-5" /> Publish now and tell the kids</label>
          <div><Submit>Save assignment</Submit></div>
        </ActionForm>
      </Card>
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="assignment-list">
          {(items ?? []).map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-2 py-3">
              <Link href={`/o/${slug}/assignments/${a.id}`} className="font-extrabold underline">{a.title}</Link>
              <span className="text-sm text-muted">{a.classes?.name ?? "Whole club"}{a.due_date ? ` · due ${a.due_date}` : ""} · {a.submissions?.[0]?.count ?? 0} handed in</span>
              <Pill tone={a.status === "published" ? "ok" : "neutral"}>{a.status}</Pill>
              {a.status !== "closed" ? (
                <form action={setAssignmentStatus.bind(null, slug, a.id, a.status === "draft" ? "published" : "closed")} className="ml-auto">
                  <button type="submit" className="min-h-11 text-sm font-extrabold underline">{a.status === "draft" ? "Publish" : "Close"}</button>
                </form>
              ) : null}
            </li>
          ))}
          {(items ?? []).length === 0 ? <li className="py-3 text-sm text-muted">No assignments yet.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}

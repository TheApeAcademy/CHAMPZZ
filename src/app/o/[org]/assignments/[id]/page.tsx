import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { gradeSubmission } from "@/features/classlife/server/actions";

export const metadata = { title: "Assignment" };

export default async function AssignmentPage({ params }: PageProps<"/o/[org]/assignments/[id]">) {
  const { org: slug, id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const [{ data: a }, { data: subs }] = await Promise.all([
    supabase.from("assignments").select("id, title, instructions, status").eq("id", id).eq("organization_id", org.id).maybeSingle(),
    supabase.from("submissions").select("id, body, grade, feedback, submitted_at, kids(first_name, last_initial, username)").eq("assignment_id", id).order("submitted_at"),
  ]);
  if (!a) notFound();
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="assignments" />
      <Link href={`/o/${slug}/assignments`} className="text-sm font-extrabold underline">All assignments</Link>
      <h1 className="font-display text-3xl font-extrabold">{a.title}</h1>
      {a.instructions ? <p className="whitespace-pre-wrap text-muted">{a.instructions}</p> : null}
      <ul className="flex flex-col gap-3" data-testid="submission-list">
        {(subs ?? []).map((s) => (
          <li key={s.id} data-kid={s.kids?.username}>
            <Card>
              <p className="font-extrabold">{s.kids?.first_name}{s.kids?.last_initial ? ` ${s.kids.last_initial}.` : ""}</p>
              <p className="my-2 whitespace-pre-wrap">{s.body}</p>
              {s.grade !== null ? <p className="font-bold">Marked: {s.grade}/100{s.feedback ? ` · ${s.feedback}` : ""}</p> : null}
              <ActionForm action={gradeSubmission.bind(null, slug, id, s.id)} className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-end">
                <Field label="Mark /100" name="grade" type="number" min={0} max={100} required defaultValue={s.grade ?? undefined} />
                <Field label="Feedback" name="feedback" maxLength={1000} defaultValue={s.feedback ?? undefined} />
                <Submit variant="outline">Save mark</Submit>
              </ActionForm>
            </Card>
          </li>
        ))}
        {(subs ?? []).length === 0 ? <li className="text-sm text-muted">Nothing handed in yet.</li> : null}
      </ul>
    </AdultShell>
  );
}

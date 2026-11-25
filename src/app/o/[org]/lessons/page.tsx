import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ClassSelect } from "@/components/class-select";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Pill } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { createLesson, setLessonStatus } from "@/features/classlife/server/actions";

export const metadata = { title: "Lessons" };

export default async function LessonsPage({ params }: PageProps<"/o/[org]/lessons">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const [{ data: classes }, { data: lessons }, { data: o }] = await Promise.all([
    supabase.from("classes").select("id, name").eq("organization_id", org.id).eq("archived", false).order("name"),
    supabase.from("lessons").select("id, title, status, lesson_date, classes(name)").eq("organization_id", org.id).order("created_at", { ascending: false }),
    supabase.from("organizations").select("faith_mode").eq("id", org.id).single(),
  ]);
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="lessons" />
      <h1 className="font-display text-3xl font-extrabold">Lessons</h1>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">New lesson</h2>
        <ActionForm action={createLesson.bind(null, slug)} className="flex flex-col gap-3">
          <Field label="Title" name="title" required maxLength={120} />
          <label className="flex flex-col gap-1.5 text-sm font-bold">What kids will read
            <textarea name="body" maxLength={10000} rows={5} className="rounded-[12px] border border-line bg-surface p-3 text-base font-normal" />
          </label>
          {o?.faith_mode ? <Field label="Memory verse (optional)" name="memoryVerse" maxLength={400} /> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Date (optional)" name="lessonDate" type="date" />
            <ClassSelect classes={classes ?? []} />
          </div>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="publish" className="h-5 w-5" /> Publish now so kids can see it</label>
          <div><Submit>Save lesson</Submit></div>
        </ActionForm>
      </Card>
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="lesson-list">
          {(lessons ?? []).map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-2 py-3">
              <span className="font-extrabold">{l.title}</span>
              <span className="text-sm text-muted">{l.classes?.name ?? "Whole club"}{l.lesson_date ? ` · ${l.lesson_date}` : ""}</span>
              <Pill tone={l.status === "published" ? "ok" : "neutral"}>{l.status}</Pill>
              <form action={setLessonStatus.bind(null, slug, l.id, l.status === "published" ? "draft" : "published")} className="ml-auto">
                <button type="submit" className="min-h-11 text-sm font-extrabold underline">{l.status === "published" ? "Unpublish" : "Publish"}</button>
              </form>
            </li>
          ))}
          {(lessons ?? []).length === 0 ? <li className="py-3 text-sm text-muted">No lessons yet.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}

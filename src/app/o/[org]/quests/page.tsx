import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Select } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { addQuestStep, createQuest } from "@/features/delight/server/actions";

export const metadata = { title: "Quests" };

export default async function QuestsAdminPage({ params }: PageProps<"/o/[org]/quests">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const [{ data: quests }, { data: steps }] = await Promise.all([
    supabase.from("quests").select("id, title, summary").eq("organization_id", org.id).order("created_at"),
    supabase.from("quest_steps").select("id, quest_id, position, title").eq("organization_id", org.id).order("position"),
  ]);
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="quests" />
      <h1 className="font-display text-3xl font-extrabold">Quests</h1>
      <p className="max-w-2xl text-sm text-muted">Kids already have the Champzz quests. Make your own here: a short story or lesson in steps, each ending with a checkpoint question.</p>
      <Card>
        <ActionForm action={createQuest.bind(null, slug)} className="grid gap-3 sm:grid-cols-2">
          <Field label="Quest title" name="title" required maxLength={80} />
          <Field label="One-line summary (optional)" name="summary" maxLength={200} />
          <div className="sm:col-span-2"><Submit>Create quest</Submit></div>
        </ActionForm>
      </Card>
      {(quests ?? []).map((q) => (
        <Card key={q.id}>
          <h2 className="text-lg font-extrabold">{q.title}</h2>
          <ol className="my-2 list-decimal pl-6 text-sm">{(steps ?? []).filter((s) => s.quest_id === q.id).map((s) => <li key={s.id}>{s.title}</li>)}</ol>
          <details>
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-extrabold underline">Add a step</summary>
            <ActionForm action={addQuestStep.bind(null, slug, q.id)} className="grid gap-3 pt-2 sm:grid-cols-2">
              <Field label="Step title" name="title" required maxLength={80} />
              <Field label="Checkpoint question" name="prompt" required maxLength={200} />
              <label className="flex flex-col gap-1.5 text-sm font-bold sm:col-span-2">What kids will read
                <textarea name="body" required maxLength={2000} rows={4} className="rounded-[12px] border border-line bg-surface p-3 text-base font-normal" />
              </label>
              <Field label="Answer 1" name="a" required maxLength={120} />
              <Field label="Answer 2" name="b" required maxLength={120} />
              <Field label="Answer 3" name="c" required maxLength={120} />
              <Select label="Right answer" name="answer" defaultValue="0"><option value="0">Answer 1</option><option value="1">Answer 2</option><option value="2">Answer 3</option></Select>
              <div className="sm:col-span-2"><Submit>Add step</Submit></div>
            </ActionForm>
          </details>
        </Card>
      ))}
    </AdultShell>
  );
}

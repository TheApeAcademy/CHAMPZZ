import { notFound } from "next/navigation";
import { z } from "zod";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Select } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { TIERS } from "@/features/games/meta";
import { addQuestion, deleteQuestion } from "@/features/games/server/actions";

export const metadata = { title: "Question pack" };

export default async function PackPage({ params }: PageProps<"/o/[org]/quiz/bank/[pack]">) {
  const { org: slug, pack: packId } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!z.uuid().safeParse(packId).success) notFound();
  const supabase = await supabaseServer();
  const { data: pack } = await supabase.from("question_packs").select("id, name, organization_id").eq("id", packId).maybeSingle();
  if (!pack || (pack.organization_id && pack.organization_id !== org.id)) notFound();
  const mine = pack.organization_id === org.id;
  const { data: qs } = await supabase.from("questions").select("id, tier, prompt, choices, answer_index").eq("pack_id", pack.id).order("tier").order("created_at");
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="quiz" />
      <h1 className="font-display text-3xl font-extrabold">{pack.name}</h1>
      <p className="text-sm text-muted">{(qs ?? []).length} questions. A match needs at least one question per team at each level; Training Ground needs 5 or more.</p>
      {mine ? (
        <Card>
          <h2 className="mb-3 text-lg font-extrabold">Add a question</h2>
          <ActionForm action={addQuestion.bind(null, slug, pack.id)} className="grid gap-3 sm:grid-cols-2">
            <Select label="Level" name="tier" defaultValue="1">{TIERS.map((t) => <option key={t.tier} value={t.tier}>{t.name} ({t.points})</option>)}</Select>
            <Field label="Question" name="prompt" required maxLength={300} />
            <Field label="Answer A" name="a" required maxLength={120} />
            <Field label="Answer B" name="b" required maxLength={120} />
            <Field label="Answer C" name="c" required maxLength={120} />
            <Field label="Answer D" name="d" required maxLength={120} />
            <Select label="Right answer" name="answer" defaultValue="0"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></Select>
            <Field label="Why (optional, shown after)" name="explanation" maxLength={300} />
            <div className="sm:col-span-2"><Submit>Add question</Submit></div>
          </ActionForm>
        </Card>
      ) : <p className="rounded-[12px] bg-[#DDE5FF] p-3 text-sm font-bold text-[#1A2C80]">This is a Champzz pack. You can play it, but not edit it. Make your own pack to add questions.</p>}
      <Card>
        <ol className="flex flex-col divide-y divide-line" data-testid="question-list">
          {(qs ?? []).map((q) => (
            <li key={q.id} className="flex flex-wrap items-start gap-2 py-3">
              <span className="rounded-full bg-cream px-2 py-0.5 text-xs font-extrabold">{TIERS[q.tier - 1]?.name}</span>
              <span className="flex-1"><strong>{q.prompt}</strong><span className="block text-sm text-muted">Answer: {q.choices[q.answer_index]}</span></span>
              {mine ? <form action={deleteQuestion.bind(null, slug, pack.id, q.id)}><button type="submit" className="min-h-11 text-sm font-extrabold underline">Delete</button></form> : null}
            </li>
          ))}
        </ol>
      </Card>
    </AdultShell>
  );
}

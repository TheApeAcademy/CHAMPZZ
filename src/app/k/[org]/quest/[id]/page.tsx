import { notFound } from "next/navigation";
import { z } from "zod";
import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";
import { QuestStep } from "@/features/delight/components/quest-step";

export const metadata = { title: "Quest" };

export default async function QuestPage({ params }: PageProps<"/k/[org]/quest/[id]">) {
  const { org, id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const k = await getKidSnapshot(org);
  const supabase = await supabaseServer();
  const { data: quest } = await supabase.from("quests").select("id, title").eq("id", id).maybeSingle();
  if (!quest) notFound();
  const [{ data: steps }, { data: done }] = await Promise.all([
    supabase.from("quest_steps").select("id, position, title, body, check_prompt, check_choices").eq("quest_id", id).order("position"),
    supabase.from("quest_progress").select("step_id").eq("kid_id", k.kidId),
  ]);
  const doneSet = new Set((done ?? []).map((d) => d.step_id));
  const current = (steps ?? []).find((s) => !doneSet.has(s.id));
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">{quest.title}</h1>
      <ol className="flex flex-col gap-3" data-testid="quest-steps">
        {(steps ?? []).map((s) => {
          const passed = doneSet.has(s.id);
          const isCurrent = current?.id === s.id;
          return (
            <li key={s.id} className={`flex flex-col gap-2 rounded-[20px] p-4 ${passed ? "bg-[#E8F5EE]" : isCurrent ? "bg-surface" : "bg-surface opacity-60"}`} data-step={s.position} data-done={passed ? "yes" : "no"}>
              <p className="font-extrabold">Step {s.position}: {s.title}{passed ? " (done)" : ""}</p>
              {passed || isCurrent ? <p className="whitespace-pre-wrap">{s.body}</p> : <p className="text-sm text-muted">Finish the step before this one to open it.</p>}
              {isCurrent ? <QuestStep stepId={s.id} prompt={s.check_prompt} choices={s.check_choices} /> : null}
            </li>
          );
        })}
      </ol>
      {!current && (steps ?? []).length > 0 ? <p className="rounded-[20px] bg-gold p-4 text-center font-extrabold" data-testid="quest-complete">Quest complete. Champ!</p> : null}
    </KidShell>
  );
}

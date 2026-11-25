import Link from "next/link";
import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Quest" };

export default async function QuestListPage({ params }: PageProps<"/k/[org]/quest">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  const supabase = await supabaseServer();
  const [{ data: quests }, { data: steps }, { data: done }] = await Promise.all([
    supabase.from("quests").select("id, title, summary, organization_id, sort").order("sort").order("title"),
    supabase.from("quest_steps").select("id, quest_id"),
    supabase.from("quest_progress").select("step_id").eq("kid_id", k.kidId),
  ]);
  const doneSet = new Set((done ?? []).map((d) => d.step_id));
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">{k.org.faithMode ? "Faith Quest" : "Quest"}</h1>
      <p className="-mt-2 text-sm text-muted">Short stories with a checkpoint at the end of each step. Every checkpoint you pass is worth 10 Champ Points.</p>
      <ul className="flex flex-col gap-3" data-testid="quest-list">
        {(quests ?? []).map((q) => {
          const mine = (steps ?? []).filter((s) => s.quest_id === q.id);
          const n = mine.filter((s) => doneSet.has(s.id)).length;
          return (
            <li key={q.id}>
              <Link href={`/k/${org}/quest/${q.id}`} className="flex flex-col gap-1 rounded-[20px] bg-surface p-4">
                <span className="font-extrabold">{q.title}</span>
                {q.summary ? <span className="text-sm text-muted">{q.summary}</span> : null}
                <span className="text-xs font-bold">{n === mine.length && mine.length > 0 ? "Complete!" : `${n} of ${mine.length} steps`}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </KidShell>
  );
}

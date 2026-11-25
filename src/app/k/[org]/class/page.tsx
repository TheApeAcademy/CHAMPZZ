import { KidShell } from "@/features/kids/components/kid-shell";
import { ActionForm } from "@/components/ui/action-form";
import { Submit } from "@/components/ui/submit";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";
import { submitWork } from "@/features/classlife/server/actions";

export const metadata = { title: "My Class" };

export default async function KidClassPage({ params }: PageProps<"/k/[org]/class">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  const supabase = await supabaseServer();
  const [{ data: lessons }, { data: work }, { data: subs }] = await Promise.all([
    supabase.from("lessons").select("id, title, body, memory_verse, lesson_date, take_home_talk, take_home_do").order("created_at", { ascending: false }).limit(20),
    supabase.from("assignments").select("id, title, instructions, due_date, status").order("created_at", { ascending: false }).limit(20),
    supabase.from("submissions").select("assignment_id, body, grade, feedback").eq("kid_id", k.kidId),
  ]);
  const mine = new Map((subs ?? []).map((s) => [s.assignment_id, s]));
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">My Class</h1>
      <p className="text-sm font-bold text-muted">{k.className ?? "Your club"}</p>
      <h2 className="text-xl font-extrabold">Class work</h2>
      <ul className="flex flex-col gap-3" data-testid="kid-assignments">
        {(work ?? []).map((a) => {
          const s = mine.get(a.id);
          return (
            <li key={a.id} className="flex flex-col gap-2 rounded-[20px] bg-surface p-4">
              <p className="font-extrabold">{a.title}</p>
              {a.instructions ? <p className="whitespace-pre-wrap text-sm">{a.instructions}</p> : null}
              {a.due_date ? <p className="text-xs font-bold text-muted">Due {a.due_date}</p> : null}
              {s?.grade !== undefined && s?.grade !== null ? (
                <p className="rounded-[12px] bg-gold p-3 font-extrabold" data-testid="kid-grade">Marked: {s.grade}/100{s.feedback ? ` · ${s.feedback}` : ""}</p>
              ) : a.status === "published" ? (
                <ActionForm action={submitWork.bind(null, org, a.id)} className="flex flex-col gap-2">
                  <label className="flex flex-col gap-1 text-sm font-bold">{s ? "Change your answer" : "Your answer"}
                    <textarea name="body" required maxLength={4000} rows={3} defaultValue={s?.body} className="rounded-[12px] border border-line bg-cream p-2 text-base font-normal" />
                  </label>
                  <Submit>{s ? "Update" : "Hand it in"}</Submit>
                </ActionForm>
              ) : <p className="text-sm text-muted">Closed.</p>}
            </li>
          );
        })}
        {(work ?? []).length === 0 ? <li className="text-sm text-muted">No class work right now.</li> : null}
      </ul>
      <h2 className="text-xl font-extrabold">Lessons</h2>
      <ul className="flex flex-col gap-3" data-testid="kid-lessons">
        {(lessons ?? []).map((l) => (
          <li key={l.id} className="flex flex-col gap-2 rounded-[20px] bg-surface p-4">
            <p className="font-extrabold">{l.title}</p>
            {l.lesson_date ? <p className="text-xs font-bold text-muted">{l.lesson_date}</p> : null}
            {l.body ? <p className="whitespace-pre-wrap text-sm">{l.body}</p> : null}
            {l.memory_verse ? <p className="rounded-[12px] bg-cream p-3 text-sm font-bold">Memory verse: {l.memory_verse}</p> : null}
            {l.take_home_talk || l.take_home_do ? (
              <div className="rounded-[12px] border-2 border-dashed border-gold p-3 text-sm">
                <p className="font-extrabold">Take it home</p>
                {l.take_home_talk ? <p>Ask your family: {l.take_home_talk}</p> : null}
                {l.take_home_do ? <p>Do together: {l.take_home_do}</p> : null}
              </div>
            ) : null}
          </li>
        ))}
        {(lessons ?? []).length === 0 ? <li className="text-sm text-muted">No lessons yet.</li> : null}
      </ul>
    </KidShell>
  );
}

import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";
import { VerseRecorder } from "@/features/delight/components/verse-recorder";

export const metadata = { title: "Record-a-verse" };

export default async function VersePage({ params }: PageProps<"/k/[org]/verse">) {
  const { org } = await params;
  const k = await getKidSnapshot(org, { clubOnly: true });
  const supabase = await supabaseServer();
  const [{ data: lesson }, { data: mine }] = await Promise.all([
    supabase.from("lessons").select("id, title, memory_verse").not("memory_verse", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("verse_recordings").select("id, status, created_at").eq("kid_id", k.kidId).order("created_at", { ascending: false }).limit(10),
  ]);
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">Record-a-verse</h1>
      {!k.org.faithMode ? <p className="rounded-[20px] bg-surface p-4 font-bold">Record-a-verse is not switched on at your club.</p> : (
        <>
          {lesson?.memory_verse ? (
            <section className="rounded-[20px] bg-ink p-4 text-cream" data-testid="memory-verse">
              <p className="text-xs font-extrabold uppercase tracking-widest text-gold">This week&apos;s memory verse</p>
              <p className="text-lg font-bold">{lesson.memory_verse}</p>
            </section>
          ) : <p className="text-sm text-muted">Say any verse you have learned. Your teacher will listen.</p>}
          <VerseRecorder slug={org} lessonId={lesson?.id ?? null} />
          <ul className="flex flex-col gap-2" data-testid="my-recordings">
            {(mine ?? []).map((r) => (
              <li key={r.id} className="rounded-[14px] bg-surface p-3 text-sm font-bold">{new Date(r.created_at).toLocaleDateString("en-GB")} · {r.status === "heard" ? "Your teacher listened!" : "Waiting for your teacher"}</li>
            ))}
          </ul>
        </>
      )}
    </KidShell>
  );
}

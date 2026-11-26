import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";
import { markReadingDay } from "@/features/delight/server/parity-actions";

export const metadata = { title: "Reading plans" };

export default async function ReadingPage({ params }: PageProps<"/k/[org]/reading">) {
  const { org } = await params;
  const k = await getKidSnapshot(org, { clubOnly: true });
  const supabase = await supabaseServer();
  const [{ data: plans }, { data: days }, { data: done }] = await Promise.all([
    supabase.from("reading_plans").select("id, title, summary").order("created_at"),
    supabase.from("reading_plan_days").select("id, plan_id, day, reference, summary").order("day"),
    supabase.from("reading_progress").select("day_id").eq("kid_id", k.kidId),
  ]);
  const doneSet = new Set((done ?? []).map((d) => d.day_id));
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">Reading plans</h1>
      {!k.org.faithMode ? <p className="rounded-[20px] bg-surface p-4 font-bold">Reading plans are not switched on at your club.</p> : (
        <>
          <p className="-mt-2 text-sm text-muted">Read the passage in your Bible, then tick it off. 5 Champ Points a day, and a certificate when you finish a plan.</p>
          {(plans ?? []).map((p) => {
            const mine = (days ?? []).filter((d) => d.plan_id === p.id);
            const n = mine.filter((d) => doneSet.has(d.id)).length;
            return (
              <section key={p.id} className="flex flex-col gap-2 rounded-[20px] bg-surface p-4" data-testid={`plan-${p.title}`}>
                <h2 className="font-extrabold">{p.title} <span className="text-sm font-bold text-muted">({n} of {mine.length})</span></h2>
                <ol className="flex flex-col gap-2">
                  {mine.map((d) => (
                    <li key={d.id} className={`flex items-center gap-3 rounded-[14px] p-3 ${doneSet.has(d.id) ? "bg-[#E8F5EE]" : "bg-cream"}`}>
                      <span className="flex-1"><strong>Day {d.day}: {d.reference}</strong><span className="block text-sm">{d.summary}</span></span>
                      {doneSet.has(d.id) ? <span className="text-sm font-extrabold">Read!</span> : (
                        <form action={markReadingDay.bind(null, org, d.id)}><button type="submit" className="min-h-11 rounded-full bg-brand px-4 text-sm font-extrabold text-white">I read it</button></form>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </>
      )}
    </KidShell>
  );
}

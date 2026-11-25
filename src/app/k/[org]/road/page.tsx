import { KidShell } from "@/features/kids/components/kid-shell";
import { ActionForm } from "@/components/ui/action-form";
import { Submit } from "@/components/ui/submit";
import { getKidSnapshot } from "@/features/kids/server/data";
import { usablePacks } from "@/features/games/server/data";
import { startTraining } from "@/features/games/server/actions";

export const metadata = { title: "Road to Champ" };

export default async function RoadPage({ params }: PageProps<"/k/[org]/road">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  const packs = await usablePacks(k.org.id, k.org.faithMode);
  return (
    <KidShell slug={org} clubName={k.org.name} active="games" little={k.little}>
      <section className="rounded-[24px] bg-ink p-5 text-cream">
        <p className="text-xs font-extrabold uppercase tracking-widest text-gold">Training Ground</p>
        <h1 className="font-display text-3xl font-black italic uppercase">Road to Champ</h1>
        <p className="mt-1 text-sm">Ten questions: two at every level from Rookie to Champ. You have 20 seconds on the Shot Clock for each, and one Half Time per round to take away two wrong answers.</p>
      </section>
      <h2 className="text-lg font-extrabold">Pick your questions</h2>
      <ul className="flex flex-col gap-3" data-testid="pack-list">
        {packs.map((p) => (
          <li key={p.id}>
            <ActionForm action={startTraining.bind(null, org)} className="flex items-center justify-between gap-3 rounded-[20px] bg-surface p-4">
              <input type="hidden" name="pack" value={p.id} />
              <span className="font-extrabold">{p.name}{p.organization_id ? <span className="block text-xs font-bold text-muted">From your club</span> : null}</span>
              <Submit>Play</Submit>
            </ActionForm>
          </li>
        ))}
      </ul>
    </KidShell>
  );
}

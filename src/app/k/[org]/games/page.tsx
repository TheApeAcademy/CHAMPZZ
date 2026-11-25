import Link from "next/link";
import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { ARENA } from "@/features/games/meta";

export const metadata = { title: "Games" };

export default async function GamesPage({ params }: PageProps<"/k/[org]/games">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  const faith = k.org.faithMode;
  return (
    <KidShell slug={org} clubName={k.org.name} active="games" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">Games</h1>
      <Link href={`/k/${org}/road`} className="flex flex-col gap-1 rounded-[24px] bg-ink p-5 text-cream" data-testid="road-tile">
        <span className="text-xs font-extrabold uppercase tracking-widest text-gold">Training Ground</span>
        <span className="font-display text-2xl font-black italic uppercase">Road to Champ</span>
        <span className="text-sm">Climb from Rookie to Champ. Ten questions, a Shot Clock and one Half Time.</span>
      </Link>
      <h2 className="font-display text-xl font-black italic uppercase">The Arena</h2>
      <p className="-mt-2 text-sm text-muted">Each game earns Champ Points once a day. Play as much as you like!</p>
      <ul className={k.little ? "flex flex-col gap-3" : "grid grid-cols-2 gap-3"}>
        {ARENA.map((g) => (
          <li key={g.key}>
            <Link href={`/k/${org}/arena/${g.key}`} className={`flex h-full min-h-28 flex-col justify-between gap-2 rounded-[20px] p-4 ${g.color}`} data-testid={`arena-${g.key}`}>
              <span className="font-extrabold">{faith ? g.faithName : g.name}</span>
              <span className="text-xs">{g.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </KidShell>
  );
}

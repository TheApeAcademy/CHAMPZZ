import { KidShell } from "@/features/kids/components/kid-shell";
import { ChampAvatar } from "@/features/kids/components/champ-avatar";
import { Logo } from "@/components/ui/logo";
import { getKidSnapshot } from "@/features/kids/server/data";
import { PrintButton } from "@/components/ui/print-button";

export const metadata = { title: "Champ Card" };

export default async function ChampCardPage({ params }: PageProps<"/k/[org]/card">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  return (
    <KidShell slug={org} clubName={k.org.name} active="me" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase print:hidden">Champ Card</h1>
      <article data-testid="champ-card" className="flex flex-col gap-4 rounded-[28px] border-[3px] border-ink bg-surface p-5 shadow-[6px_6px_0_var(--gold)]">
        <div className="flex items-center justify-between"><Logo size={22} /><span className="text-xs font-extrabold text-muted">{k.org.name}</span></div>
        <div className="flex items-center gap-4">
          <ChampAvatar a={k.avatar} level={k.level.sort} size={96} />
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl font-black italic uppercase">{k.firstName}</p>
            <p className="text-sm font-bold">{k.username}</p>
            <span className="self-start rounded-full bg-gold px-3 py-0.5 text-xs font-extrabold">{k.level.name}</span>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[14px] bg-cream p-2"><dt className="text-[11px] font-bold text-muted">Points</dt><dd className="font-extrabold">{k.points}</dd></div>
          <div className="rounded-[14px] bg-cream p-2"><dt className="text-[11px] font-bold text-muted">Best streak</dt><dd className="font-extrabold">{k.streakBest}</dd></div>
          <div className="rounded-[14px] bg-cream p-2"><dt className="text-[11px] font-bold text-muted">Stars</dt><dd className="font-extrabold">{k.stars}</dd></div>
        </dl>
        {k.className ? <p className="text-sm font-bold text-muted">Class: {k.className}</p> : null}
      </article>
      <div className="print:hidden"><PrintButton>Print my card</PrintButton></div>
    </KidShell>
  );
}

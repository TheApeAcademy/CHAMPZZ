import Link from "next/link";
import { KidShell } from "@/features/kids/components/kid-shell";
import { ChampAvatar } from "@/features/kids/components/champ-avatar";
import { getKidSnapshot } from "@/features/kids/server/data";

export const metadata = { title: "Champ Town" };

const LIVE_TILES = [
  { title: "My Class", path: "class", cls: "bg-brand text-white" },
  { title: "Quest", path: "quest", cls: "bg-[#E8F5EE] text-ink" },
  { title: "Reading plans", path: "reading", cls: "bg-surface text-ink border-2 border-line", faithOnly: true },
  { title: "Record-a-verse", path: "verse", cls: "bg-gold text-ink", faithOnly: true },
  { title: "Champ Buddy", path: "buddy", cls: "bg-coral text-ink" },
  { title: "Messages", path: "messages", cls: "bg-surface text-ink border-2 border-line" },
  { title: "My Journal", path: "journal", cls: "bg-surface text-ink border-2 border-line" },
  { title: "My Stuff", path: "stuff", cls: "bg-brand text-white" },
  { title: "Collection", path: "collection", cls: "bg-gold text-ink" },
  { title: "Events", path: "events", cls: "bg-gold text-ink" },
  { title: "Trophies", path: "trophies", cls: "bg-gold text-ink" },
  { title: "Hall of Champs", path: "hall", cls: "bg-surface text-ink border-2 border-line" },
  { title: "My Champ", path: "my-champ", cls: "bg-coral text-ink" },
  { title: "Champ Card", path: "card", cls: "bg-ink text-white" },
];
const SOON_TILES = [
  { title: "Road to Champ", faith: false },
  { title: "The Arena", faith: false },
  { title: "Faith Quest", faith: true },
];

export default async function KidHomePage({ params }: PageProps<"/k/[org]/home">) {
  const { org } = await params;
  const k = await getKidSnapshot(org, { recordVisit: true });
  const span = k.next ? k.next.min_points - k.level.min_points : 1;
  const pct = k.next ? Math.max(2, Math.round(((k.points - k.level.min_points) / span) * 100)) : 100;
  const soon = SOON_TILES.filter((t) => !t.faith || k.org.faithMode);
  const big = k.little;

  return (
    <KidShell slug={org} clubName={k.org.name} active="home" little={k.little}>
      <section className={`flex flex-col gap-3 rounded-[28px] bg-brand p-5 text-white ${big ? "border-[3px] border-ink shadow-[5px_5px_0_var(--ink)]" : ""}`}>
        <div className="flex items-center gap-3">
          <ChampAvatar a={k.avatar} level={k.level.sort} size={big ? 92 : 76} />
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-3xl font-black italic uppercase" data-testid="kid-greeting">Hi, {k.firstName}!</h1>
            <span className="self-start rounded-full bg-gold px-3 py-0.5 text-sm font-extrabold text-ink" data-testid="kid-level">{k.level.name}</span>
          </div>
        </div>
        <div className="flex justify-between text-sm font-extrabold">
          <span data-testid="kid-points">{k.points} Champ Points</span>
          <span>{k.next ? `${k.next.min_points - k.points} to ${k.next.name}` : "Top level!"}</span>
        </div>
        <div className="h-3 rounded-full bg-white/25" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level">
          <div className="h-3 rounded-full bg-gold" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-[20px] bg-coral p-4 font-extrabold text-ink">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 3 3 3 0-3-1-5 0-8z" /></svg>
          <span><span className="block text-2xl" data-testid="kid-streak">{k.streak}</span>day Fire Streak</span>
        </div>
        <Link href={`/k/${org}/trophies`} className="flex items-center gap-2 rounded-[20px] bg-gold p-4 font-extrabold text-ink">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /></svg>
          <span><span className="block text-2xl" data-testid="kid-trophies">{k.trophies}</span>Trophies</span>
        </Link>
      </div>

      {!k.confirmed ? <p className="rounded-[14px] bg-[#FCEBC4] px-4 py-2 text-sm font-bold text-[#5A3F00]">Welcome! Your teacher will say hi at your first visit.</p> : null}

      <Link href={`/k/${org}/talk`} className="flex items-center gap-3 rounded-[20px] border-2 border-[#9CC8B0] bg-[#E8F5EE] p-4 text-ink" data-testid="talk-tile">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E6B47" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
        <span><span className="block font-extrabold">Talk to Someone</span><span className="text-sm">Worried or upset? Tell a trusted adult. You can stay anonymous.</span></span>
      </Link>

      <div className={big ? "flex flex-col gap-4" : "grid grid-cols-2 gap-3"}>
        {LIVE_TILES.filter((t) => !("faithOnly" in t) || k.org.faithMode).map((t) => (
          <Link key={t.title} href={`/k/${org}/${t.path}`} className={`${t.cls} flex ${big ? "h-24 border-[3px] border-ink shadow-[5px_5px_0_var(--ink)]" : "h-28"} items-end rounded-[24px] p-4`}>
            <span className="font-display text-xl font-black italic uppercase leading-tight">{t.title}</span>
          </Link>
        ))}
        {soon.map((t) => (
          <div key={t.title} className={`flex ${big ? "h-24" : "h-28"} flex-col justify-end rounded-[24px] border-2 border-dashed border-line bg-surface p-4 text-muted`}>
            <span className="font-display text-lg font-black italic uppercase leading-tight">{t.title}</span>
            <span className="text-xs font-bold">Coming soon</span>
          </div>
        ))}
      </div>
    </KidShell>
  );
}

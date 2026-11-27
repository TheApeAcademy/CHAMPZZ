import Link from "next/link";
import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { ARENA } from "@/features/games/meta";
import { ARENA_STYLE, ArenaIcon } from "@/features/games/components/arena-art";

export const metadata = { title: "Games" };

/** Champ Arena lobby (Claude Design, Champ Arena): Road to Champ, then the six games. */
export default async function GamesPage({ params }: PageProps<"/k/[org]/games">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  const faith = k.org.faithMode;
  return (
    <KidShell slug={org} clubName={k.org.name} active="games" little={k.little} dark>
      <div className="pointer-events-none fixed inset-0 -z-0 [background:radial-gradient(ellipse_60%_40%_at_80%_0%,rgba(47,91,255,.28),transparent_70%),radial-gradient(ellipse_50%_40%_at_0%_100%,rgba(107,44,145,.3),transparent_70%)]" aria-hidden="true" />
      <section className="relative flex flex-col gap-3 pt-2">
        <span className="self-start rounded-full bg-coral px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-ink">Champ Arena</span>
        <h1 className="cz-display text-[clamp(52px,15vw,104px)] leading-[.84] [text-shadow:0_6px_30px_rgba(47,91,255,.45)]">
          Play. Learn.<br /><span className="text-gold">{faith ? "Hide it in your heart." : "Beat your best."}</span>
        </h1>
        {faith ? (
          <figure className="flex flex-col gap-1.5 rounded-[20px] border border-white/10 bg-white/[.05] px-5 py-4">
            <figcaption className="text-[11px] font-black uppercase tracking-[.16em] text-gold">Arena verse</figcaption>
            <blockquote className="text-xl font-bold leading-snug">&ldquo;Thy word have I hid in mine heart.&rdquo;</blockquote>
            <span className="text-sm font-extrabold text-[#A3A7C2]">Psalm 119:11</span>
          </figure>
        ) : null}
      </section>

      <Link href={`/k/${org}/road`} data-testid="road-tile"
        className="relative flex flex-wrap items-center gap-5 overflow-hidden rounded-[30px] border border-[rgba(255,216,77,.3)] p-5 text-cream shadow-[0_30px_60px_-30px_rgba(0,0,0,.9)] [background:radial-gradient(ellipse_60%_120%_at_85%_0%,rgba(107,44,145,.75),transparent_70%),radial-gradient(ellipse_50%_90%_at_10%_100%,rgba(242,179,61,.22),transparent_70%),#0B1026]">
        <span className="arena-float grid aspect-square w-24 flex-none place-items-center rounded-[28%] bg-[linear-gradient(155deg,#FFE066,#F0A400)] shadow-[inset_0_3px_0_rgba(255,255,255,.5),inset_0_-8px_0_rgba(0,0,0,.18),0_24px_44px_-14px_rgba(242,179,61,.7)]">
          <svg viewBox="0 0 64 64" width="70%" height="70%" fill="none" stroke="#0B1026" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M24 10h16v14a8 8 0 0 1-16 0z" fill="#FFF8EC" /><path d="M24 14h-6a6 6 0 0 0 6 8M40 14h6a6 6 0 0 1-6 8M32 32v8M24 46h16l-2-6H26z" /><path d="M20 46h24v6H20z" fill="#0B1026" /></svg>
        </span>
        <span className="flex min-w-0 flex-[1_1_220px] flex-col gap-1.5">
          <span className="self-start rounded-full bg-white/10 px-2.5 py-1 text-xs font-black uppercase tracking-[.1em] text-gold">Training Ground</span>
          <span className="cz-display text-[clamp(40px,11vw,64px)] leading-[.86]">Road to Champ</span>
          <span className="text-[15px] text-[#C9CBE0]">Climb from Rookie to Champ. Ten questions, a Shot Clock and one Half Time.</span>
        </span>
        <span className="inline-flex min-h-14 items-center gap-2 rounded-[18px] bg-[linear-gradient(180deg,#FFE066,#F0A400)] px-6 text-[17px] font-black text-ink shadow-[0_6px_0_#8A5A00]">
          Play<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg>
        </span>
      </Link>

      <h2 className="cz-display mt-2 text-[40px] text-cream">The Arena</h2>
      <p className="-mt-3 text-[15px] text-[#C9CBE0]">Each game earns Champ Points once a day. Play as much as you like!</p>
      <ul className={`grid gap-4 ${k.little ? "grid-cols-1" : "grid-cols-1 min-[440px]:grid-cols-2"}`}>
        {ARENA.map((g, i) => {
          const s = ARENA_STYLE[g.key];
          return (
            <li key={g.key}>
              <Link href={`/k/${org}/arena/${g.key}`} data-testid={`arena-${g.key}`}
                className="group relative flex min-h-[300px] flex-col justify-end gap-2 overflow-hidden rounded-[26px] border border-white/15 bg-ink p-[18px] text-cream shadow-[0_30px_50px_-30px_rgba(0,0,0,.9)] transition-transform duration-300 hover:-translate-y-2">
                <span aria-hidden="true" className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 30%, ${s.color}55, transparent 62%), radial-gradient(circle, rgba(255,248,236,.06) 0 1.5px, transparent 2.5px) 0 0/20px 20px` }} />
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[5px]" style={{ background: s.color }} />
                <span className="absolute inset-x-0 top-12 flex justify-center" style={{ animationDelay: `${i * 0.3}s` }}><ArenaIcon game={g.key} size="44%" /></span>
                <span className="absolute left-4 top-4 rounded-full bg-[rgba(7,11,28,.7)] px-2.5 py-1 text-xs font-black tracking-[.06em] backdrop-blur-sm">{s.tag}</span>
                <span className="cz-display relative text-[clamp(32px,9vw,42px)] leading-[.88]">{faith ? g.faithName : g.name}</span>
                <span className="relative text-sm leading-snug text-[#C9CBE0]">{faith ? s.faithBody : g.blurb}</span>
                <span className="relative mt-1.5 flex items-center justify-between gap-2.5">
                  <span className="text-[13px] font-extrabold text-gold">{faith ? s.verseRef : "+ Champ Points"}</span>
                  <span className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-cream px-4 text-sm font-black text-ink">Play<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg></span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="flex flex-col gap-3 rounded-[24px] border border-white/20 bg-[linear-gradient(160deg,#2F5BFF,#1D3BB8)] p-5">
        <span className="text-[11px] font-black uppercase tracking-[.16em] text-[#FFE6B8]">Fair play</span>
        <p className="font-display text-[26px] font-extrabold leading-[1.1] [font-stretch:70%]">Every game earns points for you and your class.</p>
        <p className="text-sm text-[#DDE4FF]">Play each game as often as you like. Your points count once a day, so practising is always worth it.</p>
        {faith ? <span className="text-sm font-extrabold text-[#FFE6B8]">&ldquo;Whatsoever ye do, do it heartily.&rdquo; Colossians 3:23</span> : null}
        <Link href={`/k/${org}/hall`} className="inline-flex min-h-11 items-center self-start rounded-full bg-cream px-5 text-[15px] font-black text-ink">See the Hall of Champs</Link>
      </section>
    </KidShell>
  );
}

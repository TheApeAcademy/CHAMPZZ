import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Champ Town's full-bleed village map (Claude Design, Champ Town Village).
 * Each building is a real link into a Champ Town page. x/y is the building's
 * ground point on the map art (bottom-centre of the sprite) in percent, width
 * is a percent of the map width. Art: docs/ASSETS.md.
 */
export type VillageSpot = { key: string; label: string; path: string; image: string; x: number; y: number; width: number; tilt: number };

const ART = "/placeholders/landing";

export function villageSpots(faith: boolean, home: boolean): VillageSpot[] {
  const all: VillageSpot[] = [
    { key: "class", label: "My Class", path: "class", image: `${ART}/village-class-house1.webp`, x: 34, y: 18, width: 30, tilt: -4 },
    { key: "messages", label: "My Teacher", path: "messages", image: `${ART}/village-messages-teacherhome.webp`, x: 75, y: 17, width: 27, tilt: 4 },
    { key: "talk", label: "Talk to Someone", path: "talk", image: `${ART}/village-ears-hearttree.webp`, x: 14, y: 25, width: 13, tilt: -5 },
    { key: "games", label: "The Arena", path: "games", image: `${ART}/village-game-rocket.webp`, x: 73, y: 31, width: 16, tilt: -5 },
    { key: "card", label: "Champ Card", path: "card", image: `${ART}/village-profile-card.webp`, x: 38, y: 48, width: 16, tilt: -6 },
    { key: "quest", label: faith ? "Sunday School" : "Quest", path: faith ? "sunday" : "quest", image: `${ART}/village-bible-book.webp`, x: 81, y: 59, width: 22, tilt: 3 },
    { key: "home", label: "My House", path: "my-champ", image: `${ART}/village-home-brickbuilding.webp`, x: 33, y: 76, width: 40, tilt: 2 },
    { key: "hall", label: "Hall of Champs", path: "hall", image: `${ART}/feature-leaderboard.webp`, x: 79, y: 84, width: 15, tilt: 5 },
  ];
  // Kids at home have no club: no class, teacher or Talk to Someone inbox.
  return home ? all.filter((s) => !["class", "messages", "talk"].includes(s.key)) : all;
}

export function VillageMap({ slug, spots, avatar }: { slug: string; spots: VillageSpot[]; avatar: ReactNode }) {
  const house = spots.find((s) => s.key === "home");
  return (
    <section aria-label="Champ Town map" data-testid="village-map" className="relative mx-auto w-full max-w-[920px] shadow-[0_0_120px_40px_rgba(11,16,38,.4)]" style={{ aspectRatio: "24 / 43" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${ART}/kids-village-map.webp`} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" draggable={false} fetchPriority="high" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[60] overflow-hidden">
        <div className="village-cloud absolute left-0 top-[12%] h-20 w-[260px] rounded-[50%] bg-white/55 blur-[18px]" />
        <div className="village-cloud absolute left-0 top-[44%] h-[100px] w-[340px] rounded-[50%] bg-white/40 blur-[22px] [animation-delay:-40s] [animation-duration:85s]" />
        <div className="village-cloud absolute left-0 top-[72%] h-[70px] w-[220px] rounded-[50%] bg-white/45 blur-[18px] [animation-delay:-20s] [animation-duration:70s]" />
      </div>
      {spots.map((s) => (
        <div key={s.key} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.width}%`, zIndex: Math.round(s.y) }}>
          <div aria-hidden="true" className="absolute bottom-[-3%] left-[10%] right-[10%] h-[16%] rounded-[50%] [background:radial-gradient(ellipse_at_center,rgba(20,15,10,.45),transparent_70%)]" />
          <Link href={`/k/${slug}/${s.path}`} aria-label={s.label}
            className="village-sprite relative block w-full transition-[filter,scale] duration-300 hover:scale-[1.08] hover:brightness-110 active:scale-95"
            style={{ ["--tilt" as string]: `${s.tilt}deg`, animationDelay: `${(s.x / 20).toFixed(2)}s` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image} alt="" className="w-full object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,.4)]" draggable={false} loading="lazy" />
          </Link>
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink bg-[#FFF8EC] px-2.5 py-1 text-[clamp(9px,2.6vw,12px)] font-black uppercase tracking-[.06em] text-ink shadow-[0_4px_0_var(--ink)]">
            {s.label}
          </span>
        </div>
      ))}
      {house ? (
        <div className="pointer-events-none absolute z-[80] -translate-x-1/2" style={{ left: `${house.x + 8}%`, top: `${house.y - 22}%` }}>
          <div className="village-avatar overflow-hidden rounded-full border-4 border-cream shadow-[0_0_0_2.5px_var(--ink),0_10px_24px_rgba(0,0,0,.5)]">{avatar}</div>
        </div>
      ) : null}
    </section>
  );
}

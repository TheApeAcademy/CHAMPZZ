import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Champ Town's full-bleed village map, ported from CCT. Each building is a
 * real link into a Champ Town page. x/y is the building's ground point on the
 * map art (bottom-centre of the sprite), width is a percent of the map width
 * and heightPct is the sprite's rendered height as a percent of the map's.
 * Art is CCT placeholder art (docs/ASSETS.md): replace before launch.
 */
type Spot = { key: string; label: string; path: string; image: string; x: number; y: number; width: number; heightPct: number; tilt: number; accent: string };

const ART = "/placeholders/landing";

export function VillageMap({ slug, faith, avatar }: { slug: string; faith: boolean; avatar: ReactNode }) {
  const spots: Spot[] = [
    { key: "class", label: "My Class", path: "class", image: `${ART}/village-class-house1.webp`, x: 34, y: 18, width: 30, heightPct: 16.8, tilt: -4, accent: "#2f5bff" },
    { key: "hall", label: "Hall of Champs", path: "hall", image: `${ART}/feature-leaderboard.webp`, x: 77, y: 87, width: 16, heightPct: 11.5, tilt: 5, accent: "#f2b33d" },
    { key: "card", label: "My Card", path: "card", image: `${ART}/village-profile-card.webp`, x: 38, y: 48, width: 16, heightPct: 9.1, tilt: -6, accent: "#c13bff" },
    { key: "quest", label: faith ? "Bible Journey" : "Quest", path: "quest", image: `${ART}/village-bible-book.webp`, x: 81, y: 59, width: 22, heightPct: 13.0, tilt: 3, accent: "#7d2196" },
    { key: "home", label: "My House", path: "my-champ", image: `${ART}/village-home-brickbuilding.webp`, x: 33, y: 79, width: 42, heightPct: 21.3, tilt: 2, accent: "#ff5a3c" },
    { key: "talk", label: "Talk to Someone", path: "talk", image: `${ART}/village-ears-hearttree.webp`, x: 17, y: 20, width: 13, heightPct: 8.0, tilt: -5, accent: "#1e6b47" },
    { key: "games", label: "Games", path: "games", image: `${ART}/village-game-rocket.webp`, x: 73, y: 31, width: 16, heightPct: 8.7, tilt: -5, accent: "#e0531a" },
    { key: "messages", label: "My Teacher", path: "messages", image: `${ART}/village-messages-teacherhome.webp`, x: 75, y: 17, width: 27, heightPct: 13.4, tilt: 4, accent: "#0b1026" },
  ];
  const home = spots.find((s) => s.key === "home")!;

  return (
    <section aria-label="Champ Town map" className="-mx-4 overflow-hidden sm:mx-0 sm:rounded-[28px]" data-testid="village-map">
      <div className="relative w-full" style={{ aspectRatio: "24 / 43" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${ART}/kids-village-map.webp`} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        {spots.map((s) => (
          <div key={s.key} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.width}%` }}>
            <div
              aria-hidden="true"
              className="absolute rounded-[50%]"
              style={{ left: "50%", bottom: "-2%", width: "80%", height: "18%", transform: "translateX(-50%)", background: "radial-gradient(ellipse at center, rgba(20,15,10,.38) 0%, rgba(20,15,10,0) 72%)" }}
            />
            <Link
              href={`/k/${slug}/${s.path}`}
              aria-label={s.label}
              className="village-sprite relative block w-full transition-transform hover:scale-110 active:scale-95"
              style={{ ["--tilt" as string]: `${s.tilt}deg`, animationDelay: `${s.x / 20}s` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt="" className="w-full object-contain" style={{ filter: "drop-shadow(0 6px 8px rgba(0,0,0,.35))" }} draggable={false} />
            </Link>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-full mt-[2%] -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-ink shadow-md"
              style={{ borderBottom: `3px solid ${s.accent}` }}
            >
              {s.label}
            </span>
          </div>
        ))}
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: "58%", top: "42%" }}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-white/70 bg-black/30 text-xl" aria-hidden="true">🌍</span>
          <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-muted shadow-md">
            {faith ? "Bible World Map" : "World Map"}: soon
          </span>
        </div>
        <div className="village-avatar pointer-events-none absolute z-20 -translate-x-1/2" style={{ left: `${home.x}%`, top: `${home.y - home.heightPct - 6}%` }}>
          {avatar}
        </div>
      </div>
    </section>
  );
}

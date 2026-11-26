import Link from "next/link";
import { logoUrl, textOn } from "@/lib/branding";

export type ClubSummary = {
  slug: string; name: string; kind: string; faith_mode: boolean; logo_path: string | null;
  primary_color: string | null; tagline: string | null; city: string | null; country: string; demo: boolean; following?: boolean;
};

const KIND: Record<string, string> = { church: "Church", club: "Club", school: "School", other: "Group" };

/** One club in the directory: its colour, logo or initials, name, place and tagline. */
export function ClubCard({ club }: { club: ClubSummary }) {
  const color = club.primary_color ?? "#2F5BFF";
  const logo = logoUrl(club.logo_path);
  const initials = club.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <Link href={`/c/${club.slug}`} className="group flex flex-col overflow-hidden rounded-[24px] border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-lg" data-testid={`club-${club.slug}`}>
      <div className="flex items-center gap-3 p-4" style={{ background: color, color: textOn(color) }}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-12 w-12 rounded-[14px] bg-cream object-contain p-1" />
        ) : (
          <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/20 font-display text-lg font-black italic">{initials}</span>
        )}
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-black italic uppercase leading-tight">{club.name}</h2>
          <p className="text-xs font-extrabold opacity-90">{[KIND[club.kind] ?? "Group", club.city, club.country].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {club.tagline ? <p className="text-sm">{club.tagline}</p> : null}
        <div className="mt-auto flex flex-wrap gap-2 text-xs font-extrabold">
          {club.faith_mode ? <span className="rounded-full bg-[#FCEBC4] px-2.5 py-0.5 text-[#5A3F00]">Faith</span> : null}
          {club.demo ? <span className="rounded-full bg-cream px-2.5 py-0.5 text-muted">Demo club</span> : null}
          {club.following ? <span className="rounded-full bg-[#E8F5EE] px-2.5 py-0.5 text-[#1E6B47]">Following</span> : null}
        </div>
      </div>
    </Link>
  );
}

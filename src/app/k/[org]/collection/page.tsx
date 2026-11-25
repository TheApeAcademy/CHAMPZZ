import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";
import { PictureIcon } from "@/features/kids/components/picture-pin";

export const metadata = { title: "Champ collection" };

const RARITY = { common: "Common", rare: "Rare", epic: "Epic", legend: "Legend" } as Record<string, string>;

export default async function CollectionPage({ params }: PageProps<"/k/[org]/collection">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  const supabase = await supabaseServer();
  const { data: items } = await supabase.from("collectibles").select("code, name, blurb, rarity, min_points, icon, color").order("sort");
  const got = (items ?? []).filter((c) => k.points >= c.min_points).length;
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">Champ collection</h1>
      <p className="-mt-2 font-bold text-muted" data-testid="collection-count">{got} of {(items ?? []).length} collected</p>
      <ul className="grid grid-cols-3 gap-2" data-testid="collection">
        {(items ?? []).map((c) => {
          const open = k.points >= c.min_points;
          return (
            <li key={c.code} data-code={c.code} data-unlocked={open ? "yes" : "no"}
              className={`flex flex-col items-center gap-1 rounded-[16px] p-3 text-center ${open ? "bg-surface" : "border-2 border-dashed border-line"}`}>
              <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: open ? `${c.color}22` : "#EEE8DA" }}>
                {open ? <PictureIcon index={c.icon} size={34} /> : <span className="font-display text-2xl font-black text-muted">?</span>}
              </span>
              <span className={`text-sm font-extrabold ${open ? "" : "text-muted"}`}>{open ? c.name : "Locked"}</span>
              <span className="text-[11px] font-bold text-muted">{open ? RARITY[c.rarity] : `${c.min_points} pts`}</span>
            </li>
          );
        })}
      </ul>
    </KidShell>
  );
}

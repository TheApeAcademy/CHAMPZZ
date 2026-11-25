import Link from "next/link";
import { KidShell } from "@/features/kids/components/kid-shell";
import { ChampAvatar } from "@/features/kids/components/champ-avatar";
import { getKidSnapshot } from "@/features/kids/server/data";
import { parseAvatar } from "@/features/kids/avatar";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Hall of Champs" };

export default async function HallPage({ params, searchParams }: PageProps<"/k/[org]/hall">) {
  const { org } = await params;
  const { period } = await searchParams;
  const p = period === "all" ? "all" : "week";
  const k = await getKidSnapshot(org);
  const supabase = await supabaseServer();
  const { data: rows } = await supabase.rpc("hall_of_champs", { p_period: p });

  return (
    <KidShell slug={org} clubName={k.org.name} active="hall" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">Hall of Champs</h1>
      <p className="text-sm font-bold text-muted">{k.className ?? "Your club"}</p>
      <div className="flex gap-2" role="tablist" aria-label="Time period">
        <Link href={`/k/${org}/hall`} role="tab" aria-selected={p === "week"} className={`min-h-11 rounded-full px-4 py-2.5 text-sm font-extrabold ${p === "week" ? "bg-ink text-white" : "bg-surface"}`}>This week</Link>
        <Link href={`/k/${org}/hall?period=all`} role="tab" aria-selected={p === "all"} className={`min-h-11 rounded-full px-4 py-2.5 text-sm font-extrabold ${p === "all" ? "bg-ink text-white" : "bg-surface"}`}>All time</Link>
      </div>
      <ol className="flex flex-col gap-2" data-testid="hall-list">
        {(rows ?? []).map((r, i) => (
          <li key={r.kid_id} className={`flex items-center gap-3 rounded-[20px] p-3 ${r.is_me ? "bg-gold" : "bg-surface"}`} data-me={r.is_me ? "yes" : "no"}>
            <span className="w-7 text-center font-display text-xl font-black italic">{i + 1}</span>
            <ChampAvatar a={parseAvatar(r.avatar)} size={44} />
            <span className="flex-1 font-extrabold">{r.first_name}{r.last_initial ? ` ${r.last_initial}.` : ""}{r.is_me ? " (you)" : ""}</span>
            <span className="font-extrabold">{r.points}</span>
          </li>
        ))}
      </ol>
    </KidShell>
  );
}

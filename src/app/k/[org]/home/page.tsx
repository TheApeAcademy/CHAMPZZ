import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "@/features/auth/server/actions";

export const metadata = { title: "Home" };

const TILES = [
  { title: "Road to Champ", cls: "bg-ink text-white" },
  { title: "The Arena", cls: "bg-gold text-ink" },
  { title: "Faith Quest", cls: "bg-coral text-ink", faith: true },
  { title: "Hall of Champs", cls: "bg-surface text-ink border-2 border-line" },
];

export default async function KidHomePage({ params }: PageProps<"/k/[org]/home">) {
  const { org } = await params;
  const viewer = await getViewer();
  if (viewer.kind !== "kid" || viewer.org.slug !== org) redirect(`/k/${encodeURIComponent(org)}`);
  const supabase = await supabaseServer();
  const [{ data: kid }, { data: club }] = await Promise.all([
    supabase.from("kids").select("classes(age_band)").eq("id", viewer.kid.id).single(),
    supabase.from("organizations").select("faith_mode").eq("id", viewer.org.id).single(),
  ]);
  const little = kid?.classes?.age_band === "little";
  const tiles = TILES.filter((t) => !t.faith || club?.faith_mode);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold">{viewer.org.name}</span>
        <form action={signOut}><button type="submit" className="min-h-11 px-2 text-sm font-extrabold underline">Sign out</button></form>
      </div>
      <section className="flex flex-col gap-3 rounded-[28px] bg-brand p-5 text-white">
        <h1 className="font-display text-3xl font-black italic uppercase" data-testid="kid-greeting">Hi, {viewer.kid.firstName}!</h1>
        <span className="self-start rounded-full bg-gold px-3 py-0.5 text-sm font-extrabold text-ink">Rookie · Level 1</span>
        <div className="flex justify-between text-sm font-extrabold"><span>0 Champ Points</span><span>Fire Streak: 0</span></div>
        <div className="h-3 rounded-full bg-white/25"><div className="h-3 w-[2%] rounded-full bg-gold" /></div>
      </section>
      {!viewer.kid.confirmed ? <p className="rounded-[14px] bg-[#FCEBC4] px-4 py-2 text-sm font-bold text-[#5A3F00]">Welcome! Your teacher will say hi at your first visit.</p> : null}
      <div className={little ? "flex flex-col gap-4" : "grid grid-cols-2 gap-3"}>
        {tiles.map((t) => (
          <div
            key={t.title}
            className={`${t.cls} flex ${little ? "h-28 border-[3px] border-ink shadow-[5px_5px_0_var(--ink)]" : "h-32"} flex-col justify-end rounded-[24px] p-4`}
          >
            <span className="font-display text-xl font-black italic uppercase leading-tight">{t.title}</span>
            <span className="text-xs font-bold opacity-80">Coming soon</span>
          </div>
        ))}
      </div>
    </main>
  );
}

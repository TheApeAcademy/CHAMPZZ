import { notFound } from "next/navigation";
import { z } from "zod";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { shuffle } from "@/lib/random";
import { HostGame } from "@/features/games/components/host-game";

export const metadata = { title: "Road to Champ" };

export default async function PlayPage({ params, searchParams }: PageProps<"/o/[org]/quiz/play">) {
  const { org: slug } = await params;
  const sp = await searchParams;
  const { org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const pack = z.uuid().safeParse(sp.pack);
  if (!pack.success) notFound();
  const rawTeams = (Array.isArray(sp.team) ? sp.team : [sp.team]).filter((t): t is string => typeof t === "string");
  const teams = [...new Set(rawTeams.map((t) => t.trim().slice(0, 30)).filter(Boolean))].slice(0, 4);
  if (teams.length === 0) teams.push("Team 1");
  const clock = [0, 15, 30, 45].includes(Number(sp.clock)) ? Number(sp.clock) : 30;
  const supabase = await supabaseServer();
  const [{ data: p }, { data: o }] = await Promise.all([
    supabase.from("question_packs").select("id, name, faith, organization_id").eq("id", pack.data).maybeSingle(),
    supabase.from("organizations").select("faith_mode").eq("id", org.id).single(),
  ]);
  if (!p || (p.organization_id && p.organization_id !== org.id) || (!p.organization_id && p.faith && !o?.faith_mode)) notFound();
  const { data: qs } = await supabase.from("questions").select("id, tier, prompt, choices, answer_index, explanation").eq("pack_id", p.id);
  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-4 bg-cream px-4 py-6">
      <HostGame slug={slug} pack={{ id: p.id, name: p.name }} questions={shuffle(qs ?? [])} teams={teams} clock={clock} />
    </main>
  );
}

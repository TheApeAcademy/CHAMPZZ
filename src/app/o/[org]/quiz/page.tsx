import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { Card, Field, Select } from "@/components/ui/primitives";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { usablePacks } from "@/features/games/server/data";
import { PendingUploads } from "@/features/games/components/pending-uploads";

export const metadata = { title: "Road to Champ" };

export default async function QuizPage({ params }: PageProps<"/o/[org]/quiz">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data: o } = await supabase.from("organizations").select("faith_mode").eq("id", org.id).single();
  const [packs, { data: matches }] = await Promise.all([
    usablePacks(org.id, Boolean(o?.faith_mode)),
    supabase.from("quiz_matches").select("id, pack_name, teams, questions_played, played_at, seasons(name)").eq("organization_id", org.id).order("played_at", { ascending: false }).limit(20),
  ]);
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="quiz" />
      <PendingUploads slug={slug} />
      <section className="rounded-[28px] bg-ink p-6 text-cream">
        <p className="text-sm font-extrabold uppercase tracking-widest text-gold">The quiz show</p>
        <h1 className="font-display text-4xl font-black italic uppercase">Road to Champ</h1>
        <p className="mt-2 max-w-2xl">Put this on the big screen. Teams climb from Rookie to Champ, with power-ups and a Shot Clock. It keeps working if the internet drops, and saves the result when it comes back.</p>
      </section>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">Start a match</h2>
        <form action={`/o/${slug}/quiz/play`} className="grid gap-3 sm:grid-cols-2">
          <Select label="Questions" name="pack" required defaultValue={packs[0]?.id}>
            {packs.map((p) => <option key={p.id} value={p.id}>{p.name}{p.organization_id ? " (your club)" : ""}</option>)}
          </Select>
          <Select label="Shot Clock" name="clock" defaultValue="30">
            <option value="15">15 seconds</option><option value="30">30 seconds</option><option value="45">45 seconds</option><option value="0">Off</option>
          </Select>
          {[1, 2, 3, 4].map((n) => (
            <Field key={n} label={`Team ${n}${n > 2 ? " (optional)" : ""}`} name="team" maxLength={30} required={n <= 2}
              defaultValue={n === 1 ? "Lions" : n === 2 ? "Eagles" : ""} />
          ))}
          <div className="sm:col-span-2"><button type="submit" className="min-h-12 rounded-full bg-brand px-6 font-extrabold text-white">Go to the rules screen</button></div>
        </form>
        <p className="mt-3 text-sm"><Link href={`/o/${slug}/quiz/bank`} className="font-bold underline">Question bank</Link>: add your own questions, or browse the Champzz packs.</p>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">Match history</h2>
        <ul className="flex flex-col divide-y divide-line" data-testid="match-history">
          {(matches ?? []).map((m) => {
            const teams = (m.teams as { name: string; score: number }[]).toSorted((a, b) => b.score - a.score);
            return (
              <li key={m.id} className="flex flex-col gap-1 py-3">
                <p className="font-extrabold">{teams[0]?.name} won with {teams[0]?.score.toLocaleString("en-GB")}</p>
                <p className="text-sm text-muted">{teams.map((t) => `${t.name} ${t.score}`).join(" · ")}</p>
                <p className="text-xs text-muted">{m.pack_name} · {m.questions_played} questions · {new Date(m.played_at).toLocaleDateString("en-GB")}{m.seasons?.name ? ` · ${m.seasons.name}` : ""}</p>
              </li>
            );
          })}
          {(matches ?? []).length === 0 ? <li className="py-3 text-sm text-muted">No matches yet.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}

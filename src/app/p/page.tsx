import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { Banner, Card, Pill } from "@/components/ui/primitives";
import { requireAdult } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "My kids" };

export default async function ParentPage({ searchParams }: PageProps<"/p">) {
  const viewer = await requireAdult("/p");
  const { added, club } = await searchParams;
  const supabase = await supabaseServer();
  const { data: links } = await supabase
    .from("guardians")
    .select("kid_id, kids!inner(id, first_name, last_initial, username, status, confirmed_at, avatar, organizations!inner(name, slug), kid_stats(points_total, streak_current, streak_best, stars))")
    .eq("user_id", viewer.userId);

  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <h1 className="font-display text-3xl font-extrabold">My kids</h1>
      {typeof added === "string" ? (
        <Banner tone="ok">
          Added. Their username is <strong data-testid="new-username">{added}</strong>. They sign in at{" "}
          {typeof club === "string" ? <Link className="underline" href={`/k/${club}`}>/k/{club}</Link> : "their club's kid page"} with that username and the 4 pictures you chose.
        </Banner>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2" data-testid="parent-kids">
        {(links ?? []).map(({ kids: k }) => (
          <Card key={k.id}>
            <p className="font-display text-2xl font-extrabold">{k.first_name}{k.last_initial ? ` ${k.last_initial}.` : ""}</p>
            <p className="text-sm text-muted">{k.organizations.name}</p>
            <p className="mt-2 text-sm">Username: <strong>{k.username}</strong></p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center" data-testid={`parent-stats-${k.username}`}>
              <div className="rounded-[12px] bg-cream p-2"><dt className="text-[11px] font-bold text-muted">Champ Points</dt><dd className="font-extrabold">{k.kid_stats?.[0]?.points_total ?? 0}</dd></div>
              <div className="rounded-[12px] bg-cream p-2"><dt className="text-[11px] font-bold text-muted">Best streak</dt><dd className="font-extrabold">{k.kid_stats?.[0]?.streak_best ?? 0}</dd></div>
              <div className="rounded-[12px] bg-cream p-2"><dt className="text-[11px] font-bold text-muted">Stars</dt><dd className="font-extrabold">{k.kid_stats?.[0]?.stars ?? 0}</dd></div>
            </dl>
            <div className="mt-2">{k.status === "pending" ? <Pill tone="warn">Waiting for the club to approve</Pill> : k.confirmed_at ? <Pill tone="ok">Confirmed</Pill> : <Pill tone="new">New: confirmed at first visit</Pill>}</div>
          </Card>
        ))}
        {(links ?? []).length === 0 ? <p className="text-sm text-muted">No kids yet. Open your club&apos;s Clubhouse page to add your child.</p> : null}
      </div>
    </AdultShell>
  );
}

import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { Card } from "@/components/ui/primitives";
import { StaffNav } from "@/components/staff-nav";
import { ChampAvatar } from "@/features/kids/components/champ-avatar";
import { parseAvatar } from "@/features/kids/avatar";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Hall of Champs" };

export default async function StaffHallPage({ params, searchParams }: PageProps<"/o/[org]/hall">) {
  const { org: slug } = await params;
  const { class: classParam, period } = await searchParams;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data: classes } = await supabase.from("classes").select("id, name").eq("organization_id", org.id).eq("archived", false).order("name");
  const current = (classes ?? []).find((c) => c.id === classParam) ?? (classes ?? [])[0];
  const p = period === "all" ? "all" : "week";
  const { data: rows } = current ? await supabase.rpc("hall_of_champs", { p_class: current.id, p_period: p }) : { data: [] };

  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="hall" />
      <h1 className="font-display text-3xl font-extrabold">Hall of Champs</h1>
      {!current ? <p className="text-muted">Create a class first.</p> : (
        <>
          <nav aria-label="Classes" className="flex flex-wrap gap-2">
            {(classes ?? []).map((c) => (
              <Link key={c.id} href={`/o/${slug}/hall?class=${c.id}&period=${p}`} aria-current={c.id === current.id ? "page" : undefined}
                className={`min-h-11 rounded-full px-4 py-2.5 text-sm font-extrabold ${c.id === current.id ? "bg-ink text-white" : "bg-surface"}`}>{c.name}</Link>
            ))}
          </nav>
          <div className="flex gap-2">
            <Link href={`/o/${slug}/hall?class=${current.id}`} className={`min-h-11 rounded-full px-4 py-2.5 text-sm font-extrabold ${p === "week" ? "bg-brand text-white" : "bg-surface"}`}>This week</Link>
            <Link href={`/o/${slug}/hall?class=${current.id}&period=all`} className={`min-h-11 rounded-full px-4 py-2.5 text-sm font-extrabold ${p === "all" ? "bg-brand text-white" : "bg-surface"}`}>All time</Link>
          </div>
          <Card>
            <ol className="flex flex-col divide-y divide-line" data-testid="staff-hall">
              {(rows ?? []).map((r, i) => (
                <li key={r.kid_id} className="flex items-center gap-3 py-2">
                  <span className="w-6 font-extrabold">{i + 1}</span>
                  <ChampAvatar a={parseAvatar(r.avatar)} size={36} />
                  <span className="flex-1 font-bold">{r.first_name}{r.last_initial ? ` ${r.last_initial}.` : ""}</span>
                  <span className="font-extrabold">{r.points}</span>
                </li>
              ))}
              {(rows ?? []).length === 0 ? <li className="py-2 text-sm text-muted">No confirmed kids in this class yet.</li> : null}
            </ol>
          </Card>
        </>
      )}
    </AdultShell>
  );
}

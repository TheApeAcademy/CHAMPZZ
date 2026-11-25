import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { Card, Pill } from "@/components/ui/primitives";
import { requirePlatformAdmin } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Super Admin" };

export default async function ConsolePage() {
  const viewer = await requirePlatformAdmin();
  const supabase = await supabaseServer();
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, slug, status, kind, country, created_at, subscriptions(current_period_end, plans(name))")
    .order("created_at", { ascending: false })
    .limit(200);
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <h1 className="font-display text-3xl font-extrabold">Super Admin</h1>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">Organizations</h2>
        <ul className="flex flex-col divide-y divide-line" data-testid="console-orgs">
          {(orgs ?? []).map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <Link href={`/console/orgs/${o.id}`} className="font-extrabold text-brand underline">{o.name}</Link>
              <span className="text-sm text-muted">{o.slug} · {o.kind} · {o.country}</span>
              <span className="text-sm">{o.subscriptions?.plans?.name ?? "No plan"}</span>
              <Pill tone={o.status === "active" ? "ok" : o.status === "pending" ? "new" : "warn"}>{o.status}</Pill>
            </li>
          ))}
        </ul>
      </Card>
    </AdultShell>
  );
}

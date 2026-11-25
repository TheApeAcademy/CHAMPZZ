import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { Card } from "@/components/ui/primitives";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Audit log" };

export default async function AuditPage({ params }: PageProps<"/o/[org]/audit">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin"]);
  const supabase = await supabaseServer();
  const { data: rows } = await supabase.from("audit_log").select("id, action, target_type, at, actor_id").eq("organization_id", org.id).order("at", { ascending: false }).limit(200);
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="audit" />
      <h1 className="font-display text-3xl font-extrabold">Audit log</h1>
      <p className="max-w-2xl text-sm text-muted">A record of sensitive actions in your club: PIN resets, team changes, releases without a pickup code, photo checks, Champ Buddy consent and more. It cannot be edited.</p>
      <Card>
        <table className="w-full text-left text-sm" data-testid="audit-table">
          <thead><tr className="text-muted"><th className="py-1">When</th><th className="py-1">What</th><th className="py-1">On</th></tr></thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="py-2 pr-3 whitespace-nowrap">{new Date(r.at).toLocaleString("en-GB")}</td>
                <td className="py-2 pr-3 font-bold">{r.action}</td>
                <td className="py-2">{r.target_type ?? ""}</td>
              </tr>
            ))}
            {(rows ?? []).length === 0 ? <tr><td colSpan={3} className="py-2 text-muted">Nothing yet.</td></tr> : null}
          </tbody>
        </table>
      </Card>
    </AdultShell>
  );
}

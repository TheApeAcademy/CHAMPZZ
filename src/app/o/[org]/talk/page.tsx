import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { Card, Pill } from "@/components/ui/primitives";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Talk to Someone" };

export default async function TalkInboxPage({ params }: PageProps<"/o/[org]/talk">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data: rows } = await supabase.rpc("staff_concerns", { p_org: org.id });
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="talk" />
      <h1 className="font-display text-3xl font-extrabold">Talk to Someone</h1>
      <p className="max-w-2xl text-sm text-muted">Messages from children who need a trusted adult. If a child chose to stay anonymous, Champzz never shows who they are, to anyone. Opening a message is recorded.</p>
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="concern-list">
          {(rows ?? []).map((c) => (
            <li key={c.id} className="flex flex-col gap-1 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/o/${slug}/talk/${c.id}`} className="font-extrabold underline">{c.kid_label}</Link>
                {c.class_name ? <span className="text-sm text-muted">{c.class_name}</span> : null}
                <Pill tone={c.status === "new" || c.status === "escalated" ? "warn" : c.status === "resolved" ? "ok" : "neutral"}>{c.status.replace("_", " ")}</Pill>
              </div>
              <p className="text-sm text-muted">{c.preview}</p>
              <p className="text-xs text-muted">{new Date(c.created_at).toLocaleString("en-GB")}</p>
            </li>
          ))}
          {(rows ?? []).length === 0 ? <li className="py-3 text-sm text-muted">No messages. If a child in your classes reaches out, it will appear here and you will get an urgent alert.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}

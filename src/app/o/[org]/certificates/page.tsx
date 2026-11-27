import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Select } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { issueCertificate } from "@/features/admin/server/actions";

export const metadata = { title: "Certificates" };

const IDEAS = ["Memory Verse Champion", "Star Helper", "Perfect Attendance", "Kindness Award", "Road to Champ Winner", "Level Up: All-Star"];

export default async function CertificatesPage({ params }: PageProps<"/o/[org]/certificates">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const [{ data: kids }, { data: certs }] = await Promise.all([
    supabase.from("kids").select("id, first_name, last_initial").eq("organization_id", org.id).eq("status", "active").order("first_name"),
    supabase.from("certificates").select("id, title, issued_at, kids!inner(first_name, last_initial)").eq("organization_id", org.id).order("issued_at", { ascending: false }).limit(50),
  ]);
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="certificates" />
      <h1 className="font-display text-3xl font-extrabold">Certificates</h1>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">Give a certificate</h2>
        <ActionForm action={issueCertificate.bind(null, slug)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select label="Kid" name="kidId" required defaultValue="">
            <option value="" disabled>Pick a kid</option>
            {(kids ?? []).map((k) => <option key={k.id} value={k.id}>{k.first_name}{k.last_initial ? ` ${k.last_initial}.` : ""}</option>)}
          </Select>
          <Field label="Title" name="title" required maxLength={80} list="cert-ideas" placeholder="Memory Verse Champion" />
          <datalist id="cert-ideas">{IDEAS.map((i) => <option key={i} value={i} />)}</datalist>
          <Field label="Why (optional)" name="reason" maxLength={200} />
          <div className="sm:col-span-2"><Submit>Issue certificate</Submit></div>
        </ActionForm>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">Given so far</h2>
        <ul className="flex flex-col divide-y divide-line" data-testid="certificate-list">
          {(certs ?? []).map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-2 py-3">
              <Link href={`/o/${slug}/certificates/${c.id}`} className="font-extrabold underline">{c.title}</Link>
              <span className="text-sm">{c.kids.first_name}{c.kids.last_initial ? ` ${c.kids.last_initial}.` : ""}</span>
              <span className="text-xs text-muted">{new Date(c.issued_at).toLocaleDateString("en-GB")}</span>
            </li>
          ))}
          {(certs ?? []).length === 0 ? <li className="py-3 text-sm text-muted">None yet.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}

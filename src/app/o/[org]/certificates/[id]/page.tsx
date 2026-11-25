import { AdultShell } from "@/components/shell";
import { requireOrgRole } from "@/lib/auth/viewer";
import { Certificate } from "@/features/certificates/components/certificate";
import { getCertificate } from "@/features/certificates/server/data";

export const metadata = { title: "Certificate" };

export default async function StaffCertificatePage({ params }: PageProps<"/o/[org]/certificates/[id]">) {
  const { org: slug, id } = await params;
  const { viewer } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const c = await getCertificate(id);
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <Certificate {...c} />
    </AdultShell>
  );
}

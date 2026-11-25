import { AdultShell } from "@/components/shell";
import { requireAdult } from "@/lib/auth/viewer";
import { Certificate } from "@/features/certificates/components/certificate";
import { getCertificate } from "@/features/certificates/server/data";

export const metadata = { title: "Certificate" };

export default async function ParentCertificatePage({ params }: PageProps<"/p/certificates/[id]">) {
  const { id } = await params;
  const viewer = await requireAdult(`/p/certificates/${id}`);
  const c = await getCertificate(id);
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <Certificate {...c} />
    </AdultShell>
  );
}

import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { Certificate } from "@/features/certificates/components/certificate";
import { getCertificate } from "@/features/certificates/server/data";

export const metadata = { title: "My certificate" };

export default async function KidCertificatePage({ params }: PageProps<"/k/[org]/certificates/[id]">) {
  const { org, id } = await params;
  const k = await getKidSnapshot(org);
  const c = await getCertificate(id);
  return (
    <KidShell slug={org} clubName={k.org.name} active="trophies" little={k.little}>
      <Certificate {...c} />
    </KidShell>
  );
}

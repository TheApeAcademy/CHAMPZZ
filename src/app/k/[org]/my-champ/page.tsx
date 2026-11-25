import Link from "next/link";
import { KidShell } from "@/features/kids/components/kid-shell";
import { MyChampEditor } from "@/features/kids/components/my-champ-editor";
import { getKidSnapshot } from "@/features/kids/server/data";
import { saveMyChamp } from "@/features/kids/server/actions";

export const metadata = { title: "My Champ" };

export default async function MyChampPage({ params }: PageProps<"/k/[org]/my-champ">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  return (
    <KidShell slug={org} clubName={k.org.name} active="me" little={k.little}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black italic uppercase">My Champ</h1>
        <Link href={`/k/${org}/card`} className="min-h-11 rounded-full bg-ink px-4 py-2.5 text-sm font-extrabold text-white">Champ Card</Link>
      </div>
      <p className="text-sm font-bold text-muted">Level up to unlock new extras. You are {k.level.name}.</p>
      <MyChampEditor initial={k.avatar} levelSort={k.level.sort} action={saveMyChamp.bind(null, org)} />
    </KidShell>
  );
}

import { redirect } from "next/navigation";
import { getKidSnapshot } from "@/features/kids/server/data";
import { Town3D } from "@/features/kids/town3d/town3d";

export const metadata = { title: "3D Champ Town" };

/** The walkable 3D Champ Town (Claude Design). Its rooms carry Bible verses, so it is for faith-mode clubs. */
export default async function Town3DPage({ params }: PageProps<"/k/[org]/town">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  if (!k.org.faithMode) redirect(`/k/${org}/home`);
  return <Town3D slug={org} firstName={k.firstName} />;
}

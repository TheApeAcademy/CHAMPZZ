import { notFound } from "next/navigation";
import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { trainingState } from "@/features/games/server/actions";
import { Training } from "@/features/games/components/training";

export const metadata = { title: "Training Ground" };

export default async function RunPage({ params }: PageProps<"/k/[org]/road/[run]">) {
  const { org, run } = await params;
  const k = await getKidSnapshot(org);
  const state = await trainingState(run);
  if (!state) notFound();
  return (
    <KidShell slug={org} clubName={k.org.name} active="games" little={k.little}>
      <Training slug={org} runId={run} initial={state} />
    </KidShell>
  );
}

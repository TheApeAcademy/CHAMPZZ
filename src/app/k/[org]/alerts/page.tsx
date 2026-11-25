import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { NotificationList } from "@/features/notifications/components/notification-list";
import { requireKid } from "@/features/kids/server/data";

export const metadata = { title: "Alerts" };

export default async function KidAlertsPage({ params }: PageProps<"/k/[org]/alerts">) {
  const { org } = await params;
  const viewer = await requireKid(org);
  const k = await getKidSnapshot(org);
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">Alerts</h1>
      <NotificationList userId={viewer.userId} path={`/k/${org}/alerts`} />
    </KidShell>
  );
}

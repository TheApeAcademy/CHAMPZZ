import { AdultShell } from "@/components/shell";
import { requireAdult } from "@/lib/auth/viewer";
import { NotificationList } from "@/features/notifications/components/notification-list";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const viewer = await requireAdult("/notifications");
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <h1 className="font-display text-3xl font-extrabold">Notifications</h1>
      <NotificationList userId={viewer.userId} path="/notifications" />
    </AdultShell>
  );
}

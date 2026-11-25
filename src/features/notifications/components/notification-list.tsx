import Link from "next/link";
import { markAllRead } from "@/features/notifications/server/actions";
import { listNotifications } from "@/features/notifications/server/data";

export async function NotificationList({ userId, path }: { userId: string; path: string }) {
  const items = await listNotifications(userId);
  return (
    <div className="flex flex-col gap-3">
      {items.some((n) => !n.read_at) ? (
        <form action={markAllRead.bind(null, path)}><button type="submit" className="min-h-11 text-sm font-extrabold underline">Mark all as read</button></form>
      ) : null}
      <ul className="flex flex-col gap-2" data-testid="notification-list">
        {items.map((n) => (
          <li key={n.id} className={`rounded-[16px] border p-4 ${n.read_at ? "border-line bg-surface" : n.severity === "urgent" ? "border-coral bg-[#FDE2DE]" : "border-brand bg-[#DDE5FF]"}`}>
            {n.link ? <Link href={n.link} className="font-extrabold underline">{n.title}</Link> : <p className="font-extrabold">{n.title}</p>}
            {n.body ? <p className="text-sm">{n.body}</p> : null}
            <p className="text-xs text-muted">{new Date(n.created_at).toLocaleString("en-GB")}</p>
          </li>
        ))}
        {items.length === 0 ? <li className="text-sm text-muted">Nothing new.</li> : null}
      </ul>
    </div>
  );
}

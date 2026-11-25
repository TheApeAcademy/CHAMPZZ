import Link from "next/link";
import { unreadCounts } from "@/features/notifications/server/data";

/** Bell with an unread count. Turns coral when something urgent is waiting. */
export async function Bell({ userId, href }: { userId: string; href: string }) {
  const { unread, urgent } = await unreadCounts(userId);
  const label = unread === 0 ? "Notifications" : `Notifications, ${unread} unread${urgent ? `, ${urgent} urgent` : ""}`;
  return (
    <Link href={href} aria-label={label} data-testid="bell" data-unread={unread} data-urgent={urgent}
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-[12px]">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {unread > 0 ? (
        <span className={`absolute right-0.5 top-0.5 min-w-5 rounded-full px-1 text-center text-[11px] font-extrabold ${urgent ? "bg-coral text-ink" : "bg-brand text-white"}`}>{unread}</span>
      ) : null}
    </Link>
  );
}

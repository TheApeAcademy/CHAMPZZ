import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/features/auth/server/actions";
import { getViewer } from "@/lib/auth/viewer";
import { Bell } from "@/features/notifications/components/bell";

const NAV = [
  { key: "home", label: "Home", path: "home", icon: "M3 11 12 4l9 7v9H3z" },
  { key: "games", label: "Games", path: "games", icon: "M6 11h4M8 9v4M15 12h.01M18 10h.01M17.3 5H6.7a4 4 0 0 0-3.9 3.2l-1 5A3 3 0 0 0 4.7 17c.9 0 1.7-.4 2.3-1.1L8 15h8l1 .9c.6.7 1.4 1.1 2.3 1.1a3 3 0 0 0 2.9-3.8l-1-5A4 4 0 0 0 17.3 5z" },
  { key: "trophies", label: "Trophies", path: "trophies", icon: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" },
  { key: "hall", label: "Hall", path: "hall", icon: "M3 20h18M6 20V12h4v8M10 20V7h4v13M14 20v-10h4v10" },
  { key: "me", label: "My Champ", path: "my-champ", icon: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c1-5 4-7 8-7s7 2 8 7" },
] as const;

/**
 * Champ Town frame for every kid room (Claude Design: Sunday School / Arena top
 * bar): a "Champ Town" pill back to the village, alerts, sign out, the room,
 * then a dark glass bottom bar sized for small thumbs.
 */
export async function KidShell({ slug, clubName, active, little, children, dark = false }: { slug: string; clubName: string; active: (typeof NAV)[number]["key"] | "other"; little: boolean; children: ReactNode; dark?: boolean }) {
  const viewer = await getViewer();
  return (
    <div className={`flex min-h-[100svh] flex-col ${dark ? "bg-ink text-cream" : "bg-cream"}`}>
      <header className={`sticky top-0 z-40 border-b ${dark ? "border-white/10 bg-[rgba(11,16,38,.86)]" : "border-[rgba(230,220,198,.7)] bg-[rgba(255,248,236,.86)]"} backdrop-blur-md`}>
        <div className="mx-auto flex min-h-[60px] w-full max-w-xl items-center gap-2 px-3 pt-[env(safe-area-inset-top)]">
          <Link href={`/k/${slug}/home`} className={`inline-flex min-h-11 flex-none items-center gap-1.5 rounded-full border-[2.5px] pl-2.5 pr-4 text-[15px] font-black ${dark ? "border-white/20 bg-white/[.06] text-cream" : "border-ink bg-[#FFFDF7] text-ink"}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            Champ Town
          </Link>
          <span className={`mr-auto min-w-0 truncate text-sm font-extrabold ${dark ? "text-[#C9CBE0]" : "text-muted"}`}>{clubName}</span>
          {viewer.kind === "kid" ? <Bell userId={viewer.userId} href={`/k/${slug}/alerts`} className="rounded-full" /> : null}
          <form action={signOut}><button type="submit" className="min-h-11 whitespace-nowrap px-1.5 text-sm font-extrabold underline">Sign out</button></form>
        </div>
      </header>
      <main data-mode={little ? "little" : "champ"} className="mx-auto flex w-full min-w-0 max-w-xl flex-1 flex-col gap-4 px-4 pt-4 cz-bottom-gap">{children}</main>
      <nav aria-label="Champ Town" className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-xl px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <ul className={`grid grid-cols-5 gap-1 rounded-[26px] border-[1.5px] border-[rgba(255,248,236,.16)] bg-[rgba(11,16,38,.9)] p-1.5 shadow-[0_20px_50px_-14px_rgba(0,0,0,.6)] backdrop-blur-[18px]`}>
          {NAV.map((n) => {
            const on = n.key === active;
            return (
              <li key={n.key}>
                <Link
                  href={`/k/${slug}/${n.path}`}
                  aria-current={on ? "page" : undefined}
                  className={`flex ${little ? "min-h-16" : "min-h-14"} flex-col items-center justify-center gap-0.5 rounded-[20px] text-xs font-extrabold ${on ? "bg-gold text-ink" : "text-[#D8D4C8]"}`}
                >
                  <svg width={little ? 26 : 22} height={little ? 26 : 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={n.icon} /></svg>
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

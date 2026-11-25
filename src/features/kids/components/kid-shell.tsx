import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/features/auth/server/actions";

const NAV = [
  { key: "home", label: "Home", path: "home", icon: "M3 11 12 4l9 7v9H3z" },
  { key: "trophies", label: "Trophies", path: "trophies", icon: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" },
  { key: "hall", label: "Hall", path: "hall", icon: "M3 20h18M6 20V12h4v8M10 20V7h4v13M14 20v-10h4v10" },
  { key: "me", label: "My Champ", path: "my-champ", icon: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c1-5 4-7 8-7s7 2 8 7" },
] as const;

/** Champ Town frame: club name, sign out, content, and a big bottom nav. */
export function KidShell({ slug, clubName, active, little, children }: { slug: string; clubName: string; active: (typeof NAV)[number]["key"]; little: boolean; children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-cream">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 pt-4">
        <span className="text-sm font-extrabold">{clubName}</span>
        <form action={signOut}><button type="submit" className="min-h-11 px-2 text-sm font-extrabold underline">Sign out</button></form>
      </header>
      <main data-mode={little ? "little" : "champ"} className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-28 pt-3">{children}</main>
      <nav aria-label="Champ Town" className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md px-3 pb-3">
        <ul className={`grid grid-cols-4 gap-1.5 rounded-[24px] bg-ink p-2 ${little ? "border-[3px] border-ink" : ""}`}>
          {NAV.map((n) => {
            const on = n.key === active;
            return (
              <li key={n.key}>
                <Link
                  href={`/k/${slug}/${n.path}`}
                  aria-current={on ? "page" : undefined}
                  className={`flex ${little ? "min-h-16" : "min-h-14"} flex-col items-center justify-center gap-0.5 rounded-[18px] text-xs font-extrabold ${on ? "bg-brand text-white" : "text-[#D8D4C8]"}`}
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

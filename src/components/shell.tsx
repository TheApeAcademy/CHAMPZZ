import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { signOut } from "@/features/auth/server/actions";
import { getViewer } from "@/lib/auth/viewer";
import { Bell } from "@/features/notifications/components/bell";

/** Calm adult chrome: cream ground, logo, signed-in name, sign out. */
export async function AdultShell({ children, who, nav }: { children: ReactNode; who?: string; nav?: ReactNode }) {
  const viewer = who ? await getViewer() : null;
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 sm:px-8">
        <Link href="/" aria-label="Champzz home"><Logo size={24} /></Link>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/clubs" className="min-h-11 content-center px-1 font-extrabold">Clubs</Link>
          {viewer?.kind === "adult" ? <Link href="/feed" className="min-h-11 content-center px-1 font-extrabold">Feed</Link> : null}
          {nav}
          {viewer?.kind === "adult" ? <Bell userId={viewer.userId} href="/notifications" /> : null}
          {who ? <span className="font-bold text-muted">{who}</span> : null}
          {who ? (
            <form action={signOut}>
              <button type="submit" className="min-h-11 rounded-[12px] px-3 font-extrabold text-ink underline">Sign out</button>
            </form>
          ) : null}
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { signOut } from "@/features/auth/server/actions";
import { getViewer } from "@/lib/auth/viewer";
import { Bell } from "@/features/notifications/components/bell";

const chip = "inline-flex min-h-11 flex-none items-center rounded-full px-3.5 text-[15px] font-extrabold text-ink hover:bg-[#F3EADA]";

/**
 * Grown-up chrome in the Claude Design language: sticky blurred cream bar with
 * the signed wordmark. On phones the links sit in a swipeable row under the logo
 * so nothing wraps or overflows; Sign out always stays visible.
 */
export async function AdultShell({ children, who, nav, wide = false, bottomBar }: { children: ReactNode; who?: string; nav?: ReactNode; wide?: boolean; bottomBar?: ReactNode }) {
  const viewer = who ? await getViewer() : null;
  const signedIn = viewer?.kind === "adult";
  return (
    <div className="flex min-h-full flex-col">
      <header className="no-print sticky top-0 z-50 border-b border-[rgba(230,220,198,.7)] bg-[rgba(255,248,236,.86)] backdrop-blur-md">
        <div className={`mx-auto flex min-h-14 w-full ${wide ? "max-w-6xl" : "max-w-5xl"} items-center gap-2 px-3 py-1 sm:px-6`}>
          <Link href="/" aria-label="Champzz home" className="mr-auto flex-none"><Logo size={30} /></Link>
          <nav aria-label="Site" className="hidden items-center gap-0.5 md:flex">
            <Link href="/clubs" className={chip}>Clubs</Link>
            {signedIn ? <Link href="/feed" className={chip}>Feed</Link> : null}
            {nav}
          </nav>
          {signedIn ? <Bell userId={viewer.userId} href="/notifications" /> : null}
          {who ? <span className="hidden max-w-[14ch] truncate text-sm font-bold text-muted lg:inline">{who}</span> : null}
          {who ? (
            <form action={signOut}>
              <button type="submit" className="min-h-11 rounded-full px-3 text-[15px] font-extrabold text-ink underline underline-offset-2">Sign out</button>
            </form>
          ) : (
            <Link href="/" className={chip}>Back to site</Link>
          )}
        </div>
        <nav aria-label="Site links" className="cz-scroll-x mx-auto flex w-full max-w-5xl gap-1 px-2 pb-1.5 md:hidden">
          <Link href="/clubs" className={chip}>Clubs</Link>
          {signedIn ? <Link href="/feed" className={chip}>Feed</Link> : null}
          {nav}
        </nav>
      </header>
      <main className={`mx-auto flex w-full ${wide ? "max-w-6xl" : "max-w-5xl"} flex-1 flex-col gap-6 px-4 pt-6 ${bottomBar ? "cz-bottom-gap md:pb-10" : "pb-12"} sm:px-6`}>{children}</main>
      {bottomBar}
    </div>
  );
}

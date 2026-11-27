import Link from "next/link";
import { getViewer } from "@/lib/auth/viewer";

const ITEMS = [
  ["", "Overview", false], ["checkin", "Check-in", false], ["talk", "Talk to Someone", false], ["messages", "Messages", false],
  ["lessons", "Lessons", false], ["assignments", "Assignments", false], ["events", "Events", false], ["hall", "Hall of Champs", false], ["quiz", "Road to Champ", false], ["arena", "Arena", false],
  ["certificates", "Certificates", false], ["quests", "Quests", false], ["moderation", "Photo checks", false], ["verses", "Verse recordings", false], ["posts", "Clubhouse posts", false], ["media", "Digital Bank", false], ["buddy", "Champ Buddy", false], ["insights", "Insights", false], ["search", "Search", false], ["tags", "Name tags", false],
  ["team", "Team", true], ["seasons", "Seasons", true], ["settings", "Settings", true], ["audit", "Audit log", true],
] as const;

type Path = (typeof ITEMS)[number][0];

// Phone tab bar from the Staff HQ design: the four things done on a Sunday, then More.
const TABS: { path: Path; label: string; icon: string }[] = [
  { path: "", label: "Home", icon: "M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z" },
  { path: "checkin", label: "Check-in", icon: "M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" },
  { path: "talk", label: "Talk", icon: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12zM9 11h.01M12 11h.01M15 11h.01" },
  { path: "messages", label: "Messages", icon: "M4 5h16v11H8l-4 4z" },
];

export async function StaffNav({ slug, active }: { slug: string; active: Path }) {
  const viewer = await getViewer();
  const admin = viewer.kind === "adult" && viewer.memberships.some((m) => m.org.slug === slug && m.role === "org_admin");
  const items = ITEMS.filter(([, , adminOnly]) => admin || !adminOnly);
  const href = (path: string) => `/o/${slug}${path ? `/${path}` : ""}`;
  const inMore = !TABS.some((t) => t.path === active);
  return (
    <>
      <nav aria-label="Club" className="cz-scroll-x -mx-1 hidden gap-1 pb-1 md:flex md:flex-wrap">
        {items.map(([path, label]) => (
          <Link key={path} href={href(path)} aria-current={active === path ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-extrabold ${active === path ? "bg-ink text-white" : "border border-line bg-surface"}`}>{label}</Link>
        ))}
      </nav>

      <nav aria-label="Club menu" data-staff-tabbar="" className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink pb-safe md:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 py-1.5">
          {TABS.map((t) => {
            const on = active === t.path;
            return (
              <li key={t.path}>
                <Link href={href(t.path)} aria-current={on ? "page" : undefined}
                  className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-[14px] text-[11px] font-extrabold ${on ? "bg-white/12 text-white" : "text-[#C9CBE0]"}`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={t.icon} /></svg>
                  {t.label}
                </Link>
              </li>
            );
          })}
          <li>
            <details className="group">
              <summary className={`flex min-h-[52px] cursor-pointer list-none flex-col items-center justify-center gap-0.5 rounded-[14px] text-[11px] font-extrabold [&::-webkit-details-marker]:hidden ${inMore ? "bg-white/12 text-white" : "text-[#C9CBE0]"}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" aria-hidden="true"><path d="M5 12h.01M12 12h.01M19 12h.01" /></svg>
                More
              </summary>
              <div className="fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] max-h-[70svh] overflow-y-auto rounded-t-[28px] border-t-4 border-ink bg-cream p-4 shadow-[0_-12px_40px_rgba(11,16,38,.25)]">
                <p className="mb-3 text-xs font-black uppercase tracking-[.12em] text-muted">Everything in your club</p>
                <ul className="grid grid-cols-2 gap-2">
                  {items.filter(([path]) => !TABS.some((t) => t.path === path)).map(([path, label]) => (
                    <li key={path}>
                      <Link href={href(path)} aria-current={active === path ? "page" : undefined}
                        className={`flex min-h-12 items-center rounded-[16px] px-3 text-[15px] font-extrabold ${active === path ? "bg-ink text-white" : "border border-line bg-surface text-ink"}`}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </li>
        </ul>
      </nav>
    </>
  );
}

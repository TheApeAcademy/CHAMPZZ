import Link from "next/link";
import { getViewer } from "@/lib/auth/viewer";

const ITEMS = [
  ["", "Overview", false], ["checkin", "Check-in", false], ["talk", "Talk to Someone", false], ["messages", "Messages", false],
  ["lessons", "Lessons", false], ["assignments", "Assignments", false], ["events", "Events", false], ["hall", "Hall of Champs", false], ["quiz", "Road to Champ", false], ["arena", "Arena", false],
  ["certificates", "Certificates", false], ["insights", "Insights", false], ["search", "Search", false], ["tags", "Name tags", false],
  ["team", "Team", true], ["seasons", "Seasons", true], ["settings", "Settings", true],
] as const;

export async function StaffNav({ slug, active }: { slug: string; active: (typeof ITEMS)[number][0] }) {
  const viewer = await getViewer();
  const admin = viewer.kind === "adult" && viewer.memberships.some((m) => m.org.slug === slug && m.role === "org_admin");
  return (
    <nav aria-label="Club" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {ITEMS.filter(([, , adminOnly]) => admin || !adminOnly).map(([path, label]) => (
        <Link key={path} href={`/o/${slug}${path ? `/${path}` : ""}`} aria-current={active === path ? "page" : undefined}
          className={`min-h-11 shrink-0 rounded-full px-4 py-2.5 text-sm font-extrabold ${active === path ? "bg-ink text-white" : "bg-surface"}`}>{label}</Link>
      ))}
    </nav>
  );
}

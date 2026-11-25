import Link from "next/link";

const ITEMS = [
  ["", "Overview"], ["talk", "Talk to Someone"], ["messages", "Messages"], ["lessons", "Lessons"],
  ["assignments", "Assignments"], ["events", "Events"], ["hall", "Hall of Champs"], ["tags", "Name tags"],
] as const;

export function StaffNav({ slug, active }: { slug: string; active: (typeof ITEMS)[number][0] }) {
  return (
    <nav aria-label="Club" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {ITEMS.map(([path, label]) => (
        <Link key={path} href={`/o/${slug}${path ? `/${path}` : ""}`} aria-current={active === path ? "page" : undefined}
          className={`min-h-11 shrink-0 rounded-full px-4 py-2.5 text-sm font-extrabold ${active === path ? "bg-ink text-white" : "bg-surface"}`}>{label}</Link>
      ))}
    </nav>
  );
}

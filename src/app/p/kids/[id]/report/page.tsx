import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { PrintButton } from "@/components/ui/print-button";
import { requireAdult } from "@/lib/auth/viewer";
import { WeekReportView } from "@/features/parents/components/week-report";
import { getWeekReport, shiftWeek } from "@/features/parents/server/data";

export const metadata = { title: "Weekly report" };

export default async function WeeklyReportPage({ params, searchParams }: PageProps<"/p/kids/[id]/report">) {
  const { id } = await params;
  const { week } = await searchParams;
  const viewer = await requireAdult(`/p/kids/${id}/report`);
  const r = await getWeekReport(id, typeof week === "string" ? week : undefined);
  const current = await getWeekReport(id);
  const isCurrent = r.week_start === current.week_start;
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <nav aria-label="Weeks" className="flex flex-wrap items-center gap-2 print:hidden">
        <Link href={`/p/kids/${id}`} className="min-h-11 py-2.5 text-sm font-extrabold underline">Back to {r.kid.first_name}</Link>
        <span className="flex-1" />
        <Link href={`/p/kids/${id}/report?week=${shiftWeek(r.week_start, -7)}`} className="min-h-11 rounded-full bg-surface px-4 py-2.5 text-sm font-extrabold">Previous week</Link>
        {!isCurrent ? <Link href={`/p/kids/${id}/report?week=${shiftWeek(r.week_start, 7)}`} className="min-h-11 rounded-full bg-surface px-4 py-2.5 text-sm font-extrabold">Next week</Link> : null}
        <PrintButton>Print report</PrintButton>
      </nav>
      <WeekReportView r={r} />
    </AdultShell>
  );
}

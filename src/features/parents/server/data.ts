import "server-only";
import { notFound } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

export type WeekReport = {
  kid: { id: string; first_name: string; last_initial: string | null; class: string | null };
  club: { name: string; slug: string; faith_mode: boolean };
  week_start: string; week_end: string;
  points_week: number; stars_week: number; visits_week: number; checkins_week: number;
  points_total: number; streak_current: number; streak_best: number;
  level: string; next_level: string | null; points_to_next: number | null;
  badges_week: { name: string; icon: string }[];
  work: { title: string; submitted_at: string; grade: number | null; feedback: string | null }[];
  lessons: { id: string; title: string; memory_verse: string | null; talk: string | null; do: string | null; pray: string | null }[];
  certificates_week: { id: string; title: string }[];
};

/** A kid's week, read through kid_report so the database decides who may see it. */
export async function getWeekReport(kidId: string, week?: string): Promise<WeekReport> {
  if (!z.uuid().safeParse(kidId).success) notFound();
  const w = week && z.iso.date().safeParse(week).success ? week : undefined;
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("kid_report", { p_kid: kidId, p_week: w });
  if (error || !data) notFound();
  return data as unknown as WeekReport;
}

export function shiftWeek(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function prettyDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

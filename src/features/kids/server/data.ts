import "server-only";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { parseAvatar, type AvatarConfig } from "@/features/kids/avatar";

export type Level = { code: string; name: string; min_points: number; sort: number };

export type KidSnapshot = {
  kidId: string;
  firstName: string;
  username: string;
  confirmed: boolean;
  org: { id: string; slug: string; name: string; faithMode: boolean; timezone: string };
  /** Champzz at home: no club, so no class, teacher, messages or club tools. */
  home: boolean;
  className: string | null;
  little: boolean;
  avatar: AvatarConfig;
  points: number;
  streak: number;
  streakBest: number;
  stars: number;
  trophies: number;
  level: Level;
  next: Level | null;
  levels: Level[];
};

function todayIn(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function dayBefore(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** The signed-in kid for /k/[org]/..., or a redirect to that club's kid sign-in. */
export async function requireKid(slug: string) {
  const viewer = await getViewer();
  if (viewer.kind !== "kid" || viewer.org.slug !== slug) redirect(`/login?kid=1`);
  return viewer;
}

export async function getKidSnapshot(slug: string, opts: { recordVisit?: boolean; clubOnly?: boolean } = {}): Promise<KidSnapshot> {
  const viewer = await requireKid(slug);
  const supabase = await supabaseServer();
  if (opts.recordVisit) await supabase.rpc("record_my_visit");

  const [{ data: kid }, { data: stats }, { data: levels }, { count: trophies }] = await Promise.all([
    supabase
      .from("kids")
      .select("id, first_name, username, confirmed_at, avatar, classes(name, age_band), organizations!inner(id, slug, name, kind, faith_mode, timezone)")
      .eq("id", viewer.kid.id)
      .single(),
    supabase.from("kid_stats").select("points_total, streak_current, streak_best, last_active_day, stars").eq("kid_id", viewer.kid.id).maybeSingle(),
    supabase.from("levels").select("code, name, min_points, sort").order("sort"),
    supabase.from("kid_badges").select("badge_id", { count: "exact", head: true }).eq("kid_id", viewer.kid.id),
  ]);
  if (!kid) redirect(`/login?kid=1`);
  const home = kid.organizations.kind === "home";
  if (home && opts.clubOnly) redirect(`/k/${encodeURIComponent(slug)}/home`);

  const all = levels ?? [];
  const points = stats?.points_total ?? 0;
  const level = [...all].reverse().find((l) => l.min_points <= points) ?? all[0]!;
  const next = all.find((l) => l.min_points > points) ?? null;
  const tz = kid.organizations.timezone;
  const today = todayIn(tz);
  const last = stats?.last_active_day ?? null;
  const streak = last && (last === today || last === dayBefore(today)) ? stats!.streak_current : 0;

  return {
    kidId: kid.id,
    firstName: kid.first_name,
    username: kid.username,
    confirmed: kid.confirmed_at !== null,
    org: { id: kid.organizations.id, slug: kid.organizations.slug, name: kid.organizations.name, faithMode: kid.organizations.faith_mode, timezone: tz },
    home,
    className: kid.classes?.name ?? null,
    little: kid.classes?.age_band === "little",
    avatar: parseAvatar(kid.avatar),
    points,
    streak,
    streakBest: stats?.streak_best ?? 0,
    stars: stats?.stars ?? 0,
    trophies: trophies ?? 0,
    level,
    next,
    levels: all,
  };
}

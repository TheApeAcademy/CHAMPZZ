import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function clubToday(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

/** The season running today in the club's own time zone, if any. RLS limits it to clubs the viewer belongs to. */
export async function currentSeason(supabase: SupabaseClient<Database>, orgId: string, tz: string) {
  const today = clubToday(tz);
  const { data } = await supabase.from("seasons").select("id, name").eq("organization_id", orgId)
    .lte("starts_on", today).gte("ends_on", today).order("starts_on", { ascending: false }).limit(1).maybeSingle();
  return data;
}

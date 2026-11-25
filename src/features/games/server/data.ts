import "server-only";
import { supabaseServer } from "@/lib/supabase/server";

/** Packs a club can use: its own, plus Champzz defaults (faith packs only in faith mode). */
export async function usablePacks(orgId: string, faith: boolean) {
  const supabase = await supabaseServer();
  const { data } = await supabase.from("question_packs").select("id, name, faith, organization_id")
    .or(`organization_id.is.null,organization_id.eq.${orgId}`).order("organization_id", { nullsFirst: true }).order("name");
  return (data ?? []).filter((p) => p.organization_id !== null || !p.faith || faith);
}

/** Arena content for a club: its own plus Champzz defaults, faith items only in faith mode. */
export async function arenaContent(orgId: string, faith: boolean, game: "scramble" | "whoami" | "wordsearch") {
  const supabase = await supabaseServer();
  const { data } = await supabase.from("arena_content").select("id, title, data, faith, organization_id")
    .eq("game", game).or(`organization_id.is.null,organization_id.eq.${orgId}`);
  return (data ?? []).filter((c) => c.organization_id !== null || !c.faith || faith);
}

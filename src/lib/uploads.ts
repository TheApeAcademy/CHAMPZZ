import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Short-lived links for kid uploads. Call only with paths from rows the viewer
 * has already read through their own session (RLS decides who sees which upload).
 */
export async function signedUploadUrls(paths: string[]): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();
  const { data } = await supabaseAdmin().storage.from("kid-uploads").createSignedUrls(paths, 600);
  return new Map((data ?? []).flatMap((d) => (d.path && d.signedUrl ? [[d.path, d.signedUrl] as const] : [])));
}

import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Short-lived links for private files. Call only with paths from rows the
 * viewer has already read through their own session: RLS decides who sees what.
 */
export async function signedUrls(bucket: "kid-uploads" | "club-media" | "verse-recordings", paths: string[], seconds = 600): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();
  const { data } = await supabaseAdmin().storage.from(bucket).createSignedUrls(paths, seconds);
  return new Map((data ?? []).flatMap((d) => (d.path && d.signedUrl ? [[d.path, d.signedUrl] as const] : [])));
}

export function signedUploadUrls(paths: string[]) {
  return signedUrls("kid-uploads", paths);
}

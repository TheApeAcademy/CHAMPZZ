import "server-only";
import { notFound } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { logoUrl } from "@/lib/branding";

/** One certificate, read with the viewer's own session so RLS decides who may see it. */
export async function getCertificate(id: string) {
  if (!z.uuid().safeParse(id).success) notFound();
  const supabase = await supabaseServer();
  const { data: c } = await supabase
    .from("certificates")
    .select("id, title, reason, issued_at, organization_id, kids!inner(first_name, last_initial, organizations!inner(name))")
    .eq("id", id)
    .maybeSingle();
  if (!c) notFound();
  const { data: b } = await supabase.from("org_branding").select("primary_color, logo_path").eq("organization_id", c.organization_id).maybeSingle();
  return {
    kidName: `${c.kids.first_name}${c.kids.last_initial ? ` ${c.kids.last_initial}.` : ""}`,
    title: c.title,
    reason: c.reason,
    issuedAt: c.issued_at,
    club: c.kids.organizations.name,
    color: b?.primary_color ?? null,
    logo: logoUrl(b?.logo_path),
  };
}

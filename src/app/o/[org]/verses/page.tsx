import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { Card } from "@/components/ui/primitives";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { signedUrls } from "@/lib/uploads";
import { verseHeard, verseStar } from "@/features/delight/server/parity-actions";

export const metadata = { title: "Verse recordings" };

export default async function VersesPage({ params }: PageProps<"/o/[org]/verses">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data: items } = await supabase.from("verse_recordings").select("id, path, kid_id, created_at, kids!inner(first_name, last_initial)")
    .eq("organization_id", org.id).eq("status", "new").order("created_at").limit(50);
  const urls = await signedUrls("verse-recordings", (items ?? []).map((i) => i.path));
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="verses" />
      <h1 className="font-display text-3xl font-extrabold">Verse recordings</h1>
      <p className="max-w-2xl text-sm text-muted">Kids recording their memory verse. Listen, then give a star (10 Champ Points) or just mark it heard.</p>
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="verse-list">
          {(items ?? []).map((i) => (
            <li key={i.id} className="flex flex-col gap-2 py-3">
              <p className="font-extrabold">{i.kids.first_name}{i.kids.last_initial ? ` ${i.kids.last_initial}.` : ""} <span className="text-xs font-bold text-muted">{new Date(i.created_at).toLocaleString("en-GB")}</span></p>
              {urls.get(i.path) ? <audio controls preload="none" src={urls.get(i.path)} className="w-full max-w-md" /> : null}
              <div className="flex gap-3">
                <form action={verseStar.bind(null, slug, i.id, i.kid_id)}><button type="submit" className="min-h-11 rounded-full bg-gold px-4 font-extrabold text-ink">Give a star</button></form>
                <form action={verseHeard.bind(null, slug, i.id)}><button type="submit" className="min-h-11 text-sm font-extrabold underline">Mark heard</button></form>
              </div>
            </li>
          ))}
          {(items ?? []).length === 0 ? <li className="py-3 text-sm text-muted">No new recordings.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}

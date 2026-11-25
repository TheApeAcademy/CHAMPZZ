import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { Card } from "@/components/ui/primitives";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { signedUploadUrls } from "@/lib/uploads";
import { moderate } from "@/features/delight/server/actions";

export const metadata = { title: "Photo checks" };

export default async function ModerationPage({ params }: PageProps<"/o/[org]/moderation">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data: items } = await supabase.from("kid_uploads").select("id, path, caption, created_at, kids!inner(first_name, last_initial)")
    .eq("organization_id", org.id).eq("status", "pending").order("created_at").limit(50);
  const urls = await signedUploadUrls((items ?? []).map((i) => i.path));
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="moderation" />
      <h1 className="font-display text-3xl font-extrabold">Photo checks</h1>
      <p className="max-w-2xl text-sm text-muted">Kids&apos; pictures for My Stuff wait here until a grown-up checks them. Reject anything showing a child&apos;s face, a name, a school, an address, or anything unkind. Rejected pictures are deleted.</p>
      <Card>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="moderation-list">
          {(items ?? []).map((i) => (
            <li key={i.id} className="flex flex-col gap-2 rounded-[16px] border border-line p-3">
              {urls.get(i.path) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urls.get(i.path)} alt={i.caption ?? "Upload waiting for a check"} className="aspect-square w-full rounded-[12px] bg-cream object-contain" />
              ) : null}
              <p className="text-sm"><strong>{i.kids.first_name}{i.kids.last_initial ? ` ${i.kids.last_initial}.` : ""}</strong>{i.caption ? `: ${i.caption}` : ""}</p>
              <div className="flex gap-2">
                <form action={moderate.bind(null, slug, i.id, true)}><button type="submit" className="min-h-11 rounded-full bg-[#1E8F5A] px-4 font-extrabold text-white">Approve</button></form>
                <form action={moderate.bind(null, slug, i.id, false)}><button type="submit" className="min-h-11 rounded-full border-2 border-danger px-4 font-extrabold text-danger">Reject</button></form>
              </div>
            </li>
          ))}
          {(items ?? []).length === 0 ? <li className="text-sm text-muted">Nothing waiting. All checked!</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}

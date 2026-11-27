import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Pill, Select } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { deleteMedia, uploadMedia } from "@/features/delight/server/parity-actions";

export const metadata = { title: "Digital Bank" };

export default async function MediaPage({ params }: PageProps<"/o/[org]/media">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data: items } = await supabase.from("media_items").select("id, title, mime, size_bytes, audience, created_at").eq("organization_id", org.id).order("created_at", { ascending: false });
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="media" />
      <h1 className="font-display text-3xl font-extrabold">Digital Bank</h1>
      <p className="max-w-2xl text-sm text-muted">Your club&apos;s files in one safe place: rotas, lesson sheets, letters home, colouring pages. Keep them for the team, or share with families.</p>
      <Card>
        <ActionForm action={uploadMedia.bind(null, slug)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Title" name="title" required maxLength={100} />
          <Select label="Who can see it" name="audience" defaultValue="staff">
            <option value="staff">The team only</option>
            <option value="families">The team and families</option>
          </Select>
          <label className="flex flex-col gap-1.5 text-sm font-bold sm:col-span-2">File (PDF, PNG, JPG or WebP, up to 10 MB)
            <input type="file" name="file" required accept="application/pdf,image/png,image/jpeg,image/webp" className="text-base font-normal" />
          </label>
          <div className="sm:col-span-2"><Submit>Upload</Submit></div>
        </ActionForm>
      </Card>
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="media-list">
          {(items ?? []).map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-2 py-3">
              <a href={`/media/${m.id}`} className="font-extrabold underline">{m.title}</a>
              <span className="text-xs text-muted">{m.mime === "application/pdf" ? "PDF" : "Image"} · {Math.max(1, Math.round(m.size_bytes / 1024))} KB</span>
              <Pill tone={m.audience === "families" ? "ok" : "neutral"}>{m.audience === "families" ? "Shared with families" : "Team only"}</Pill>
              <form action={deleteMedia.bind(null, slug, m.id)} className="ml-auto"><button type="submit" className="min-h-11 text-sm font-extrabold underline">Delete</button></form>
            </li>
          ))}
          {(items ?? []).length === 0 ? <li className="py-3 text-sm text-muted">Nothing here yet.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}

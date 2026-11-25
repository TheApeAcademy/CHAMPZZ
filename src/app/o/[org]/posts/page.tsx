import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Pill } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { createPost, deletePost, setPostPublished } from "@/features/delight/server/parity-actions";

export const metadata = { title: "Clubhouse posts" };

export default async function PostsPage({ params }: PageProps<"/o/[org]/posts">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data: posts } = await supabase.from("club_posts").select("id, title, body, published, created_at").eq("organization_id", org.id).order("created_at", { ascending: false });
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="posts" />
      <h1 className="font-display text-3xl font-extrabold">Clubhouse posts</h1>
      <p className="max-w-2xl text-sm text-muted">News on your public <Link className="underline" href={`/c/${slug}`}>Clubhouse page</Link>, for families and visitors. Anyone with the link can read published posts, so never include children&apos;s names, photos, times or places you meet.</p>
      <Card>
        <ActionForm action={createPost.bind(null, slug)} className="flex flex-col gap-3">
          <Field label="Title" name="title" required maxLength={100} />
          <label className="flex flex-col gap-1.5 text-sm font-bold">Post
            <textarea name="body" required maxLength={3000} rows={4} className="rounded-[12px] border border-line bg-surface p-3 text-base font-normal" />
          </label>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="publish" defaultChecked className="h-5 w-5" /> Publish on the Clubhouse now</label>
          <div><Submit>Save post</Submit></div>
        </ActionForm>
      </Card>
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="post-list">
          {(posts ?? []).map((p) => (
            <li key={p.id} className="flex flex-col gap-1 py-3">
              <div className="flex flex-wrap items-center gap-2"><span className="font-extrabold">{p.title}</span><Pill tone={p.published ? "ok" : "neutral"}>{p.published ? "Published" : "Draft"}</Pill></div>
              <p className="whitespace-pre-wrap text-sm">{p.body}</p>
              <div className="flex gap-4">
                <form action={setPostPublished.bind(null, slug, p.id, !p.published)}><button type="submit" className="min-h-11 text-sm font-extrabold underline">{p.published ? "Unpublish" : "Publish"}</button></form>
                <form action={deletePost.bind(null, slug, p.id)}><button type="submit" className="min-h-11 text-sm font-extrabold underline">Delete</button></form>
              </div>
            </li>
          ))}
          {(posts ?? []).length === 0 ? <li className="py-3 text-sm text-muted">No posts yet.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}

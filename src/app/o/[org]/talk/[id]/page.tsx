import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Pill, Select } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { addConcernNote, replyConcern, setConcernStatus } from "@/features/safeguarding/server/actions";

export const metadata = { title: "Talk to Someone" };

export default async function ConcernPage({ params }: PageProps<"/o/[org]/talk/[id]">) {
  const { org: slug, id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { viewer } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data: rows, error } = await supabase.rpc("staff_concern", { p_concern: id });
  const c = rows?.[0];
  if (error || !c) notFound();
  const [{ data: replies }, { data: notes }] = await Promise.all([
    supabase.rpc("staff_concern_replies", { p_concern: id }),
    supabase.rpc("staff_concern_notes", { p_concern: id }),
  ]);
  const path = `/o/${slug}/talk/${id}`;
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="talk" />
      <Link href={`/o/${slug}/talk`} className="text-sm font-extrabold underline">All messages</Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-extrabold" data-testid="concern-from">{c.kid_label}</h1>
        {c.class_name ? <span className="text-muted">{c.class_name}</span> : null}
        <Pill tone={c.status === "resolved" ? "ok" : "warn"}><span data-testid="concern-status">{c.status.replace("_", " ")}</span></Pill>
      </div>
      {c.is_anonymous ? <p className="rounded-[14px] bg-cream p-3 text-sm font-bold">This child chose to stay anonymous. Reply here and they will see it. If you believe a child is in danger, follow your club&apos;s safeguarding policy.</p> : null}
      <Card>
        <p className="whitespace-pre-wrap text-lg" data-testid="concern-body">{c.body}</p>
        <p className="mt-2 text-xs text-muted">{new Date(c.created_at).toLocaleString("en-GB")}</p>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">Conversation</h2>
        <ul className="mb-4 flex flex-col gap-2" data-testid="concern-replies">
          {(replies ?? []).map((r) => (
            <li key={r.id} className={`rounded-[14px] p-3 ${r.from_staff ? "bg-[#DDE5FF]" : "bg-cream"}`}>
              <p className="text-xs font-extrabold">{r.author}</p>
              <p className="whitespace-pre-wrap">{r.body}</p>
            </li>
          ))}
        </ul>
        <ActionForm action={replyConcern.bind(null, path, id)} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-bold">Reply to the child
            <textarea name="body" required maxLength={2000} rows={3} className="rounded-[12px] border border-line bg-surface p-3 text-base font-normal" />
          </label>
          <div><Submit>Send reply</Submit></div>
        </ActionForm>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-extrabold">Status</h2>
          <ActionForm action={setConcernStatus.bind(null, slug, id)} className="flex flex-col gap-3">
            <Select label="Set status" name="status" defaultValue={c.status === "new" ? "acknowledged" : c.status}>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In progress</option>
              <option value="escalated">Escalate to Org Admins</option>
              <option value="resolved">Resolved</option>
            </Select>
            <div><Submit variant="outline">Update</Submit></div>
          </ActionForm>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-extrabold">Staff notes</h2>
          <ul className="mb-3 flex flex-col gap-2 text-sm">
            {(notes ?? []).map((n) => <li key={n.id} className="rounded-[12px] bg-cream p-2"><span className="font-extrabold">{n.author}: </span>{n.body}</li>)}
          </ul>
          <ActionForm action={addConcernNote.bind(null, slug, id)} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-bold">Add a note (never shown to the child)
              <textarea name="body" required maxLength={2000} rows={2} className="rounded-[12px] border border-line bg-surface p-3 text-base font-normal" />
            </label>
            <div><Submit variant="outline">Save note</Submit></div>
          </ActionForm>
        </Card>
      </div>
    </AdultShell>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { sendMessage } from "@/features/classlife/server/actions";

export const metadata = { title: "Messages" };

export default async function StaffThreadPage({ params }: PageProps<"/o/[org]/messages/[kid]">) {
  const { org: slug, kid: kidId } = await params;
  if (!z.uuid().safeParse(kidId).success) notFound();
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const [{ data: kid }, { data: msgs }] = await Promise.all([
    supabase.from("kids").select("id, first_name, last_initial").eq("id", kidId).eq("organization_id", org.id).maybeSingle(),
    supabase.from("messages").select("id, body, from_staff, created_at, author_id").eq("kid_id", kidId).order("created_at"),
  ]);
  if (!kid) notFound();
  const path = `/o/${slug}/messages/${kidId}`;
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="messages" />
      <Link href={`/o/${slug}/messages`} className="text-sm font-extrabold underline">All threads</Link>
      <h1 className="font-display text-3xl font-extrabold">{kid.first_name}{kid.last_initial ? ` ${kid.last_initial}.` : ""}</h1>
      <Card>
        <ul className="mb-4 flex flex-col gap-2" data-testid="thread">
          {(msgs ?? []).map((m) => (
            <li key={m.id} className={`max-w-[85%] rounded-[16px] p-3 ${m.from_staff ? "self-end bg-[#DDE5FF]" : "self-start bg-cream"}`}>
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className="text-[11px] text-muted">{m.from_staff ? "Staff" : kid.first_name} · {new Date(m.created_at).toLocaleString("en-GB")}</p>
            </li>
          ))}
          {(msgs ?? []).length === 0 ? <li className="text-sm text-muted">No messages yet.</li> : null}
        </ul>
        <ActionForm action={sendMessage.bind(null, path, kidId)} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-bold">Message
            <textarea name="body" required maxLength={1000} rows={2} className="rounded-[12px] border border-line bg-surface p-3 text-base font-normal" />
          </label>
          <div><Submit>Send</Submit></div>
        </ActionForm>
      </Card>
    </AdultShell>
  );
}

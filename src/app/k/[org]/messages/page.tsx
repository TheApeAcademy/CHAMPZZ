import { KidShell } from "@/features/kids/components/kid-shell";
import { ActionForm } from "@/components/ui/action-form";
import { Submit } from "@/components/ui/submit";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";
import { sendMessage } from "@/features/classlife/server/actions";

export const metadata = { title: "Messages" };

export default async function KidMessagesPage({ params }: PageProps<"/k/[org]/messages">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  const supabase = await supabaseServer();
  const { data: msgs } = await supabase.from("messages").select("id, body, from_staff, created_at").eq("kid_id", k.kidId).order("created_at");
  const path = `/k/${org}/messages`;
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">Messages</h1>
      <p className="text-sm text-muted">Talk to your teachers. Your club&apos;s grown-ups can all see these messages.</p>
      <ul className="flex flex-col gap-2" data-testid="kid-thread">
        {(msgs ?? []).map((m) => (
          <li key={m.id} className={`max-w-[85%] rounded-[16px] p-3 ${m.from_staff ? "self-start bg-surface" : "self-end bg-brand text-white"}`}>
            <p className="whitespace-pre-wrap">{m.body}</p>
            <p className="text-[11px] opacity-80">{m.from_staff ? "Teacher" : "You"}</p>
          </li>
        ))}
      </ul>
      {k.confirmed ? (
        <ActionForm action={sendMessage.bind(null, path, null)} className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 font-bold">Message
            <textarea name="body" required maxLength={1000} rows={2} className="rounded-[14px] border border-line bg-surface p-3 text-base font-normal" />
          </label>
          <Submit>Send</Submit>
        </ActionForm>
      ) : (
        <p className="rounded-[14px] bg-[#FCEBC4] p-3 text-sm font-bold text-[#5A3F00]" data-testid="messages-locked">Messages open after your teacher says hi at your first visit. If something is wrong, you can always use Talk to Someone.</p>
      )}
    </KidShell>
  );
}

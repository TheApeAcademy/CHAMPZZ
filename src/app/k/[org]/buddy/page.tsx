import Link from "next/link";
import { KidShell } from "@/features/kids/components/kid-shell";
import { ActionForm } from "@/components/ui/action-form";
import { Submit } from "@/components/ui/submit";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";
import { buddySend } from "@/features/delight/server/actions";

export const metadata = { title: "Champ Buddy" };

export default async function BuddyPage({ params }: PageProps<"/k/[org]/buddy">) {
  const { org } = await params;
  const k = await getKidSnapshot(org, { clubOnly: true });
  const supabase = await supabaseServer();
  const { data: s } = await supabase.rpc("ai_status");
  const st = s as { plan: boolean; club: boolean; consent: boolean; active: boolean; used_today: number; limit: number } | null;
  const on = Boolean(st?.plan && st.club && st.consent && st.active);
  const { data: msgs } = on ? await supabase.from("ai_messages").select("id, role, body").eq("kid_id", k.kidId).order("id", { ascending: false }).limit(30) : { data: [] };
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">Champ Buddy</h1>
      {!on ? (
        <p className="rounded-[20px] bg-surface p-4 font-bold" data-testid="buddy-off">
          {!st?.plan || !st.club ? "Champ Buddy is not switched on at your club yet." : !st.consent ? "Champ Buddy needs a yes from your parent or guardian first. They can switch it on from their Champzz page." : "Champ Buddy is resting right now."}
        </p>
      ) : (
        <>
          <p className="-mt-2 text-sm text-muted">A computer helper for questions and ideas. It is not a person. Grown-ups at your club and at home can read these chats. Never share your name, address or phone number. If something is wrong, use <Link href={`/k/${org}/talk`} className="underline">Talk to Someone</Link>.</p>
          <ul className="flex flex-col gap-2" data-testid="buddy-thread">
            {(msgs ?? []).slice().reverse().map((m) => (
              <li key={m.id} className={`max-w-[85%] whitespace-pre-wrap rounded-[16px] p-3 ${m.role === "kid" ? "self-end bg-brand text-white" : "self-start bg-surface"}`}>{m.body}</li>
            ))}
          </ul>
          <ActionForm action={buddySend.bind(null, org)} className="flex flex-col gap-2">
            <label className="flex flex-col gap-1 font-bold">Ask Champ Buddy
              <textarea name="message" required maxLength={500} rows={2} className="rounded-[14px] border border-line bg-surface p-3 text-base font-normal" />
            </label>
            <Submit>Send</Submit>
            <p className="text-xs text-muted">{Math.max(0, (st?.limit ?? 30) - (st?.used_today ?? 0))} messages left today</p>
          </ActionForm>
        </>
      )}
    </KidShell>
  );
}

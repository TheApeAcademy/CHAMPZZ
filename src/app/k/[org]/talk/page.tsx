import { KidShell } from "@/features/kids/components/kid-shell";
import { ActionForm } from "@/components/ui/action-form";
import { Submit } from "@/components/ui/submit";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";
import { kidSendConcern, replyConcern } from "@/features/safeguarding/server/actions";

export const metadata = { title: "Talk to Someone" };

// Deliberately calm: no points, no colours that shout, no game language.
export default async function KidTalkPage({ params }: PageProps<"/k/[org]/talk">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  const supabase = await supabaseServer();
  const { data: mine } = await supabase.rpc("my_concerns");
  const threads = await Promise.all((mine ?? []).map(async (c) => ({ c, replies: (await supabase.rpc("my_concern_replies", { p_concern: c.id })).data ?? [] })));
  const path = `/k/${org}/talk`;
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <section className="flex flex-col gap-3 rounded-[24px] border-2 border-[#9CC8B0] bg-[#E8F5EE] p-5">
        <h1 className="text-2xl font-extrabold text-[#123D29]">Talk to Someone</h1>
        <p className="text-[#123D29]">If something is wrong, or you feel worried, scared or sad, you can tell a trusted adult here. Only the grown-ups who look after children in your club can read it.</p>
        <p className="text-sm text-[#123D29]">If you are in danger right now, tell an adult near you straight away.</p>
      </section>
      <ActionForm action={kidSendConcern.bind(null, org)} className="flex flex-col gap-3 rounded-[24px] bg-surface p-5">
        <label className="flex flex-col gap-1.5 font-extrabold">What would you like to tell us?
          <textarea name="body" required maxLength={2000} rows={5} className="rounded-[14px] border border-line bg-cream p-3 text-base font-normal" />
        </label>
        <label className="flex items-start gap-2 text-sm font-bold">
          <input type="checkbox" name="anonymous" className="mt-0.5 h-6 w-6" />
          <span>Don&apos;t show my name. The grown-ups will not know it was me, but they can still write back to you here.</span>
        </label>
        <Submit>Send</Submit>
      </ActionForm>
      <ul className="flex flex-col gap-3" data-testid="my-concerns">
        {threads.map(({ c, replies }) => (
          <li key={c.id} className="flex flex-col gap-2 rounded-[20px] bg-surface p-4">
            <p className="text-xs font-bold text-muted">{new Date(c.created_at).toLocaleString("en-GB")}{c.is_anonymous ? " · without your name" : ""}</p>
            <p className="whitespace-pre-wrap">{c.body}</p>
            {replies.map((r) => (
              <div key={r.id} className={`rounded-[14px] p-3 ${r.from_staff ? "bg-[#E8F5EE]" : "bg-cream"}`}>
                <p className="text-xs font-extrabold">{r.author}</p>
                <p className="whitespace-pre-wrap">{r.body}</p>
              </div>
            ))}
            {replies.some((r) => r.from_staff) ? (
              <ActionForm action={replyConcern.bind(null, path, c.id)} className="flex flex-col gap-2">
                <label className="flex flex-col gap-1 text-sm font-bold">Write back
                  <textarea name="body" required maxLength={2000} rows={2} className="rounded-[12px] border border-line bg-cream p-2 text-base font-normal" />
                </label>
                <Submit variant="outline">Send</Submit>
              </ActionForm>
            ) : <p className="text-sm text-muted">A grown-up will read this soon.</p>}
          </li>
        ))}
      </ul>
    </KidShell>
  );
}

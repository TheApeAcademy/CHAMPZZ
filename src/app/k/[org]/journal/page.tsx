import { KidShell } from "@/features/kids/components/kid-shell";
import { ActionForm } from "@/components/ui/action-form";
import { Submit } from "@/components/ui/submit";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";
import { addJournal, deleteJournal, markAnswered } from "@/features/delight/server/actions";
import Link from "next/link";
import { PRAYER_COUNTRIES, flagEmoji } from "@/content/prayer-countries";

export const metadata = { title: "My journal" };

export default async function JournalPage({ params }: PageProps<"/k/[org]/journal">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  const supabase = await supabaseServer();
  const { data: entries } = await supabase.from("journal_entries").select("id, kind, body, answered_at, created_at").order("created_at", { ascending: false }).limit(50);
  const day = Math.floor(new Date(`${new Intl.DateTimeFormat("en-CA", { timeZone: k.org.timezone }).format(new Date())}T00:00:00Z`).getTime() / 86_400_000);
  const country = PRAYER_COUNTRIES[day % PRAYER_COUNTRIES.length];
  const path = `/k/${org}`;
  const label = { prayer: "Prayer", thanks: "Thank you", note: "Note" } as Record<string, string>;
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">{k.org.faithMode ? "Prayer and journal" : "My journal"}</h1>
      <p className="rounded-[16px] bg-[#E6ECFF] p-3 text-sm font-bold text-[#1A2C80]" data-testid="journal-private">
        Only you can read this. Not your teachers, not your parents. If something is wrong, please tell a grown-up or use <Link className="underline" href={`${path}/talk`}>Talk to Someone</Link>.
      </p>
      {k.org.faithMode ? (
        <section className="rounded-[20px] bg-ink p-4 text-cream" data-testid="pray-for">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gold">Pray for the world today</p>
          <p className="text-lg font-bold">
            <span aria-hidden="true">{flagEmoji(country.code)} </span>Pray for {country.name}.
          </p>
          <p className="mt-1 text-sm text-cream/80">{country.focus}</p>
        </section>
      ) : null}
      <ActionForm action={addJournal.bind(null, org)} className="flex flex-col gap-3 rounded-[20px] bg-surface p-4">
        <fieldset className="flex flex-wrap gap-3">
          <legend className="mb-1 text-sm font-extrabold">What is it?</legend>
          {(k.org.faithMode ? ["prayer", "thanks", "note"] : ["thanks", "note"]).map((v, i) => (
            <label key={v} className="flex min-h-11 items-center gap-2 font-bold"><input type="radio" name="kind" value={v} defaultChecked={i === 0} className="h-5 w-5" />{label[v]}</label>
          ))}
        </fieldset>
        <label className="flex flex-col gap-1 font-bold">Write it here
          <textarea name="body" required maxLength={1000} rows={3} className="rounded-[14px] border border-line bg-cream p-3 text-base font-normal" />
        </label>
        <Submit>Save</Submit>
      </ActionForm>
      <ul className="flex flex-col gap-2" data-testid="journal-list">
        {(entries ?? []).map((e) => (
          <li key={e.id} className="flex flex-col gap-1 rounded-[16px] bg-surface p-3">
            <p className="text-xs font-extrabold uppercase text-muted">{label[e.kind]} · {new Date(e.created_at).toLocaleDateString("en-GB")}{e.answered_at ? " · Answered!" : ""}</p>
            <p className="whitespace-pre-wrap">{e.body}</p>
            <div className="flex gap-4">
              {e.kind === "prayer" && !e.answered_at ? <form action={markAnswered.bind(null, org, e.id)}><button className="min-h-11 text-sm font-extrabold underline" type="submit">Mark as answered</button></form> : null}
              <form action={deleteJournal.bind(null, org, e.id)}><button className="min-h-11 text-sm font-extrabold underline" type="submit">Delete</button></form>
            </div>
          </li>
        ))}
      </ul>
    </KidShell>
  );
}

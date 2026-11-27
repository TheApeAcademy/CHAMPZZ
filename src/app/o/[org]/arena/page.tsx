import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Select } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { addArenaContent, deleteArenaContent } from "@/features/games/server/actions";

export const metadata = { title: "Arena content" };

export default async function ArenaContentPage({ params }: PageProps<"/o/[org]/arena">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data: items } = await supabase.from("arena_content").select("id, game, title, data").eq("organization_id", org.id).order("created_at", { ascending: false });
  const label = { scramble: "Scramble", whoami: "Who Am I?", wordsearch: "Word Search" } as Record<string, string>;
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="arena" />
      <h1 className="font-display text-3xl font-extrabold">Arena content</h1>
      <p className="max-w-2xl text-sm text-muted">Kids play six games in the Arena with Champzz content. Add your own here and it mixes in for your club only: this week&apos;s memory verse to scramble, a Who Am I? about your lesson, or a word search of class words.</p>
      <Card>
        <ActionForm action={addArenaContent.bind(null, slug)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select label="Game" name="game" defaultValue="scramble">
            <option value="scramble">Scramble: a sentence to put in order</option>
            <option value="whoami">Who Am I?: clues, one per line</option>
            <option value="wordsearch">Word Search: 4 to 10 words</option>
          </Select>
          <Field label="Title" name="title" required maxLength={80} placeholder="This week's verse" />
          <Field label="Answer (Who Am I? only)" name="answer" maxLength={40} />
          <label className="flex flex-col gap-1.5 text-sm font-bold sm:col-span-2">Content
            <textarea name="content" required rows={4} maxLength={600} className="rounded-[12px] border border-line bg-surface p-3 text-base font-normal"
              placeholder="Scramble: the sentence. Who Am I?: one clue per line. Word Search: words separated by commas." />
          </label>
          <div className="sm:col-span-2"><Submit>Add</Submit></div>
        </ActionForm>
      </Card>
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="arena-content-list">
          {(items ?? []).map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-2 py-3">
              <span className="rounded-full bg-cream px-2 py-0.5 text-xs font-extrabold">{label[i.game]}</span>
              <span className="flex-1 font-bold">{i.title}</span>
              <form action={deleteArenaContent.bind(null, slug, i.id)}><button type="submit" className="min-h-11 text-sm font-extrabold underline">Remove</button></form>
            </li>
          ))}
          {(items ?? []).length === 0 ? <li className="py-3 text-sm text-muted">Nothing from your club yet. Kids still have all the Champzz content.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}

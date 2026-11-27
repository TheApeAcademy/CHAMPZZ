import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { Banner, buttonClass } from "@/components/ui/primitives";
import { getViewer } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { ClubCard } from "@/features/clubs/components/club-card";

export const metadata = { title: "Find a club", description: "Browse churches, clubs and schools on Champzz." };

export default async function ClubsPage({ searchParams }: PageProps<"/clubs">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.slice(0, 60) : "";
  const supabase = await supabaseServer();
  const viewer = await getViewer();
  const [{ data: clubs }, follows] = await Promise.all([
    supabase.rpc("list_clubs", { p_query: query || undefined }),
    viewer.kind === "adult" ? supabase.from("club_follows").select("organizations!inner(slug)") : Promise.resolve({ data: [] as { organizations: { slug: string } }[] }),
  ]);
  const followed = new Set((follows.data ?? []).map((f) => f.organizations.slug));

  return (
    <AdultShell who={viewer.kind === "adult" ? viewer.fullName || viewer.email || undefined : undefined}>
      <section className="flex flex-col gap-3">
        <p className="text-sm font-extrabold uppercase tracking-widest text-brand">Club directory</p>
        <h1 className="font-display text-4xl font-black italic uppercase">Find a club</h1>
        <p className="max-w-2xl text-muted">
          Churches, clubs and schools on Champzz. Follow one to see its news in your feed. To sign a child up, a parent registers them on the club&apos;s page with the club&apos;s join code. Kids never join on their own.
        </p>
        <form className="flex max-w-xl gap-2" role="search">
          <label className="sr-only" htmlFor="club-search">Search clubs</label>
          <input id="club-search" name="q" defaultValue={query} placeholder="Search by name, city or what they do" className="min-h-11 flex-1 rounded-[12px] border border-line bg-surface px-3" />
          <button type="submit" className={buttonClass()}>Search</button>
        </form>
      </section>
      {(clubs ?? []).length === 0 ? (
        <Banner>{query ? `No clubs match "${query}".` : "No clubs are listed yet."} <Link className="underline" href="/clubs">Show all clubs</Link></Banner>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="club-directory">
          {(clubs ?? []).map((c) => <ClubCard key={c.slug} club={{ ...c, following: followed.has(c.slug) }} />)}
        </div>
      )}
      <p className="text-sm text-muted">Run a club? <Link className="font-extrabold underline" href="/signup">Start your club on Champzz</Link> and list it here from Club settings.</p>
    </AdultShell>
  );
}

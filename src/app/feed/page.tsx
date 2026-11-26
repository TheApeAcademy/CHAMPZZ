import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { buttonClass } from "@/components/ui/primitives";
import { requireAdult } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { logoUrl, textOn } from "@/lib/branding";

export const metadata = { title: "Feed" };

/** News from the clubs you follow, your kids' clubs and the clubs you work in. Adults only. */
export default async function FeedPage() {
  const viewer = await requireAdult("/feed");
  const supabase = await supabaseServer();
  const { data: posts } = await supabase.rpc("my_feed");

  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Your feed</h1>
          <p className="text-muted">News from the clubs you follow, your kids&apos; clubs and the clubs you work in.</p>
        </div>
        <Link href="/clubs" className={buttonClass("outline")}>Find clubs</Link>
      </div>
      {(posts ?? []).length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-line bg-surface p-6 text-center" data-testid="feed-empty">
          <p className="font-extrabold">Nothing here yet.</p>
          <p className="text-muted">Follow a few clubs and their news will show up here.</p>
          <Link href="/clubs" className={`${buttonClass()} mt-3 inline-flex`}>Browse clubs</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4" data-testid="feed">
          {(posts ?? []).map((p) => {
            const color = p.primary_color || "#2F5BFF";
            const logo = logoUrl(p.logo_path);
            return (
              <article key={p.post_id} className="overflow-hidden rounded-[20px] border border-line bg-surface">
                <Link href={`/c/${p.club_slug}`} className="flex items-center gap-2 px-5 py-2.5 text-sm font-extrabold" style={{ background: color, color: textOn(color) }}>
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="h-6 w-6 rounded-[6px] bg-cream object-contain" />
                  ) : null}
                  {p.club_name}
                </Link>
                <div className="p-5">
                  <h2 className="text-lg font-extrabold">{p.title}</h2>
                  <p className="text-xs font-bold text-muted">{new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <p className="mt-2 whitespace-pre-wrap">{p.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AdultShell>
  );
}

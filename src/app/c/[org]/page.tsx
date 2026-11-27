import Link from "next/link";
import { notFound } from "next/navigation";
import { AdultShell } from "@/components/shell";
import { ActionForm } from "@/components/ui/action-form";
import { Banner, Field, buttonClass } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { getViewer } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { slugSchema } from "@/lib/validation";
import { logoUrl, textOn } from "@/lib/branding";
import { registerKid } from "@/features/registration/server/actions";
import { PicturePin } from "@/features/kids/components/picture-pin";
import { requestToTeach, setFollow } from "@/features/clubs/server/actions";

export async function generateMetadata({ params }: PageProps<"/c/[org]">) {
  const { org } = await params;
  const slug = slugSchema.safeParse(org);
  if (!slug.success) return { title: "Clubhouse" };
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("get_clubhouse", { p_slug: slug.data });
  const club = data?.[0];
  if (!club) return { title: "Clubhouse" };
  const description = club.tagline || `${club.name} on Champzz: news, events and how to add your child.`;
  return { title: club.name, description, openGraph: { title: `${club.name} · Champzz`, description }, robots: club.listed ? undefined : { index: false } };
}

export default async function ClubhousePage({ params }: PageProps<"/c/[org]">) {
  const { org: rawSlug } = await params;
  const slug = slugSchema.safeParse(rawSlug);
  if (!slug.success) notFound();
  const supabase = await supabaseServer();
  const [{ data }, { data: posts }] = await Promise.all([
    supabase.rpc("get_clubhouse", { p_slug: slug.data }),
    supabase.rpc("get_clubhouse_posts", { p_slug: slug.data }),
  ]);
  const club = data?.[0];
  if (!club) notFound();
  const viewer = await getViewer();
  const logo = logoUrl(club.logo_path);
  const following = viewer.kind === "adult" && club.listed
    ? Boolean((await supabase.from("club_follows").select("organization_id").eq("organization_id", club.organization_id).maybeSingle()).data)
    : false;

  const color = club.primary_color || "#1E8F5A";
  const ink = textOn(color);
  const initials = club.name.split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]!.toUpperCase()).join("");
  const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const tab = "inline-flex min-h-11 flex-none items-center rounded-full px-4 text-[15px] font-extrabold text-ink hover:bg-[#F3EADA]";

  return (
    <AdultShell wide who={viewer.kind === "adult" ? viewer.fullName || viewer.email || undefined : undefined}>
      <section className="flex flex-col gap-4">
        <div className="relative h-[clamp(120px,26vw,220px)] overflow-hidden rounded-[28px] border-[3px] border-ink shadow-[0_6px_0_var(--ink)]" style={{ background: color }}>
          <div aria-hidden="true" className="cz-dots absolute inset-0" />
        </div>
        <div className="-mt-14 flex flex-wrap items-end gap-x-5 gap-y-3 px-1 sm:-mt-16">
          <span className="relative grid h-24 w-24 flex-none place-items-center overflow-hidden rounded-full border-[3px] border-ink bg-[#FFFDF7] shadow-[0_0_0_5px_var(--cream)] sm:h-28 sm:w-28">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={`${club.name} logo`} className="h-full w-full object-contain p-2" />
            ) : (
              <span className="grid h-full w-full place-items-center font-display text-4xl font-black italic" style={{ background: color, color: ink }}>{initials}</span>
            )}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 px-1">
          <h1 className="cz-display text-[clamp(44px,12vw,76px)]" data-testid="clubhouse-name">{club.name}</h1>
          <p className="font-bold text-muted"><span className="text-ink">c/{club.slug}</span>{club.tagline ? <> · {club.tagline}</> : null}</p>
          {club.city ? <p className="text-sm font-bold text-muted">{club.city}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-3 px-1">
          {club.listed ? (
            viewer.kind === "adult" ? (
              <ActionForm action={setFollow.bind(null, club.slug, !following)}>
                <Submit variant={following ? "ghost" : "outline"}>{following ? "Following" : "Follow"}</Submit>
              </ActionForm>
            ) : viewer.kind === "anonymous" ? (
              <Link className={buttonClass("outline")} href={`/login?next=${encodeURIComponent(`/c/${club.slug}`)}`}>Sign in to follow</Link>
            ) : null
          ) : null}
          {!club.demo && club.joinable ? <a href="#add-child" className={buttonClass("gold")}>Add my child</a> : null}
        </div>
        <nav aria-label="Clubhouse" className="cz-scroll-x -mx-1 flex gap-1 border-b-2 border-line px-1 pb-1">
          <a href="#news" className={`${tab} bg-ink !text-cream`}>Home</a>
          <a href="#about" className={tab}>About</a>
          <a href="#add-child" className={tab}>Add your child</a>
          {!club.demo && club.listed ? <a href="#teach" className={tab}>Teach here</a> : null}
        </nav>
      </section>

      {!club.listed && !club.demo ? <Banner>This is a private club. Its news is for members. If you are a parent, ask the club leader for the join code.</Banner> : null}
      {club.demo ? <Banner>This is a demo club made up to show what Champzz looks like. It has no members, and children cannot be added to it.</Banner> : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <section id="news" className="flex scroll-mt-24 flex-col gap-4" data-testid={(posts ?? []).length > 0 ? "clubhouse-posts" : undefined}>
            <h2 className="cz-display text-[36px]">News</h2>
            {(posts ?? []).length === 0 ? (
              <p className="rounded-[22px] border-2 border-dashed border-line bg-[#FFFDF7] p-5 text-muted">No news yet. When the club posts, it shows up here.</p>
            ) : (posts ?? []).map((p) => (
              <article key={p.id} className="flex flex-col gap-2.5 rounded-[26px] border-[2.5px] border-ink bg-[#FFFDF7] p-5 shadow-[0_5px_0_var(--ink)]">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-full text-[13px] font-black" style={{ background: color, color: ink }}>{initials}</span>
                  <span className="min-w-0 text-[15px] leading-tight"><b className="block truncate">{club.name}</b><span className="text-sm text-muted">{date(p.created_at)}</span></span>
                </div>
                <h3 className="text-[22px] font-black leading-tight">{p.title}</h3>
                <p className="whitespace-pre-wrap text-[17px] leading-relaxed">{p.body}</p>
              </article>
            ))}
          </section>

          <section id="add-child" className="scroll-mt-24 rounded-[32px] border-4 border-ink bg-[#FFFDF7] p-[clamp(18px,5vw,32px)] shadow-[0_10px_0_var(--ink)]">
            <h2 className="cz-display mb-2 text-[clamp(38px,10vw,56px)]">Add your child</h2>
            {club.demo ? (
              <Banner>Demo clubs do not take members. Ask your own club leader for their Champzz join code.</Banner>
            ) : !club.joinable ? (
              <Banner tone="warn">This club is not taking new members right now. Ask the club leader.</Banner>
            ) : viewer.kind !== "adult" ? (
              <div className="flex flex-col gap-3">
                <p className="text-muted">Parents and guardians sign in first. You will need the join code from the club leader.</p>
                <div className="flex flex-wrap gap-3">
                  <Link className={buttonClass("gold")} href={`/signup?next=${encodeURIComponent(`/c/${club.slug}`)}`}>Create a parent account</Link>
                  <Link className={buttonClass("outline")} href={`/login?next=${encodeURIComponent(`/c/${club.slug}`)}`}>Sign in</Link>
                </div>
              </div>
            ) : (
              <ActionForm action={registerKid.bind(null, club.slug)} className="flex flex-col gap-[18px]">
                <p className="text-muted">Your child gets their own username and a picture PIN to sign in with. We only ask for a first name and the first letter of the surname.</p>
                <Field big label="Join code" name="joinCode" required placeholder="ABCD-2345" autoComplete="off" autoCapitalize="characters" spellCheck={false} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
                  <Field big label="Child's first name" name="firstName" required maxLength={40} autoComplete="off" />
                  <Field big label="Surname initial" name="lastInitial" maxLength={1} autoComplete="off" />
                </div>
                <PicturePin legend="Pick 4 pictures for your child" />
                <label className="flex items-start gap-3 text-[15px]">
                  <input type="checkbox" name="consent" required className="mt-0.5 h-6 w-6 flex-none accent-[#2F5BFF]" />
                  <span>I am this child&apos;s parent or guardian. I agree to the club using Champzz for my child, and to the privacy notice.</span>
                </label>
                <label className="flex items-start gap-3 text-[15px]">
                  <input type="checkbox" name="photos" className="mt-0.5 h-6 w-6 flex-none accent-[#2F5BFF]" />
                  <span>Optional: the club may show photos of my child inside the club (never in public).</span>
                </label>
                <Submit variant="gold" size="lg">Add my child</Submit>
              </ActionForm>
            )}
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-5">
          <section id="about" className="scroll-mt-24 rounded-[24px] border border-line bg-surface p-5">
            <h2 className="text-xl font-black">{club.name}</h2>
            {club.tagline ? <p className="mt-2 text-muted">{club.tagline}</p> : null}
            {club.city ? <p className="mt-3 text-sm font-extrabold text-brand">{club.city}</p> : null}
            <p className="mt-3 text-sm font-bold text-muted">{club.faith_mode ? "Children's ministry" : "Kids' club"} on Champzz</p>
          </section>
          {club.motto ? (
            <figure className="rounded-[24px] border-[3px] border-ink p-5 shadow-[0_6px_0_var(--ink)]" style={{ background: color, color: ink }} data-testid="clubhouse-motto">
              <figcaption className="mb-1 text-xs font-black uppercase tracking-[.14em] opacity-80">Our motto</figcaption>
              <blockquote className="whitespace-pre-line text-2xl font-black leading-tight">{club.motto}</blockquote>
            </figure>
          ) : null}
          <section className="rounded-[24px] border border-line bg-surface p-5">
            <h2 className="mb-3 text-xs font-black uppercase tracking-[.14em] text-muted">Clubhouse rules</h2>
            <ol className="flex flex-col gap-3">
              {["Be kind in every word", "First names only, never addresses", "Cheer each other on"].map((r, i) => (
                <li key={r} className="flex items-start gap-3"><span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-ink text-xs font-black text-cream">{i + 1}</span><span className="font-extrabold">{r}</span></li>
              ))}
            </ol>
          </section>
          {!club.demo && club.listed && viewer.kind !== "kid" ? (
            <section id="teach" className="scroll-mt-24 rounded-[24px] border border-line bg-surface p-5">
              <h2 className="mb-1 text-xl font-black">Teach here</h2>
              {viewer.kind === "adult" ? (
                <ActionForm action={requestToTeach.bind(null, club.slug)}>
                  <p className="text-sm text-muted">Ask to join this club as a teacher. The club leader approves you first.</p>
                  <Field label="A short note for the leader (optional)" name="note" maxLength={300} placeholder="e.g. I help with the 8 to 12s on Sundays" />
                  <Submit variant="outline">Ask to teach here</Submit>
                </ActionForm>
              ) : (
                <p className="text-sm text-muted"><Link className="font-extrabold underline" href={`/login?next=${encodeURIComponent(`/c/${club.slug}`)}`}>Sign in</Link> to ask to teach at this club.</p>
              )}
            </section>
          ) : null}
        </aside>
      </div>
    </AdultShell>
  );
}

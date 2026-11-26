import Link from "next/link";
import { notFound } from "next/navigation";
import { AdultShell } from "@/components/shell";
import { ActionForm } from "@/components/ui/action-form";
import { Banner, Card, Field, buttonClass } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { getViewer } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { slugSchema } from "@/lib/validation";
import { logoUrl, textOn } from "@/lib/branding";
import { registerKid } from "@/features/registration/server/actions";
import { PicturePin } from "@/features/kids/components/picture-pin";
import { setFollow } from "@/features/clubs/server/actions";

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

  return (
    <AdultShell who={viewer.kind === "adult" ? viewer.fullName || viewer.email || undefined : undefined}>
      <section className="flex flex-wrap items-center gap-5 rounded-[28px] bg-ink p-8 text-cream"
        style={club.primary_color ? { background: club.primary_color, color: textOn(club.primary_color) } : undefined}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={`${club.name} logo`} className="h-20 w-20 rounded-[18px] bg-cream object-contain p-2" />
        ) : null}
        <div>
          <p className={`text-sm font-extrabold uppercase tracking-widest ${club.primary_color ? "" : "text-gold"}`}>Clubhouse</p>
          <h1 className="font-display text-4xl font-black italic uppercase" data-testid="clubhouse-name">{club.name}</h1>
          {club.tagline ? <p className="mt-2 max-w-xl">{club.tagline}</p> : null}
          {club.city ? <p className="mt-1 text-sm font-bold opacity-80">{club.city}</p> : null}
        </div>
        {club.listed ? (
          <div className="ml-auto">
            {viewer.kind === "adult" ? (
              <ActionForm action={setFollow.bind(null, club.slug, !following)}>
                <Submit variant={following ? "outline" : "primary"}>{following ? "Following" : "Follow"}</Submit>
              </ActionForm>
            ) : viewer.kind === "anonymous" ? (
              <Link className={buttonClass("outline")} href={`/login?next=${encodeURIComponent(`/c/${club.slug}`)}`}>Sign in to follow</Link>
            ) : null}
          </div>
        ) : null}
      </section>
      {club.demo ? <Banner>This is a demo club made up to show what Champzz looks like. It has no members, and children cannot be added to it.</Banner> : null}
      {(posts ?? []).length > 0 ? (
        <section className="flex flex-col gap-3" data-testid="clubhouse-posts">
          <h2 className="font-display text-2xl font-extrabold">News</h2>
          {(posts ?? []).map((p) => (
            <article key={p.id} className="rounded-[20px] border border-line bg-surface p-5">
              <h3 className="text-lg font-extrabold">{p.title}</h3>
              <p className="text-xs font-bold text-muted">{new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p className="mt-2 whitespace-pre-wrap">{p.body}</p>
            </article>
          ))}
        </section>
      ) : null}
      {club.motto ? (
        <figure className="rounded-[20px] border-2 border-gold bg-surface p-5 text-center" data-testid="clubhouse-motto">
          <figcaption className="mb-1 text-xs font-extrabold uppercase tracking-widest text-muted">Our motto</figcaption>
          <blockquote className="whitespace-pre-line font-display text-xl font-extrabold">{club.motto}</blockquote>
        </figure>
      ) : null}

      <Card className="mx-auto w-full max-w-xl">
        <h2 className="mb-1 font-display text-2xl font-extrabold">Add your child</h2>
        {club.demo ? (
          <Banner>Demo clubs do not take members. Ask your own club leader for their Champzz join code.</Banner>
        ) : !club.joinable ? (
          <Banner tone="warn">This club is not taking new members right now. Ask the club leader.</Banner>
        ) : viewer.kind !== "adult" ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted">Parents and guardians sign in first. You will need the join code from the club leader.</p>
            <div className="flex flex-wrap gap-3">
              <Link className={buttonClass("primary")} href={`/signup?next=${encodeURIComponent(`/c/${club.slug}`)}`}>Create a parent account</Link>
              <Link className={buttonClass("outline")} href={`/login?next=${encodeURIComponent(`/c/${club.slug}`)}`}>Sign in</Link>
            </div>
          </div>
        ) : (
          <ActionForm action={registerKid.bind(null, club.slug)}>
            <p className="text-sm text-muted">Your child gets their own username and a picture PIN to sign in with. We only ask for a first name and the first letter of the surname.</p>
            <Field label="Join code" name="joinCode" required placeholder="ABCD-2345" autoComplete="off" />
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              <Field label="Child's first name" name="firstName" required maxLength={40} />
              <Field label="Surname initial" name="lastInitial" maxLength={1} />
            </div>
            <PicturePin />
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5" />
              <span>I am this child&apos;s parent or guardian. I agree to the club using Champzz for my child, and to the privacy notice.</span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="photos" className="mt-0.5 h-5 w-5" />
              <span>Optional: the club may show photos of my child inside the club (never in public).</span>
            </label>
            <Submit>Add my child</Submit>
          </ActionForm>
        )}
      </Card>
    </AdultShell>
  );
}

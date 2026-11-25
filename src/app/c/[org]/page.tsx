import Link from "next/link";
import { notFound } from "next/navigation";
import { AdultShell } from "@/components/shell";
import { ActionForm } from "@/components/ui/action-form";
import { Banner, Card, Field, buttonClass } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { getViewer } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { slugSchema } from "@/lib/validation";
import { registerKid } from "@/features/registration/server/actions";
import { PicturePin } from "@/features/kids/components/picture-pin";

export default async function ClubhousePage({ params }: PageProps<"/c/[org]">) {
  const { org: rawSlug } = await params;
  const slug = slugSchema.safeParse(rawSlug);
  if (!slug.success) notFound();
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("get_clubhouse", { p_slug: slug.data });
  const club = data?.[0];
  if (!club) notFound();
  const viewer = await getViewer();

  return (
    <AdultShell who={viewer.kind === "adult" ? viewer.fullName || viewer.email || undefined : undefined}>
      <section className="rounded-[28px] bg-ink p-8 text-cream" style={club.primary_color ? { background: club.primary_color } : undefined}>
        <p className="text-sm font-extrabold uppercase tracking-widest text-gold">Clubhouse</p>
        <h1 className="font-display text-4xl font-black italic uppercase" data-testid="clubhouse-name">{club.name}</h1>
        {club.tagline ? <p className="mt-2 max-w-xl">{club.tagline}</p> : null}
      </section>

      <Card className="mx-auto w-full max-w-xl">
        <h2 className="mb-1 font-display text-2xl font-extrabold">Add your child</h2>
        {!club.joinable ? (
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

import { notFound, redirect } from "next/navigation";
import { ActionForm } from "@/components/ui/action-form";
import { Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { Logo } from "@/components/ui/logo";
import { getViewer } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { slugSchema } from "@/lib/validation";
import { kidSignIn } from "@/features/kids/server/actions";
import { PicturePin } from "@/features/kids/components/picture-pin";

export const metadata = { title: "Kids sign in" };

export default async function KidSignInPage({ params }: PageProps<"/k/[org]">) {
  const { org } = await params;
  const slug = slugSchema.safeParse(org);
  if (!slug.success) notFound();
  const viewer = await getViewer();
  if (viewer.kind === "kid" && viewer.org.slug === slug.data) redirect(`/k/${slug.data}/home`);
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("get_clubhouse", { p_slug: slug.data });
  const club = data?.[0];
  if (!club) notFound();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-8">
      <Logo size={30} />
      <div>
        <p className="text-sm font-extrabold text-muted">{club.name}</p>
        <h1 className="font-display text-4xl font-black italic uppercase">Hi, Champ!</h1>
      </div>
      <ActionForm action={kidSignIn.bind(null, slug.data)} className="flex flex-col gap-5">
        <Field label="Your username" name="username" required autoComplete="username" autoCapitalize="none" placeholder="brave-lion-27" />
        <PicturePin big />
        <Submit>Let&apos;s go</Submit>
      </ActionForm>
      <p className="text-sm text-muted">Forgot your pictures? Ask your teacher to set new ones.</p>
    </main>
  );
}

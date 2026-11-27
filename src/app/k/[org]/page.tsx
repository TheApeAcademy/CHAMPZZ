import { notFound, redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { slugSchema } from "@/lib/validation";
import { kidSignIn } from "@/features/kids/server/actions";
import { ClubChip, KidSignIn } from "@/features/kids/components/kid-sign-in";

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
  // Champzz at home kids (and any unknown club) use the one sign-in page.
  if (!club) redirect("/login?kid=1");

  return <KidSignIn action={kidSignIn.bind(null, slug.data)} club={<ClubChip name={club.name} color={club.primary_color} />} />;
}

import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { BoldCard, buttonClass } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { AuthFrame } from "@/components/auth-frame";
import { getViewer } from "@/lib/auth/viewer";
import { acceptInvite } from "@/features/admin/server/actions";

export const metadata = { title: "Join a team", robots: { index: false } };

export default async function JoinPage({ params }: PageProps<"/join/[token]">) {
  const { token } = await params;
  const viewer = await getViewer();
  const here = `/join/${token}`;
  const signedIn = viewer.kind === "adult";
  return (
    <AuthFrame art="join">
      <BoldCard className="flex flex-col gap-5">
        <h1 className="cz-display text-[clamp(44px,11vw,64px)]">{signedIn ? "Join the team" : "You have been invited"}</h1>
        {signedIn ? (
          <>
            <p>You are signed in as <strong className="[overflow-wrap:anywhere]">{viewer.email}</strong>. Accept to join the club that invited you.</p>
            <ActionForm action={acceptInvite.bind(null, token)}>
              <Submit variant="gold" size="lg">Accept invite</Submit>
            </ActionForm>
          </>
        ) : (
          <>
            <p>Sign in, or create a free account, to join your club&apos;s team on Champzz.</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/login?next=${encodeURIComponent(here)}`} className={`${buttonClass("ink", "lg")} flex-[1_1_160px]`}>Sign in</Link>
              <Link href={`/signup?next=${encodeURIComponent(here)}`} className={`${buttonClass("outline", "lg")} flex-[1_1_160px]`}>Create an account</Link>
            </div>
          </>
        )}
        <p className="text-sm text-muted">Invite links work once and expire after 7 days.</p>
      </BoldCard>
    </AuthFrame>
  );
}

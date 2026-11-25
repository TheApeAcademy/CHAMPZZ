import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { ActionForm } from "@/components/ui/action-form";
import { Card } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { getViewer } from "@/lib/auth/viewer";
import { acceptInvite } from "@/features/admin/server/actions";

export const metadata = { title: "Join a team", robots: { index: false } };

export default async function JoinPage({ params }: PageProps<"/join/[token]">) {
  const { token } = await params;
  const viewer = await getViewer();
  const here = `/join/${token}`;
  if (viewer.kind !== "adult") {
    return (
      <AdultShell>
        <Card className="mx-auto max-w-md">
          <h1 className="font-display text-3xl font-extrabold">You have been invited</h1>
          <p className="mt-2">Sign in, or create a free account, to join your club&apos;s team on Champzz.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/login?next=${encodeURIComponent(here)}`} className="min-h-11 rounded-full bg-brand px-5 py-2.5 font-extrabold text-white">Sign in</Link>
            <Link href={`/signup?next=${encodeURIComponent(here)}`} className="min-h-11 rounded-full border-2 border-ink px-5 py-2.5 font-extrabold">Create an account</Link>
          </div>
        </Card>
      </AdultShell>
    );
  }
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <Card className="mx-auto max-w-md">
        <h1 className="font-display text-3xl font-extrabold">Join the team</h1>
        <p className="mt-2 mb-4">You are signed in as <strong>{viewer.email}</strong>. Accept to join the club that invited you.</p>
        <ActionForm action={acceptInvite.bind(null, token)}>
          <Submit>Accept invite</Submit>
        </ActionForm>
      </Card>
    </AdultShell>
  );
}

import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Banner, Card, Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { AdultShell } from "@/components/shell";
import { getViewer } from "@/lib/auth/viewer";
import { setNewPassword } from "@/features/auth/server/actions";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  const viewer = await getViewer();
  return (
    <AdultShell>
      <Card className="mx-auto w-full max-w-md">
        <h1 className="mb-4 font-display text-3xl font-extrabold">Choose a new password</h1>
        {viewer.kind !== "adult" ? (
          <>
            <Banner tone="error">This reset link has expired or was already used.</Banner>
            <p className="mt-4 text-sm"><Link className="font-extrabold text-brand underline" href="/forgot-password">Send a new link</Link></p>
          </>
        ) : (
          <ActionForm action={setNewPassword}>
            <Field label="New password" name="password" type="password" autoComplete="new-password" minLength={10} hint="At least 10 characters." required />
            <Field label="Type it again" name="confirm" type="password" autoComplete="new-password" required />
            <Submit>Save new password</Submit>
          </ActionForm>
        )}
      </Card>
    </AdultShell>
  );
}

import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { AdultShell } from "@/components/shell";
import { requestPasswordReset } from "@/features/auth/server/actions";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AdultShell>
      <Card className="mx-auto w-full max-w-md">
        <h1 className="mb-2 font-display text-3xl font-extrabold">Reset your password</h1>
        <p className="mb-4 text-sm text-muted">Enter the email you signed up with and we will send you a link to choose a new password.</p>
        <ActionForm action={requestPasswordReset}>
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Submit>Send reset link</Submit>
        </ActionForm>
        <p className="mt-4 text-sm">
          Remembered it? <Link className="font-extrabold text-brand underline" href="/login">Sign in</Link>
        </p>
        <p className="mt-2 text-sm text-muted">Kids: ask your teacher to set new pictures.</p>
      </Card>
    </AdultShell>
  );
}

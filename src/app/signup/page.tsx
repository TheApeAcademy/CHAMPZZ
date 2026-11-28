import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { AuthFrame } from "@/components/auth/auth-frame";
import { resendConfirmation, signUp } from "@/features/auth/server/actions";

export const metadata = { title: "Create an account" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  return (
    <AuthFrame>
      <>
        <h1 className="mb-1 font-display text-3xl font-extrabold">Create an account</h1>
        <p className="mb-4 text-sm text-muted">Pick a username and password and you are in. Add an email if you want to run a club or reset your password later. Kids in a club use their picture PIN.</p>
        <ActionForm action={signUp}>
          <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
          <Field label="Your name" name="fullName" autoComplete="name" required />
          <Field label="Username" name="username" autoComplete="username" autoCapitalize="none" required hint="3 to 24 letters, numbers, dots or underscores." />
          <Field label="Email (optional)" name="email" type="email" autoComplete="email" />
          <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={8} required hint="At least 8 characters." />
          <Submit>Create account</Submit>
        </ActionForm>
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-extrabold text-brand">Didn&apos;t get the confirmation email? Resend</summary>
          <ActionForm action={resendConfirmation} className="mt-3 flex flex-col gap-3">
            <Field label="Email" name="email" type="email" autoComplete="email" required />
            <Submit>Resend link</Submit>
          </ActionForm>
        </details>
        <p className="mt-4 text-sm">
          Already have one? <Link className="font-extrabold text-brand underline" href="/login">Sign in</Link>
        </p>
      </>
    </AuthFrame>
  );
}

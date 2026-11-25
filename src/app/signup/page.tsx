import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { AdultShell } from "@/components/shell";
import { signUp } from "@/features/auth/server/actions";

export const metadata = { title: "Create an account" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  return (
    <AdultShell>
      <Card className="mx-auto w-full max-w-md">
        <h1 className="mb-1 font-display text-3xl font-extrabold">Create an account</h1>
        <p className="mb-4 text-sm text-muted">For club leaders, teachers and parents. Kids sign in with their picture PIN instead.</p>
        <ActionForm action={signUp}>
          <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
          <Field label="Your name" name="fullName" autoComplete="name" required />
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={10} required hint="At least 10 characters." />
          <Submit>Create account</Submit>
        </ActionForm>
        <p className="mt-4 text-sm">
          Already have one? <Link className="font-extrabold text-brand underline" href="/login">Sign in</Link>
        </p>
      </Card>
    </AdultShell>
  );
}

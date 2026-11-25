import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { AdultShell } from "@/components/shell";
import { signIn } from "@/features/auth/server/actions";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <AdultShell>
      <Card className="mx-auto w-full max-w-md">
        <h1 className="mb-4 font-display text-3xl font-extrabold">Sign in</h1>
        <ActionForm action={signIn}>
          <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field label="Password" name="password" type="password" autoComplete="current-password" required />
          <Submit>Sign in</Submit>
        </ActionForm>
        <p className="mt-4 text-sm">
          New here? <Link className="font-extrabold text-brand underline" href={`/signup${typeof next === "string" ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link>
        </p>
      </Card>
    </AdultShell>
  );
}

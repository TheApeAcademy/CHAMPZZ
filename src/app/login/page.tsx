import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { AuthFrame } from "@/components/auth/auth-frame";
import { signIn } from "@/features/auth/server/actions";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <AuthFrame>
      <>
        <h1 className="mb-4 font-display text-3xl font-extrabold">Sign in</h1>
        <ActionForm action={signIn}>
          <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
          <Field label="Username or email" name="login" autoComplete="username" autoCapitalize="none" required />
          <Field label="Password" name="password" type="password" autoComplete="current-password" required />
          <Submit>Sign in</Submit>
        </ActionForm>
        <p className="mt-4 text-sm">
          New here? <Link className="font-extrabold text-brand underline" href={`/signup${typeof next === "string" ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link>
        </p>
      </>
    </AuthFrame>
  );
}

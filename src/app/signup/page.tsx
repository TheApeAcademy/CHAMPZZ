import Image from "next/image";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Field } from "@/components/ui/primitives";
import { PasswordField } from "@/components/ui/password-field";
import { Submit } from "@/components/ui/submit";
import { AuthFrame, AuthTitle } from "@/components/auth-frame";
import { signUp } from "@/features/auth/server/actions";

export const metadata = { title: "Create an account" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : "";
  return (
    <AuthFrame art="signup">
      <AuthTitle title="Create account" lead="For club leaders, teachers and parents. Kids sign in with their picture PIN instead." />
      <ActionForm
        action={signUp}
        className="flex flex-col gap-[18px]"
        okPanel={{
          title: "Check your inbox.",
          art: <Image src="/placeholders/landing/feature-rocket.webp" alt="" width={96} height={96} className="h-24 w-24 object-contain" />,
          footer: <>Nothing there? Check spam, or <Link href={`/signup${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`} className="font-black text-brand underline">try again</Link>.</>,
        }}
      >
        <input type="hidden" name="next" value={nextPath} />
        <Field big label="Your name" name="fullName" autoComplete="name" placeholder="Ada Okafor" required maxLength={80} />
        <Field big label="Email" name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="you@yourclub.org" required />
        <PasswordField label="Password" name="password" autoComplete="new-password" minLength={10} required meter />
        <Submit variant="gold" size="lg">Create account</Submit>
        <p className="text-sm text-muted">By creating an account you agree to the <Link href="/terms" className="font-extrabold underline">Terms</Link> and <Link href="/privacy" className="font-extrabold underline">Privacy notice</Link>.</p>
      </ActionForm>
      <p className="text-base">Already have one? <Link className="font-black text-brand underline" href={`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}>Sign in</Link></p>
    </AuthFrame>
  );
}

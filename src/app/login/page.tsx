import Image from "next/image";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Banner, Field, buttonClass } from "@/components/ui/primitives";
import { PasswordField } from "@/components/ui/password-field";
import { Submit } from "@/components/ui/submit";
import { AuthFrame, AuthTitle, OrDivider } from "@/components/auth-frame";
import { signIn } from "@/features/auth/server/actions";
import { kidSignInAnywhere } from "@/features/kids/server/actions";
import { KidSignIn } from "@/features/kids/components/kid-sign-in";

export const metadata = { title: "Sign in" };

/** One door for everyone: grown-ups (leaders, teachers, parents) here, kids at ?kid=1. */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, confirm, kid } = await searchParams;
  const nextPath = typeof next === "string" ? next : "";

  if (kid === "1") {
    return (
      <KidSignIn
        action={kidSignInAnywhere}
        club={<Link href="/login" className="inline-flex min-h-11 items-center rounded-full border-[2.5px] border-ink bg-[#FFFDF7] px-4 text-sm font-black">Grown-ups</Link>}
        below={<p className="text-center text-[15px]">New here? <Link className="font-black text-brand underline" href="/start">Start your Champzz account</Link></p>}
      />
    );
  }

  return (
    <AuthFrame art="login">
      <AuthTitle title="Sign in" lead="For club leaders, teachers and parents." />
      {confirm === "failed" ? (
        <Banner tone="warn">That link has expired or was already used. If you were confirming your email, try signing in now. To reset your password, ask for a new link.</Banner>
      ) : null}
      <ActionForm action={signIn} className="flex flex-col gap-[18px]">
        <input type="hidden" name="next" value={nextPath} />
        <Field big label="Email" name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="you@yourclub.org" required />
        <PasswordField label="Password" name="password" autoComplete="current-password" required
          aside={<Link href="/forgot-password" className="text-[15px] font-extrabold text-brand underline">Forgot your password?</Link>} />
        <Submit variant="gold" size="lg">Sign in</Submit>
      </ActionForm>
      <OrDivider>New to Champzz?</OrDivider>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/signup" className={buttonClass("outline", "lg")}>Start your club</Link>
        <Link href={`/signup?next=${encodeURIComponent(nextPath || "/p")}`} className={buttonClass("outline", "lg")}>I&apos;m a parent</Link>
      </div>
      <p className="text-[15px] text-muted">Want to teach? <Link className="font-extrabold text-brand underline" href="/clubs">Find your club</Link> and ask to join. Starting a club comes with 14 days free.</p>
      <Link href="/login?kid=1" className="flex items-center gap-3.5 rounded-[20px] bg-[#DDE4FF] px-4 py-3.5 text-base font-extrabold text-[#1D3BB8]">
        <Image src="/placeholders/landing/feature-class.webp" alt="" width={44} height={44} className="h-11 w-11 flex-none object-contain" />
        <span>Are you a kid? Sign in with your username and 4 pictures.</span>
      </Link>
    </AuthFrame>
  );
}

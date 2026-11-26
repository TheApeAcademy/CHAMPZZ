import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Banner, Card, Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { AdultShell } from "@/components/shell";
import { signIn } from "@/features/auth/server/actions";
import { kidSignInAnywhere } from "@/features/kids/server/actions";
import { PicturePin } from "@/features/kids/components/picture-pin";

export const metadata = { title: "Sign in" };

/** One door for everyone: grown-ups (leaders, teachers, parents) and kids. */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, confirm, kid } = await searchParams;
  const kidFirst = kid === "1";
  const grownUps = (
    <Card className="w-full">
      <h2 className="mb-1 font-display text-2xl font-extrabold">Grown-ups</h2>
      <p className="mb-4 text-sm text-muted">Club leaders, teachers and parents.</p>
      {confirm === "failed" ? <div className="mb-4"><Banner tone="error">That link has expired or was already used. If you were confirming your email, try signing in now. To reset your password, ask for a new link.</Banner></div> : null}
      <ActionForm action={signIn}>
        <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" required />
        <Submit>Sign in</Submit>
      </ActionForm>
      <p className="mt-3 text-sm"><Link className="font-extrabold text-brand underline" href="/forgot-password">Forgot your password?</Link></p>
      <ul className="mt-4 flex flex-col gap-1.5 text-sm">
        <li>Run a church or club? <Link className="font-extrabold text-brand underline" href="/signup">Start your club</Link> (14 days free)</li>
        <li>Parent? <Link className="font-extrabold text-brand underline" href={`/signup${typeof next === "string" ? `?next=${encodeURIComponent(next)}` : "?next=/p"}`}>Create a parent account</Link></li>
        <li>Want to teach? <Link className="font-extrabold text-brand underline" href="/clubs">Find your club</Link> and ask to join</li>
      </ul>
    </Card>
  );
  const kids = (
    <Card className="w-full">
      <h2 className="mb-1 font-display text-2xl font-black italic uppercase">Kids</h2>
      <p className="mb-4 text-sm text-muted">Your username and your 4 pictures.</p>
      <ActionForm action={kidSignInAnywhere} className="flex flex-col gap-5">
        <Field label="Your username" name="username" required autoComplete="username" autoCapitalize="none" placeholder="joyful-dove-27" />
        <PicturePin big />
        <Submit>Let&apos;s go</Submit>
      </ActionForm>
      <p className="mt-4 text-sm">New here? <Link className="font-extrabold text-brand underline" href="/start">Start your Champzz account</Link></p>
      <p className="mt-1 text-sm text-muted">Forgot your pictures? Ask your teacher or your grown-up.</p>
    </Card>
  );
  return (
    <AdultShell>
      <h1 className="font-display text-3xl font-extrabold">Sign in</h1>
      <div className="grid items-start gap-5 md:grid-cols-2" data-testid="sign-in-doors">
        {kidFirst ? <>{kids}{grownUps}</> : <>{grownUps}{kids}</>}
      </div>
    </AdultShell>
  );
}

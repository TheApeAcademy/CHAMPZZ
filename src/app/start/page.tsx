import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { Logo } from "@/components/ui/logo";
import { startKidSignup } from "@/features/kids/server/actions";
import { PicturePin } from "@/features/kids/components/picture-pin";

export const metadata = { title: "Start your Champzz account" };

/** A kid starts an account. A grown-up must approve it before it opens. */
export default function StartPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-8">
      <Link href="/" aria-label="Champzz home"><Logo size={30} /></Link>
      <div>
        <h1 className="font-display text-4xl font-black italic uppercase">Become a Champ</h1>
        <p className="mt-2 text-muted">Pick your 4 secret pictures. We&apos;ll give you a username, then a grown-up says yes and you&apos;re in.</p>
      </div>
      <ActionForm action={startKidSignup} className="flex flex-col gap-5">
        <Field label="Your first name" name="firstName" required maxLength={40} autoComplete="given-name" />
        <PicturePin big />
        <Submit>Make my account</Submit>
      </ActionForm>
      <p className="text-sm text-muted">Already a Champ? <Link className="font-extrabold text-brand underline" href="/login?kid=1">Sign in</Link></p>
    </main>
  );
}

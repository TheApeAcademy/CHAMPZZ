import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Logo } from "@/components/ui/logo";
import { Submit } from "@/components/ui/submit";
import { startKidSignup } from "@/features/kids/server/actions";
import { PicturePin } from "@/features/kids/components/picture-pin";

export const metadata = { title: "Start your Champzz account" };

/** A kid starts an account. A grown-up must approve it before it opens. */
export default function StartPage() {
  return (
    <div className="flex min-h-[100svh] flex-col bg-cream">
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-5 px-4 pb-16 pt-4">
        <Link href="/" aria-label="Champzz home" className="self-start"><Logo size={30} /></Link>
        <div>
          <h1 className="cz-rise cz-display text-[clamp(56px,17vw,104px)] text-coral [text-shadow:3px_3px_0_#D9452A,6px_6px_0_var(--ink)]">Become a Champ</h1>
          <p className="mt-3 text-muted">Pick your 4 secret pictures. We&apos;ll give you a username, then a grown-up says yes and you&apos;re in.</p>
        </div>
        <div className="rounded-[36px] border-4 border-ink bg-[#FFFDF7] p-[clamp(16px,5vw,22px)] shadow-[0_10px_0_var(--ink)]">
          <ActionForm action={startKidSignup} className="flex flex-col gap-[18px]">
            <label className="flex flex-col gap-2 text-[17px] font-black">
              Your first name
              <input name="firstName" required maxLength={40} autoComplete="given-name"
                className="cz-input min-h-[60px] w-full min-w-0 rounded-[18px] border-[2.5px] border-ink bg-cream px-4 text-[20px] font-extrabold text-ink" />
            </label>
            <PicturePin big legend="Pick your 4 secret pictures" />
            <Submit variant="gold" size="lg">Make my account</Submit>
          </ActionForm>
        </div>
        <p className="text-center text-[15px] text-muted">Already a Champ? <Link className="font-black text-brand underline" href="/login?kid=1">Sign in</Link></p>
      </main>
    </div>
  );
}

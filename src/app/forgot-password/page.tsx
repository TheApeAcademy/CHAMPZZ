import Image from "next/image";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { AuthFrame, AuthTitle } from "@/components/auth-frame";
import { requestPasswordReset } from "@/features/auth/server/actions";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthFrame art="forgot">
      <AuthTitle title="Reset your password" lead="Type the email you signed up with. We'll send a link to choose a new one." />
      <ActionForm
        action={requestPasswordReset}
        className="flex flex-col gap-[18px]"
        okPanel={{
          title: "Check your inbox.",
          art: <Image src="/placeholders/landing/feature-rocket.webp" alt="" width={96} height={96} className="h-24 w-24 object-contain" />,
          footer: <>Nothing there? Check spam, or <Link href="/forgot-password" className="font-black text-brand underline">try again</Link>.</>,
        }}
      >
        <Field big label="Email" name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="you@yourclub.org" required />
        <Submit variant="gold" size="lg">Send reset link</Submit>
      </ActionForm>
      <p className="text-base"><Link className="font-black text-brand underline" href="/login">Back to Sign in</Link></p>
      <p className="text-[15px] text-muted">Kids: ask your teacher to set new pictures.</p>
    </AuthFrame>
  );
}

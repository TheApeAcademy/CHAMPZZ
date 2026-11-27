import Image from "next/image";
import Link from "next/link";
import { ActionForm } from "@/components/ui/action-form";
import { BoldCard, buttonClass } from "@/components/ui/primitives";
import { PasswordField } from "@/components/ui/password-field";
import { Submit } from "@/components/ui/submit";
import { AuthFrame, AuthTitle } from "@/components/auth-frame";
import { getViewer } from "@/lib/auth/viewer";
import { setNewPassword } from "@/features/auth/server/actions";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  const viewer = await getViewer();
  if (viewer.kind !== "adult") {
    return (
      <AuthFrame art="reset">
        <BoldCard className="flex flex-col gap-[18px]">
          <Image src="/placeholders/landing/stone-render.webp" alt="" width={96} height={96} className="h-24 w-24 object-contain" />
          <h1 className="cz-display text-[clamp(44px,11vw,64px)]">That link has expired</h1>
          <p role="alert" className="font-bold">This reset link has expired or was already used.</p>
          <p>Reset links work for one hour, once. Ask for a fresh one and use it straight away.</p>
          <Link href="/forgot-password" className={buttonClass("ink", "lg")}>Send a new link</Link>
        </BoldCard>
      </AuthFrame>
    );
  }
  return (
    <AuthFrame art="reset">
      <AuthTitle title="Choose a new password" lead="At least 10 characters. A short sentence is easy to remember." />
      <ActionForm action={setNewPassword} className="flex flex-col gap-[18px]">
        <PasswordField label="New password" name="password" autoComplete="new-password" minLength={10} required meter />
        <PasswordField label="Type it again" name="confirm" autoComplete="new-password" required />
        <Submit variant="gold" size="lg">Save new password</Submit>
      </ActionForm>
    </AuthFrame>
  );
}

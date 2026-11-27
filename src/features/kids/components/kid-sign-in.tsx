import Link from "next/link";
import type { ReactNode } from "react";
import type { ActionState } from "@/components/ui/action-form";
import { ActionForm } from "@/components/ui/action-form";
import { Logo } from "@/components/ui/logo";
import { Submit } from "@/components/ui/submit";
import { PicturePin } from "./picture-pin";

/** First letter badge for a club, in the club's colour (or Champzz green). */
export function ClubChip({ name, color }: { name: string; color?: string | null }) {
  return (
    <span className="inline-flex min-w-0 max-w-[60%] items-center gap-2 rounded-full border-[2.5px] border-ink bg-[#FFFDF7] py-1.5 pl-1.5 pr-3.5 text-sm font-black">
      <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-full font-display italic text-white" style={{ background: color || "#1E8F5A" }}>{name.trim().charAt(0).toUpperCase()}</span>
      <span className="truncate">{name}</span>
    </span>
  );
}

/**
 * "Hi, Champ!" sign-in from the Champ Town design: big 3D title, a white card with
 * the username, the 12-picture pad and a gold LET'S GO.
 */
export function KidSignIn({ action, club, below }: { action: (prev: ActionState, data: FormData) => Promise<ActionState>; club?: ReactNode; below?: ReactNode }) {
  return (
    <div className="flex min-h-[100svh] flex-col bg-cream [background:radial-gradient(circle,rgba(47,91,255,.14)_0_5px,transparent_6px)_0_0/56px_56px,radial-gradient(circle,rgba(255,90,60,.14)_0_5px,transparent_6px)_28px_28px/56px_56px,#FFF8EC]">
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-5 px-4 pb-16 pt-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" aria-label="Champzz home" className="flex-none"><Logo size={30} /></Link>
          {club}
        </div>
        <h1 className="cz-rise pt-[.2em] font-display text-[clamp(64px,22vw,128px)] font-black italic uppercase leading-[.82] text-brand [font-stretch:62%] [font-variation-settings:'wdth'_62] [text-shadow:1px_1px_0_#2A52F0,2px_2px_0_#264BE0,3px_3px_0_#2244D0,4px_4px_0_#1F3EC0,5px_5px_0_#1B38B0,6px_6px_0_#0B1026]">
          Hi, Champ!
        </h1>
        <div className="rounded-[36px] border-4 border-ink bg-[#FFFDF7] p-[clamp(16px,5vw,22px)] shadow-[0_10px_0_var(--ink)]">
          <ActionForm action={action} className="flex flex-col gap-[18px]">
            <label className="flex flex-col gap-2 text-[17px] font-black">
              Your username
              <input name="username" required autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="brave-lion-27"
                className="cz-input min-h-[60px] w-full min-w-0 rounded-[18px] border-[2.5px] border-ink bg-cream px-4 text-[20px] font-extrabold text-ink" />
            </label>
            <PicturePin big />
            <Submit variant="gold" size="lg" className="min-h-[68px] border-[3px] font-display text-[26px] italic uppercase [font-stretch:80%]">Let&apos;s go</Submit>
          </ActionForm>
        </div>
        <p className="text-center text-base font-extrabold text-muted">Forgot your pictures? Ask your teacher or your grown-up.</p>
        {below}
      </main>
    </div>
  );
}

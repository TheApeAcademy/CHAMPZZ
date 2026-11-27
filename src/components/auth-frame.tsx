import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";

/** The coloured art panel for each Accounts screen (Claude Design, Accounts). */
export const AUTH_ART = {
  login: { bg: "#2F5BFF", chip: "Welcome back", title: "Good to see you.", img: "/landing/leader.webp", h: "74%", verse: "Feed my lambs.", ref: "John 21:15" },
  signup: { bg: "#FF5A3C", chip: "Free to start", title: "Bring the whole team.", img: "/landing/teacher.webp", h: "62%", verse: "Let the little children come to me.", ref: "Matthew 19:14" },
  forgot: { bg: "#0B1026", chip: "No stress", title: "It happens to everyone.", img: null, h: "0", verse: "His mercies are new every morning.", ref: "Lamentations 3:23" },
  reset: { bg: "#2F5BFF", chip: "Fresh start", title: "New password, same you.", img: null, h: "0", verse: "Behold, I make all things new.", ref: "Revelation 21:5" },
  onboarding: { bg: "#1E8F5A", chip: "Your club", title: "Your club, your colours.", img: "/landing/ellie-paint.webp", h: "46%", verse: "Unless the Lord builds the house, they labour in vain.", ref: "Psalm 127:1" },
  join: { bg: "#2F5BFF", chip: "You're invited", title: "The team is waiting.", img: "/landing/daye-lean.webp", h: "56%", verse: "Two are better than one.", ref: "Ecclesiastes 4:9" },
  kids: { bg: "#F2B33D", chip: "Champ Town", title: "Ready to play?", img: "/landing/group-cutout.webp", h: "58%", verse: "Let no one despise your youth.", ref: "1 Timothy 4:12" },
} as const;

export type AuthArtKey = keyof typeof AUTH_ART;

/**
 * Accounts layout: sticky header, then the art panel and the form column. On a
 * phone the art panel becomes a short banner above the form, so the form is
 * reachable without scrolling far.
 */
export function AuthFrame({ art, children, right }: { art: AuthArtKey; children: ReactNode; right?: ReactNode }) {
  const a = AUTH_ART[art];
  return (
    <div className="flex min-h-[100svh] flex-col bg-cream">
      <header className="sticky top-0 z-50 border-b border-[rgba(230,220,198,.7)] bg-[rgba(255,248,236,.82)] backdrop-blur-md">
        <nav aria-label="Account" className="mx-auto flex min-h-14 max-w-[1320px] items-center gap-3 px-3 py-1 sm:px-5">
          <Link href="/" aria-label="Champzz home" className="mr-auto flex-none"><Logo size={32} animate /></Link>
          {right ?? <Link href="/" className="inline-flex min-h-11 items-center px-1.5 text-base font-extrabold text-ink">Back to site</Link>}
        </nav>
      </header>
      <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-wrap items-stretch gap-[clamp(16px,3vw,32px)] px-[clamp(12px,3vw,32px)] pb-16 pt-[clamp(12px,3vw,32px)]">
        <aside aria-hidden="true" className="relative flex min-h-[210px] min-w-0 md:h-[clamp(300px,44vw,640px)] flex-[1_1_380px] flex-col justify-start gap-4 self-start overflow-hidden rounded-[clamp(28px,4vw,40px)] border-4 border-ink p-[clamp(20px,3vw,36px)] shadow-[0_10px_0_var(--ink)]" style={{ background: a.bg }}>
          <div className="cz-dots absolute inset-0" />
          <span className="relative z-[2] self-start rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-black uppercase tracking-[.1em] text-cream">{a.chip}</span>
          <h2 className="cz-rise relative z-[2] m-0 max-w-[9ch] font-display text-[clamp(38px,11vw,112px)] md:text-[clamp(52px,7.4vw,112px)] font-black uppercase leading-[.86] text-cream [font-stretch:62%] [font-variation-settings:'wdth'_62] [text-shadow:2px_2px_0_#EADFC9,4px_4px_0_#D6C7AA,6px_6px_0_#BBAA88,9px_9px_0_#0B1026]">
            {a.title}
          </h2>
          {a.img ? (
            <span className="cz-bob absolute bottom-0 right-[-2%] z-[1] w-[60%] sm:w-[72%]" style={{ height: a.h }}>
              <Image src={a.img} alt="" fill sizes="(max-width: 768px) 60vw, 480px" className="object-contain object-right-bottom drop-shadow-[0_20px_30px_rgba(11,16,38,.25)]" priority />
            </span>
          ) : null}
          <p className="relative z-[2] max-w-[min(22ch,60%)] self-start rounded-[16px] bg-[rgba(11,16,38,.78)] px-3.5 py-2.5 text-[15px] font-bold leading-snug text-cream">
            &ldquo;{a.verse}&rdquo; <b className="whitespace-nowrap text-gold">{a.ref}</b>
          </p>
        </aside>
        <section className="flex min-w-0 flex-[1_1_420px] items-center justify-center">
          <div className="flex w-full max-w-[520px] flex-col gap-[22px] py-[clamp(8px,2vw,24px)]">{children}</div>
        </section>
      </main>
    </div>
  );
}

export function AuthTitle({ title, lead, eyebrow }: { title: string; lead?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {eyebrow ? <span className="mb-1 self-start rounded-full bg-[#DDE4FF] px-3 py-1 text-[13px] font-black uppercase tracking-[.08em] text-[#1D3BB8]">{eyebrow}</span> : null}
      <h1 className="cz-display text-[clamp(46px,12vw,72px)]">{title}</h1>
      {lead ? <p className="text-muted">{lead}</p> : null}
    </div>
  );
}

export function OrDivider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[15px] font-bold text-muted">
      <span className="h-0.5 flex-1 bg-line" />{children}<span className="h-0.5 flex-1 bg-line" />
    </div>
  );
}

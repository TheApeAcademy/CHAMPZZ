import Image from "next/image";
import Link from "next/link";
import { MarketingPage } from "@/components/marketing";
import { GUIDE } from "@/features/marketing/guide/guide-data";
import { GuideRolePanel } from "@/features/marketing/guide/guide";

export const metadata = {
  title: "How Champzz works",
  description: "A simple guide for club leaders, teachers, parents and kids: six steps each, with the real screen names.",
};

/** The whole guide on one page: every role, easy to share with a team or print. */
export default function GuidePage() {
  return (
    <MarketingPage>
      <section className="relative overflow-clip bg-cream px-5 pb-10 pt-[clamp(48px,8vw,96px)]">
        <div aria-hidden="true" className="cz-dots-ink absolute inset-0 opacity-60" />
        <div className="relative mx-auto flex max-w-[1200px] flex-col gap-6">
          <span className="self-start rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-black uppercase tracking-[.14em] text-cream">The guide</span>
          <h1 className="cz-display cz-rise text-[clamp(60px,15vw,150px)] leading-[.84]">
            How Champzz <span className="text-brand [text-shadow:3px_3px_0_#1F3EC0,6px_6px_0_var(--ink)]">works</span>
          </h1>
          <p className="max-w-[52ch] text-[clamp(17px,2.2vw,22px)] font-bold text-muted">
            Four kinds of people use Champzz. Find yours below: six short steps each, with the names of the real screens so nothing is a guess.
          </p>
          <nav aria-label="Jump to" className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {GUIDE.map((r) => (
              <a key={r.key} href={`#guide-${r.key}`} className="flex min-h-[80px] items-center gap-3 overflow-hidden rounded-[24px] border-[2.5px] border-ink px-3 shadow-[0_6px_0_var(--ink)] transition-transform hover:-translate-y-0.5" style={{ background: r.color, color: r.ink }}>
                <span className="relative h-16 w-14 flex-none"><Image src={r.character} alt="" fill sizes="56px" className="object-contain object-bottom" /></span>
                <span className="text-[17px] font-black leading-tight">{r.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-20 px-5 pb-[clamp(80px,10vw,120px)] pt-10">
        {GUIDE.map((r) => (
          <div key={r.key} className="scroll-mt-24"><GuideRolePanel role={r} headingLevel={2} /></div>
        ))}
        <section className="flex flex-col items-start gap-5 rounded-[clamp(28px,4vw,40px)] border-4 border-ink bg-ink p-[clamp(24px,5vw,48px)] text-cream shadow-[0_10px_0_var(--gold)]">
          <h2 className="cz-display text-[clamp(44px,10vw,88px)]">Ready for <span className="text-gold">Sunday?</span></h2>
          <p className="max-w-[46ch] text-[18px] text-[#D8DAEA]">Set up your club in an afternoon. 14 days free for up to 15 kids.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex min-h-[60px] items-center rounded-full border-[2.5px] border-ink bg-gold px-7 text-[19px] font-black !text-ink shadow-[0_6px_0_var(--cream)]">Start your club</Link>
            <Link href="/safety" className="inline-flex min-h-[60px] items-center rounded-full border-[2.5px] border-cream px-7 text-[19px] font-black text-cream">How we keep kids safe</Link>
          </div>
        </section>
      </div>
    </MarketingPage>
  );
}

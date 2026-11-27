const MAIL = "mailto:hola@zebraish.com?subject=" + encodeURIComponent("I'd like a website like Champzz") +
  "&body=" + encodeURIComponent("Hi Zebraish Studio,\n\nI saw Champzz and I'd love a website or app for:\n\nOrganisation:\nWhat we need:\nBudget (roughly):\n\nThanks!");

/** "Built by Zebraish Studio": a small frosted glass card that sits beside the footer logo. */
export function ZebraishCard() {
  return (
    <aside aria-labelledby="zebraish-title"
      className="relative w-full max-w-[300px] overflow-hidden rounded-[22px] border border-white/25 bg-white/[.08] p-4 text-left text-cream shadow-[0_24px_50px_-24px_rgba(0,0,0,.8),inset_0_1px_0_rgba(255,255,255,.25)] backdrop-blur-[18px] [-webkit-backdrop-filter:blur(18px)]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand opacity-60 blur-[40px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-coral opacity-45 blur-[40px]" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="relative flex items-center gap-3">
        <span aria-hidden="true" className="grid h-12 w-12 flex-none place-items-center rounded-[14px] border border-white/30 bg-ink/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zebraish-mark.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
        </span>
        <div className="min-w-0 leading-tight">
          <span className="block text-[10px] font-black uppercase tracking-[.16em] text-gold">The developers</span>
          <h2 id="zebraish-title" className="text-[16px] font-black">Zebraish Studio</h2>
        </div>
      </div>
      <p className="relative mt-2.5 text-[13.5px] leading-snug text-[#D8DAEA]">
        Websites, web apps and 3D experiences for brands that want to stand out. Champzz is one of ours.
      </p>
      <a href={MAIL} className="relative mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-ink bg-gold px-4 text-[14px] font-black !text-ink no-underline shadow-[0_4px_0_var(--ink),inset_0_2px_0_rgba(255,255,255,.55)] transition-transform active:translate-y-0.5">
        Get a website like this
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </a>
    </aside>
  );
}

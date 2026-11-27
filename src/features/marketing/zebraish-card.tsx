const MAIL = "mailto:hola@zebraish.com?subject=" + encodeURIComponent("I'd like a website like Champzz") +
  "&body=" + encodeURIComponent("Hi Zebraish Studio,\n\nI saw Champzz and I'd love a website or app for:\n\nOrganisation:\nWhat we need:\nBudget (roughly):\n\nThanks!");

/** "Built by Zebraish Studio": a frosted glass card above the landing footer. */
export function ZebraishCard() {
  return (
    <section aria-labelledby="zebraish-title" className="relative overflow-clip bg-ink px-5 py-[clamp(70px,9vw,120px)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-[340px] w-[340px] rounded-full bg-brand opacity-70 blur-[90px]" />
        <div className="absolute bottom-[6%] right-[6%] h-[320px] w-[320px] rounded-full bg-coral opacity-60 blur-[90px]" />
        <div className="absolute left-[48%] top-[42%] h-[220px] w-[220px] rounded-full bg-gold opacity-40 blur-[80px]" />
        <div className="cz-dots absolute inset-0 opacity-60" />
      </div>
      <div className="relative mx-auto flex max-w-[880px] flex-col gap-6 overflow-hidden rounded-[36px] border border-white/25 bg-white/[.08] p-[clamp(24px,5vw,48px)] text-cream shadow-[0_40px_80px_-30px_rgba(0,0,0,.7),inset_0_1px_0_rgba(255,255,255,.25)] backdrop-blur-[22px] [-webkit-backdrop-filter:blur(22px)] md:flex-row md:items-center md:gap-10">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <span aria-hidden="true" className="relative grid h-24 w-24 flex-none place-items-center overflow-hidden rounded-[28px] border-2 border-white/40 shadow-[0_18px_40px_-12px_rgba(0,0,0,.6)] md:h-28 md:w-28"
          style={{ background: "repeating-linear-gradient(118deg,#FFF8EC 0 9px,#0B1026 9px 18px)" }}>
          <span className="grid h-[62%] w-[62%] place-items-center rounded-full bg-ink font-display text-[34px] font-black italic text-cream ring-2 ring-white/50">Z</span>
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="self-start rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[12px] font-black uppercase tracking-[.14em] text-gold">The developers</span>
          <h2 id="zebraish-title" className="cz-display text-[clamp(40px,8vw,64px)] leading-[.88]">Built by Zebraish Studio</h2>
          <p className="max-w-[48ch] text-[17px] leading-relaxed text-[#D8DAEA]">
            We design and build websites, web apps and 3D experiences for brands that want to stand out. Champzz is one of ours, from first sketch to the screen in your hand.
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href={MAIL} className="inline-flex min-h-[56px] items-center gap-2 rounded-full border-[2.5px] border-ink bg-gold px-6 text-[17px] font-black !text-ink no-underline shadow-[0_6px_0_var(--ink),inset_0_3px_0_rgba(255,255,255,.55)] transition-transform active:translate-y-1">
              Get a website like this
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
            <a href="mailto:hola@zebraish.com" className="text-[15px] font-extrabold !text-[#C9CBE0] underline underline-offset-4">hola@zebraish.com</a>
          </div>
        </div>
      </div>
    </section>
  );
}

const MAIL = "mailto:hola@zebraish.com?subject=" + encodeURIComponent("I'd like a website like Champzz") +
  "&body=" + encodeURIComponent("Hi Zebraish Studio,\n\nI saw Champzz and I'd love a website or app for:\n\nOrganisation:\nWhat we need:\nBudget (roughly):\n\nThanks!");

const WHATSAPP = "https://wa.me/2348165320780?text=" + encodeURIComponent("Hi Zebraish Studio, I saw Champzz and I'd love a website or app.");
const ICON = "grid h-[44px] w-[44px] flex-none place-items-center rounded-full border border-white/30 bg-white/10 !text-cream no-underline transition-colors hover:bg-white/20";

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
      <div className="relative mt-3 flex items-center gap-2">
        <a href="https://zebraish.com/studio" target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-ink bg-gold px-4 text-[14px] font-black !text-ink no-underline shadow-[0_4px_0_var(--ink),inset_0_2px_0_rgba(255,255,255,.55)] transition-transform active:translate-y-0.5">
          Visit us
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
        <a href={WHATSAPP} target="_blank" rel="noopener" aria-label="Message Zebraish Studio on WhatsApp" title="WhatsApp +234 816 532 0780" className={ICON}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z" /></svg>
        </a>
        <a href={MAIL} aria-label="Email Zebraish Studio at hola@zebraish.com" title="hola@zebraish.com" className={ICON}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>
        </a>
      </div>
    </aside>
  );
}

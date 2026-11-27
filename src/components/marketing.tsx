import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import type { Feature } from "@/content/features";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/safety", label: "Safety" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const fg = dark ? "text-cream" : "text-ink";
  return (
    <header className={`sticky top-0 z-50 ${dark ? "bg-ink/90" : "border-b border-[rgba(230,220,198,.7)] bg-[rgba(255,248,236,.82)]"} px-3 backdrop-blur-md sm:px-8`}>
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-2 py-1.5">
        <Link href="/" aria-label="Champzz home" className="flex-none"><Logo size={30} tone={dark ? "cream" : "ink"} /></Link>
        <nav aria-label="Main" className="flex min-w-0 items-center gap-0.5 text-[15px]">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`hidden min-h-11 items-center rounded-full px-3 font-extrabold md:inline-flex ${fg}`}>{n.label}</Link>
          ))}
          <Link href="/login" className={`inline-flex min-h-11 items-center rounded-full px-2.5 font-extrabold sm:px-3 ${fg}`}>Sign in</Link>
          <Link href="/signup" className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full bg-ink px-4 text-sm font-black text-cream sm:text-[15px]">Start your club</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink px-4 pb-8 pt-12 text-cream sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-4">
        <div className="flex flex-col gap-3 sm:col-span-2">
          <Logo size={40} tone="cream" />
          <p className="max-w-sm text-sm text-[#D8D4C8]">Lessons, games and safe community for kids&apos; clubs and children&apos;s ministries.</p>
        </div>
        <nav aria-label="Product" className="flex flex-col gap-2 text-sm">
          <p className="font-extrabold text-gold">Product</p>
          <Link href="/features" className="underline-offset-2 hover:underline">Features</Link>
          <Link href="/pricing" className="underline-offset-2 hover:underline">Pricing</Link>
          <Link href="/safety" className="underline-offset-2 hover:underline">Safety</Link>
          <Link href="/signup" className="underline-offset-2 hover:underline">Start your club</Link>
        </nav>
        <nav aria-label="Legal" className="flex flex-col gap-2 text-sm">
          <p className="font-extrabold text-gold">Legal</p>
          <Link href="/privacy" className="underline-offset-2 hover:underline">Privacy notice</Link>
          <Link href="/terms" className="underline-offset-2 hover:underline">Terms</Link>
          <Link href="/login" className="underline-offset-2 hover:underline">Sign in</Link>
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-white/15 pt-6 text-center text-sm text-[#D8D4C8]" data-testid="zebraish-credit">Built by Zebraish</p>
    </footer>
  );
}

export function SoonChip() {
  return <span className="ml-2 inline-block rounded-full bg-cream px-2 py-0.5 align-middle text-[11px] font-extrabold uppercase tracking-wide text-muted">Coming soon</span>;
}

export function FeatureCard({ f }: { f: Feature }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-[24px] border-[2.5px] border-ink bg-[#FFFDF7] p-5 shadow-[0_5px_0_var(--ink)]" data-feature={f.key} data-status={f.status}>
      {f.art ? <Art name={f.art} size={64} /> : null}
      <p className="font-extrabold">{f.name}{f.status === "soon" ? <SoonChip /> : null}</p>
      <p className="text-sm text-muted">{f.blurb}</p>
    </div>
  );
}

export function Section({ id, eyebrow, title, lead, children, tone = "cream" }: { id?: string; eyebrow?: string; title: string; lead?: string; children: ReactNode; tone?: "cream" | "white" | "ink" | "brand" }) {
  const bg = { cream: "bg-cream", white: "bg-surface", ink: "bg-ink text-cream", brand: "bg-brand text-white" }[tone];
  return (
    <section id={id} className={`${bg} px-4 py-16 sm:px-8`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex max-w-2xl flex-col gap-3">
          {eyebrow ? <p className={`text-sm font-extrabold uppercase tracking-widest ${tone === "ink" || tone === "brand" ? "text-gold" : "text-brand"}`}>{eyebrow}</p> : null}
          <h2 className="cz-display text-[clamp(40px,11vw,64px)]">{title}</h2>
          {lead ? <p className={`text-lg ${tone === "ink" || tone === "brand" ? "text-[#E4E1D6]" : "text-muted"}`}>{lead}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function MarketingPage({ children, darkHeader = false }: { children: ReactNode; darkHeader?: boolean }) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader dark={darkHeader} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** A phone frame drawn in HTML, showing the kids home. No images, so it costs almost nothing to load. */
export function PhoneMock() {
  return (
    <div aria-hidden="true" className="mx-auto w-[260px] rounded-[40px] border-[6px] border-ink bg-cream p-3 shadow-[10px_10px_0_var(--gold)]">
      <div className="flex flex-col gap-3 rounded-[28px] bg-cream p-2">
        <div className="flex flex-col gap-2 rounded-[22px] bg-brand p-4 text-white">
          <p className="font-display text-xl font-black italic">HI, ADA!</p>
          <span className="self-start rounded-full bg-gold px-2 py-0.5 text-[10px] font-extrabold text-ink">Rising Star · Level 4</span>
          <div className="h-2 rounded-full bg-white/25"><div className="h-2 w-3/4 rounded-full bg-gold" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex h-20 items-end rounded-[16px] bg-ink p-2 font-display text-[11px] font-black italic text-white">ROAD TO CHAMP</div>
          <div className="flex h-20 items-end rounded-[16px] bg-gold p-2 font-display text-[11px] font-black italic text-ink">THE ARENA</div>
          <div className="flex h-20 items-end rounded-[16px] bg-coral p-2 font-display text-[11px] font-black italic text-ink">FAITH QUEST</div>
          <div className="flex h-20 items-end rounded-[16px] border-2 border-line bg-surface p-2 font-display text-[11px] font-black italic text-ink">HALL OF CHAMPS</div>
        </div>
      </div>
    </div>
  );
}

/** Placeholder art from /public/placeholders (listed in docs/ASSETS.md). Decorative, so alt is empty. */
export function Art({ name, size, className = "" }: { name: string; size: number; className?: string }) {
  return <Image src={`/placeholders/${name}.webp`} alt="" width={size} height={size} className={`h-auto object-contain ${className}`} style={{ width: size }} loading="lazy" />;
}

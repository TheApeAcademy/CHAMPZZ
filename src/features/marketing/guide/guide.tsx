"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GUIDE, type GuideRole } from "./guide-data";

/** One role's six steps: a coloured hero card, then numbered step cards that read like a path. */
export function GuideRolePanel({ role, headingLevel = 3 }: { role: GuideRole; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="flex flex-col gap-6" id={`guide-${role.key}`}>
      <div className="relative overflow-hidden rounded-[clamp(28px,4vw,40px)] border-4 border-ink p-[clamp(22px,4vw,40px)] shadow-[0_10px_0_var(--ink)]" style={{ background: role.color, color: role.ink }}>
        <div aria-hidden="true" className="cz-dots absolute inset-0" />
        <div className="relative z-[2] flex max-w-[60%] flex-col gap-3 md:max-w-[62%]">
          <span className="self-start rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-black uppercase tracking-[.12em] text-cream">{role.label}</span>
          <H className="cz-display text-[clamp(32px,8.4vw,84px)] [text-shadow:3px_3px_0_rgba(11,16,38,.25)]">{role.promise}</H>
          <p className="text-[clamp(15px,2vw,19px)] font-extrabold opacity-90">{role.who}</p>
        </div>
        <Image src={role.character} alt="" width={420} height={520} className="cz-bob pointer-events-none absolute bottom-0 right-[-2%] h-[92%] w-auto max-w-[44%] object-contain object-bottom drop-shadow-[0_18px_26px_rgba(11,16,38,.3)]" />
      </div>

      <ol className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {role.steps.map((s, i) => (
          <li key={s.title} className="relative flex min-w-0 gap-4 rounded-[26px] border-[2.5px] border-ink bg-[#FFFDF7] p-5 shadow-[0_6px_0_var(--ink)]">
            <span aria-hidden="true" className="cz-display flex-none text-[64px] leading-[.8]" style={{ color: role.color, WebkitTextStroke: "2px var(--ink)" }}>{i + 1}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[20px] font-black leading-tight">
                  <span className="sr-only">Step {i + 1}: </span>{s.title}
                </span>
                <Image src={s.art} alt="" width={56} height={56} className="h-12 w-12 flex-none object-contain drop-shadow-[0_4px_5px_rgba(11,16,38,.2)]" />
              </div>
              <p className="text-[15.5px] leading-relaxed text-muted">{s.body}</p>
              <span className="mt-auto self-start rounded-full px-3 py-1 text-[12px] font-black" style={{ background: role.tint, color: "#0B1026" }}>
                <span aria-hidden="true">Where: </span><span className="sr-only">Where to find it: </span>{s.where}
              </span>
            </div>
          </li>
        ))}
      </ol>
      <p className="flex items-start gap-3 rounded-[20px] bg-ink px-5 py-4 text-[16px] font-bold text-cream">
        <span aria-hidden="true" className="grid h-7 w-7 flex-none place-items-center rounded-full bg-gold text-sm font-black text-ink">★</span>
        {role.tip}
      </p>
    </div>
  );
}

/** Landing page section: pick who you are, see your six steps. */
export function LandingGuide() {
  const [active, setActive] = useState<GuideRole["key"]>("leaders");
  const role = GUIDE.find((r) => r.key === active)!;
  return (
    <section id="guide" data-chapter="guide" aria-labelledby="guide-title" className="relative overflow-clip bg-cream px-5 py-[clamp(80px,10vw,140px)]">
      <div aria-hidden="true" className="cz-dots-ink absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="self-start rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-black uppercase tracking-[.14em] text-cream">The guide</span>
          <h2 id="guide-title" className="cz-display text-[clamp(56px,13vw,140px)] leading-[.84]">
            How Champzz <span className="text-brand [text-shadow:3px_3px_0_#1F3EC0,6px_6px_0_var(--ink)]">works</span>
          </h2>
          <p className="max-w-[46ch] text-[clamp(17px,2.2vw,21px)] font-bold text-muted">Pick who you are. Six simple steps, the real screen names, and you are ready for Sunday.</p>
        </div>

        <div role="tablist" aria-label="Who are you?" className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {GUIDE.map((r) => {
            const on = r.key === active;
            return (
              <button key={r.key} type="button" role="tab" aria-selected={on} aria-controls="guide-panel" id={`guide-tab-${r.key}`} onClick={() => setActive(r.key)}
                className={`relative flex min-h-[88px] items-center gap-3 overflow-hidden rounded-[24px] border-[2.5px] border-ink px-3 text-left transition-[transform,box-shadow] duration-150 ${on ? "translate-y-[2px] shadow-[0_3px_0_var(--ink)]" : "shadow-[0_6px_0_var(--ink)] hover:-translate-y-0.5"}`}
                style={{ background: on ? r.color : "#FFFDF7", color: on ? r.ink : "#0B1026" }}>
                <span className="relative h-16 w-14 flex-none">
                  <Image src={r.character} alt="" fill sizes="56px" className="object-contain object-bottom" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[17px] font-black">{r.label}</span>
                  <span className={`block text-[12px] font-bold ${on ? "opacity-85" : "text-muted"}`}>{r.steps.length} steps</span>
                </span>
              </button>
            );
          })}
        </div>

        <div id="guide-panel" role="tabpanel" aria-labelledby={`guide-tab-${role.key}`} key={role.key} className="cz-rise">
          <GuideRolePanel role={role} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/guide" className="inline-flex min-h-[60px] items-center gap-2 rounded-full border-[2.5px] border-ink bg-gold px-7 text-[19px] font-black !text-ink shadow-[0_6px_0_var(--ink),inset_0_3px_0_rgba(255,255,255,.55)] active:translate-y-1 active:shadow-[0_2px_0_var(--ink)]">
            Open the full guide
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
          <span className="text-[15px] font-bold text-muted">Every role on one page, easy to print or share.</span>
        </div>
      </div>
    </section>
  );
}

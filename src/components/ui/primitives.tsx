import type { ComponentProps, ReactNode } from "react";

// Shared building blocks in the Claude Design language: ink outlines, solid
// drop shadows that squash on press, cream inputs, pill buttons. Sizes keep
// 44px+ touch targets everywhere (DESIGN.md).

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-center font-black leading-tight cz-press disabled:cursor-not-allowed disabled:opacity-60";

export type ButtonVariant = "primary" | "gold" | "outline" | "danger" | "ghost" | "ink";

export function buttonClass(variant: ButtonVariant = "primary", size: "md" | "lg" = "md") {
  const big = size === "lg" ? " min-h-[60px] text-[19px]" : " text-base";
  return (
    {
      primary: `${base} bg-brand text-brand-ink`,
      gold: `${base} cz-press-gold bg-gold text-ink`,
      outline: `${base} bg-[#FFFDF7] text-ink`,
      danger: `${base} bg-danger text-white`,
      ghost: "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#F3EADA] px-5 font-extrabold text-ink disabled:opacity-60",
      ink: `${base} bg-ink text-cream [box-shadow:0_5px_0_var(--gold)]`,
    }[variant] + (variant === "ghost" ? "" : big)
  );
}

export function Card({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`min-w-0 rounded-[22px] border border-line bg-surface p-5 shadow-[0_2px_0_rgba(11,16,38,0.04)] ${className}`}>
      {children}
    </section>
  );
}

/** A bolder card for hero moments: ink outline and a solid shadow. */
export function BoldCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-[32px] border-4 border-ink bg-[#FFFDF7] p-6 shadow-[0_10px_0_var(--ink)] sm:p-8 ${className}`}>
      {children}
    </section>
  );
}

const inputCls =
  "cz-input min-h-12 w-full min-w-0 rounded-[16px] border-2 border-ink px-4 text-base font-normal text-ink placeholder:text-[#8A8DA6]";

export function Field({ label, hint, big = false, className = "", ...input }: { label: string; hint?: string; big?: boolean } & ComponentProps<"input">) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-[15px] font-extrabold">
      {label}
      <input {...input} className={`${inputCls} ${big ? "min-h-[58px] rounded-[18px] border-[2.5px] text-[18px]" : ""} ${className}`} />
      {hint ? <span className="text-sm font-semibold text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextArea({ label, hint, ...rest }: { label: string; hint?: string } & ComponentProps<"textarea">) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-[15px] font-extrabold">
      {label}
      <textarea {...rest} className={`${inputCls} min-h-28 py-3 ${rest.className ?? ""}`} />
      {hint ? <span className="text-sm font-semibold text-muted">{hint}</span> : null}
    </label>
  );
}

export function Select({ label, children, big = false, ...rest }: { label: string; big?: boolean } & ComponentProps<"select">) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-[15px] font-extrabold">
      {label}
      <select {...rest} className={`${inputCls} pr-8 ${big ? "min-h-[58px] rounded-[18px] border-[2.5px] text-[17px]" : ""}`}>
        {children}
      </select>
    </label>
  );
}

export function Banner({ tone = "info", children }: { tone?: "info" | "warn" | "error" | "ok"; children: ReactNode }) {
  const cls = {
    info: "bg-[#DDE5FF] text-[#1A2C80]",
    warn: "bg-[#FCEBC4] text-[#5A3F00]",
    error: "bg-[#FDE2DE] text-[#8A1B12]",
    ok: "bg-[#DCF5E6] text-[#0B5A2E]",
  }[tone];
  const dot = { info: "bg-brand text-white", warn: "bg-gold text-ink", error: "bg-coral text-ink", ok: "bg-[#1E8F5A] text-white" }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-3 rounded-[18px] border-2 border-ink px-4 py-3 text-[15px] font-extrabold ${cls}`}>
      <span aria-hidden="true" className={`grid h-6 w-6 flex-none place-items-center rounded-full border-2 border-ink text-xs font-black ${dot} ${tone === "ok" ? "before:content-['✓']" : "before:content-['!']"}`} />
      <span className="min-w-0">{children}</span>
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "new" | "ok" | "warn" }) {
  const cls = {
    neutral: "bg-[#F3EADA] text-ink",
    new: "bg-[#FCEBC4] text-[#5A3F00]",
    ok: "bg-[#DDE5FF] text-[#1A2C80]",
    warn: "bg-[#FDE2DE] text-[#8A1B12]",
  }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold ${cls}`}>{children}</span>;
}

/** Page title block for adult screens: optional eyebrow, condensed title, lead line. */
export function PageTitle({ eyebrow, title, lead, children }: { eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {eyebrow ? <span className="text-sm font-extrabold text-muted">{eyebrow}</span> : null}
      <h1 className="font-display text-[clamp(28px,7vw,40px)] font-extrabold leading-[1.05]">{title}</h1>
      {lead ? <p className="text-muted">{lead}</p> : null}
      {children}
    </div>
  );
}

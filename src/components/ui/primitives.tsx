import type { ComponentProps, ReactNode } from "react";

const base = "inline-flex min-h-11 items-center justify-center rounded-[14px] px-5 font-extrabold transition-opacity disabled:opacity-50";

export function buttonClass(variant: "primary" | "outline" | "danger" | "ghost" = "primary") {
  return {
    primary: `${base} bg-brand text-brand-ink`,
    outline: `${base} border-2 border-ink bg-surface text-ink`,
    danger: `${base} bg-danger text-white`,
    ghost: `${base} bg-cream text-ink`,
  }[variant];
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[20px] border border-line bg-surface p-5 ${className}`}>{children}</section>;
}

export function Field({ label, hint, ...input }: { label: string; hint?: string } & ComponentProps<"input">) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-bold">
      {label}
      <input
        {...input}
        className="min-h-11 rounded-[12px] border border-line bg-surface px-3 text-base font-normal outline-none focus:border-brand"
      />
      {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

export function Select({ label, children, ...rest }: { label: string } & ComponentProps<"select">) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-bold">
      {label}
      <select {...rest} className="min-h-11 rounded-[12px] border border-line bg-surface px-3 text-base font-normal">
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
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-[14px] px-4 py-3 text-sm font-bold ${cls}`}>
      {children}
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "new" | "ok" | "warn" }) {
  const cls = {
    neutral: "bg-cream text-ink",
    new: "bg-[#FCEBC4] text-[#5A3F00]",
    ok: "bg-[#DDE5FF] text-[#1A2C80]",
    warn: "bg-[#FDE2DE] text-[#8A1B12]",
  }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-extrabold ${cls}`}>{children}</span>;
}

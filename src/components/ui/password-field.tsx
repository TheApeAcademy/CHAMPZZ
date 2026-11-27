"use client";
import { useId, useState, type ComponentProps, type ReactNode } from "react";

/**
 * Password input from the Accounts design: big cream field with a Show/Hide
 * toggle, a Caps Lock warning, and an optional strength meter for new passwords.
 */
export function PasswordField({ label, aside, meter = false, hint, ...input }: { label: string; aside?: ReactNode; meter?: boolean; hint?: string } & Omit<ComponentProps<"input">, "type">) {
  const id = useId();
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [len, setLen] = useState(0);
  const strength = len === 0 ? null : len < 10 ? { w: "30%", c: "#FF5A3C", t: `${10 - len} more to go` } : len < 14 ? { w: "70%", c: "#F2B33D", t: "Good" } : { w: "100%", c: "#1E8F5A", t: "Strong" };
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <label htmlFor={id} className="text-[15px] font-extrabold">{label}</label>
        {aside}
      </div>
      <div className="relative flex">
        <input
          {...input}
          id={id}
          type={show ? "text" : "password"}
          onKeyUp={(e) => setCaps(e.getModifierState?.("CapsLock") ?? false)}
          onInput={(e) => setLen(e.currentTarget.value.length)}
          className="cz-input min-h-[58px] w-full min-w-0 rounded-[18px] border-[2.5px] border-ink pl-4 pr-[84px] text-[18px] text-ink"
        />
        <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show}
          className="absolute bottom-2 right-2 top-2 rounded-[12px] bg-[#F3EADA] px-3.5 text-sm font-black text-ink">
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {caps ? <span className="text-sm font-extrabold text-[#5A3F00]">Caps Lock is on</span> : null}
      {meter ? (
        <span className="flex items-center gap-2.5 text-sm font-bold text-muted" aria-live="polite">
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#EADFC9]">
            <span className="block h-full rounded-full transition-[width] duration-300" style={{ width: strength?.w ?? "0%", background: strength?.c }} />
          </span>
          <span className="min-w-[9ch] text-right">{strength?.t ?? "10+ characters"}</span>
        </span>
      ) : null}
      {hint ? <span className="text-sm font-semibold text-muted">{hint}</span> : null}
    </div>
  );
}

"use client";
import Image from "next/image";
import { useState } from "react";

const KINDS = [
  { value: "church", label: "Church or children's ministry", img: "/placeholders/landing/icons-sunday-school-church.webp" },
  { value: "club", label: "Kids' club", img: "/placeholders/landing/feature-rocket.webp" },
  { value: "school", label: "School", img: "/placeholders/landing/feature-class.webp" },
  { value: "other", label: "Other", img: "/placeholders/landing/feature-achievements.webp" },
] as const;

const toSlug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
const inputCls = "cz-input min-h-[58px] w-full min-w-0 rounded-[18px] border-[2.5px] border-ink px-4 text-[18px] text-ink";

/** Name, web address (auto-filled from the name until edited), kind picker and a live preview. */
export function ClubSetupFields() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [touched, setTouched] = useState(false);
  const [kind, setKind] = useState<string>("church");
  const shownSlug = touched ? slug : toSlug(name);
  const valid = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(shownSlug);
  return (
    <>
      <label className="flex flex-col gap-2 text-[15px] font-extrabold">
        Club or ministry name
        <input name="name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Sunrise Kids" className={inputCls} />
      </label>
      <label className="flex flex-col gap-2 text-[15px] font-extrabold">
        Web address
        <span className="flex min-h-[58px] items-stretch overflow-hidden rounded-[18px] border-[2.5px] border-ink bg-[#FFFDF7] focus-within:border-brand focus-within:shadow-[0_0_0_4px_#DDE4FF]">
          <span className="flex flex-none items-center bg-[#F3EADA] pl-4 pr-1 text-[15px] font-bold text-muted">/c/</span>
          <input name="slug" required pattern="[a-z0-9][a-z0-9-]{1,38}[a-z0-9]" value={shownSlug} autoCapitalize="none" spellCheck={false}
            onChange={(e) => { setTouched(true); setSlug(e.target.value.toLowerCase()); }} placeholder="sunrise-kids"
            className="min-w-0 flex-1 border-0 bg-transparent pl-2 pr-3 text-[18px] text-ink outline-none" />
        </span>
        <span className={`text-sm font-extrabold ${shownSlug && !valid ? "text-[#C93A20]" : "text-muted"}`}>
          {shownSlug && !valid ? "Use 3 to 40 lowercase letters, numbers and hyphens." : "Your Clubhouse lives here. Lowercase letters, numbers and hyphens."}
        </span>
      </label>
      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-[15px] font-extrabold">What kind of organization?</legend>
        <input type="hidden" name="kind" value={kind} />
        <div className="grid grid-cols-2 gap-2.5">
          {KINDS.map((k) => (
            <button key={k.value} type="button" aria-pressed={kind === k.value} onClick={() => setKind(k.value)}
              className={`cz-press flex min-h-16 items-center gap-2.5 rounded-[18px] px-3 py-2 text-left text-[15px] font-extrabold leading-tight text-ink ${kind === k.value ? "bg-gold" : "bg-[#FFFDF7]"}`}>
              <Image src={k.img} alt="" width={36} height={36} className="h-9 w-9 flex-none object-contain" />
              {k.label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="flex items-center gap-3.5 rounded-[24px] bg-ink p-3 text-cream" aria-hidden="true">
        <span className="grid h-14 w-14 flex-none place-items-center rounded-[16px] border-[2.5px] border-cream bg-brand font-display text-[26px] font-black italic">{(name.trim().charAt(0) || "S").toUpperCase()}</span>
        <span className="min-w-0 leading-tight">
          <b className="block truncate text-lg">{name.trim() || "Sunrise Kids"}</b>
          <span className="text-sm text-[#C9CBE0] [overflow-wrap:anywhere]">/c/{shownSlug || "sunrise-kids"}</span>
        </span>
      </div>
    </>
  );
}

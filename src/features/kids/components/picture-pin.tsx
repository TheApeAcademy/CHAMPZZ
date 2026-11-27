"use client";
import { useState } from "react";

// Twelve original, simple pictures. A PIN is 4 taps: 20,736 combinations,
// safe only because sign-in locks after 5 wrong tries.
export const PICTURES: { name: string; color: string; path: string }[] = [
  { name: "Star", color: "#F2B33D", path: "M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" },
  { name: "Heart", color: "#FF5A3C", path: "M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" },
  { name: "Sun", color: "#F2B33D", path: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" },
  { name: "Moon", color: "#2F5BFF", path: "M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" },
  { name: "Ball", color: "#FF5A3C", path: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" },
  { name: "Fish", color: "#2F5BFF", path: "M3 12c3-5 9-6 13-2l5-3v10l-5-3c-4 4-10 3-13-2zM15 11h.01" },
  { name: "Tree", color: "#1E8F5A", path: "M12 2 5 12h4l-3 5h12l-3-5h4zM12 17v5" },
  { name: "House", color: "#0B1026", path: "M3 11 12 4l9 7v10H3zM9 21v-6h6v6" },
  { name: "Rocket", color: "#FF5A3C", path: "M12 2c4 3 5 8 4 12l-4 3-4-3c-1-4 0-9 4-12zM8 14l-3 2 1 4 3-2M16 14l3 2-1 4-3-2M12 8h.01" },
  { name: "Flower", color: "#D63384", path: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2a3 3 0 0 1 0 7 3 3 0 0 1 0-7zM12 15a3 3 0 0 1 0 7 3 3 0 0 1 0-7zM2 12a3 3 0 0 1 7 0 3 3 0 0 1-7 0zM15 12a3 3 0 0 1 7 0 3 3 0 0 1-7 0z" },
  { name: "Cloud", color: "#4D5172", path: "M7 18a5 5 0 0 1 0-10 6 6 0 0 1 11 2 4 4 0 0 1 0 8z" },
  { name: "Car", color: "#2F5BFF", path: "M3 16V12l2-5h14l2 5v4zM3 16h18M7 19a2 2 0 1 0 0-.01M17 19a2 2 0 1 0 0-.01" },
];

export function PictureIcon({ index, size = 40 }: { index: number; size?: number }) {
  const p = PICTURES[index]!;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={p.path} />
    </svg>
  );
}

/** Tap 4 pictures. Submits as a hidden field: name="pin", value "3-0-11-7". */
export function PicturePin({ name = "pin", big = false, legend = "Tap your 4 pictures" }: { name?: string; big?: boolean; legend?: string }) {
  const [picks, setPicks] = useState<number[]>([]);
  const slot = big ? "h-12 w-12 min-[400px]:h-14 min-[400px]:w-14" : "h-11 w-11 min-[400px]:h-12 min-[400px]:w-12";
  return (
    <fieldset className="flex min-w-0 flex-col gap-3.5">
      <legend className="mb-3 text-[17px] font-black">{legend}</legend>
      <input type="hidden" name={name} value={picks.length === 4 ? picks.join("-") : ""} />
      <div className="flex items-center justify-center gap-2 min-[400px]:gap-3" aria-live="polite" aria-label={`${picks.length} of 4 pictures chosen`}>
        {[0, 1, 2, 3].map((i) => {
          const pick = picks[i];
          return (
            <span key={i} className={`${slot} grid flex-none place-items-center rounded-[16px] border-[2.5px] border-ink shadow-[0_3px_0_var(--ink)] ${pick !== undefined ? "bg-[#FCEBC4]" : "bg-[#FFFDF7]"}`}>
              {pick !== undefined ? <span className="h-4 w-4 rounded-full animate-[cz-pop_.3s_both]" style={{ background: PICTURES[pick]!.color }} aria-hidden="true" /> : null}
            </span>
          );
        })}
        <button type="button" onClick={() => setPicks([])} className="min-h-11 flex-none px-1.5 text-[15px] font-black underline">
          Clear
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {PICTURES.map((p, i) => (
          <button
            key={p.name}
            type="button"
            aria-label={p.name}
            data-picture={i}
            disabled={picks.length >= 4}
            onClick={() => setPicks((cur) => (cur.length < 4 ? [...cur, i] : cur))}
            className="grid aspect-square min-h-14 place-items-center rounded-[18px] border-[2.5px] border-ink bg-[#FFFDF7] p-0 shadow-[0_4px_0_var(--ink)] transition-[transform,box-shadow] duration-100 active:translate-y-[3px] active:shadow-[0_1px_0_var(--ink)] disabled:opacity-50"
          >
            <PictureIcon index={i} size={big ? 40 : 34} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

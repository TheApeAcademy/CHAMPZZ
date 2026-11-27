/**
 * Champzz wordmark: the hand-signed script from the landing page and every
 * Claude Design screen, with the Trophy Gold swash and star underneath.
 * It always reads as the brand name, "Champzz" (docs/DESIGN.md, docs/NAMING.md).
 * `size` is the script's font size in px; the swash scales with it.
 */
export const BRAND_WORD = "Champzz";

export function Logo({ size = 28, tone = "ink", animate = false }: { size?: number; tone?: "ink" | "cream"; animate?: boolean }) {
  const color = tone === "ink" ? "var(--ink)" : "var(--cream)";
  return (
    <span role="img" aria-label="Champzz" className="inline-flex flex-col items-start leading-none" style={{ fontSize: size }}>
      <span
        aria-hidden="true"
        className={animate ? "block font-script cz-sig" : "block font-script"}
        style={{ color, fontSize: "1em", lineHeight: 1, transform: "rotate(-5deg)", padding: "0.1em 0.33em 0 0.05em", whiteSpace: "nowrap" }}
      >
        {BRAND_WORD}
      </span>
      <svg viewBox="0 0 160 22" aria-hidden="true" fill="none" style={{ width: "3.9em", height: "0.47em", marginTop: "-0.25em", overflow: "visible" }}>
        <path d="M4 15 C 40 23, 96 21, 140 8" stroke="#F2B33D" strokeWidth="4" strokeLinecap="round" />
        <path d="M150 0 L152.6 6 L159 8.5 L152.6 11 L150 17 L147.4 11 L141 8.5 L147.4 6Z" fill="#F2B33D" />
      </svg>
    </span>
  );
}

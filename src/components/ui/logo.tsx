/**
 * Champzz wordmark. It must always read as the full brand name, CHAMPZZ:
 * "CHAMP" in ink (or cream on dark) and "ZZ" in Trophy Gold, both in the
 * heavy italic display face, so the double z reads as speed, never sleep.
 * ("Champ" on its own means a kid, as in Road to Champ; "Champzz" is the brand.)
 */
export function Logo({ size = 28, tone = "ink" }: { size?: number; tone?: "ink" | "cream" }) {
  return (
    <span
      role="img"
      aria-label="Champzz"
      className="inline-flex items-baseline font-display font-black italic leading-none tracking-tight"
      style={{ fontSize: size }}
    >
      <span aria-hidden="true" style={{ color: tone === "ink" ? "var(--ink)" : "var(--cream)" }}>CHAMP</span>
      <span aria-hidden="true" style={{ color: "var(--gold)", letterSpacing: "-0.04em" }}>ZZ</span>
    </span>
  );
}

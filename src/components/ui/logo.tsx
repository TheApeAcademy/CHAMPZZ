/** Champzz wordmark: italic CHAMP plus two Trophy Gold lightning bolts. */
export function Logo({ size = 28, tone = "ink" }: { size?: number; tone?: "ink" | "cream" }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label="Champzz">
      <span
        aria-hidden="true"
        className="font-display font-black italic leading-none tracking-tight"
        style={{ fontSize: size, color: tone === "ink" ? "var(--ink)" : "var(--cream)" }}
      >
        CHAMP
      </span>
      <svg aria-hidden="true" width={size * 1.25} height={size} viewBox="44 0 128 112">
        <polygon points="58,8 110,8 82,52 104,52 54,108 70,64 50,64" fill="var(--gold)" />
        <polygon points="114,8 166,8 138,52 160,52 110,108 126,64 106,64" fill="var(--gold)" />
      </svg>
    </span>
  );
}

import { HAIR_COLORS, OUTFITS, SKINS, type AvatarConfig } from "@/features/kids/avatar";

/**
 * My Champ. Drawn in SVG so it costs nothing to load. It grows with the kid:
 * from level 2 a gold ring, from level 4 sparkles, and extras they unlock.
 */
export function ChampAvatar({ a, level = 1, size = 96, label }: { a: AvatarConfig; level?: number; size?: number; label?: string }) {
  const skin = SKINS[a.skin]!;
  const hair = HAIR_COLORS[a.hairColor]!;
  const outfit = OUTFITS[a.outfit]!;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <circle cx="50" cy="50" r="48" fill={level >= 2 ? "#F2B33D" : "#E6DCC6"} />
      <circle cx="50" cy="50" r={level >= 2 ? 43 : 46} fill="#FFF8EC" />
      {a.extra === "cape" ? <path d="M24 98 L32 60 L68 60 L76 98 Z" fill="#FF5A3C" /> : null}
      <path d="M22 98c2-17 13-27 28-27s26 10 28 27" fill={outfit} />
      {a.extra === "medal" ? (
        <g>
          <path d="M44 72 L50 84 L56 72" fill="none" stroke="#2F5BFF" strokeWidth="3" />
          <circle cx="50" cy="87" r="5" fill="#F2B33D" stroke="#0B1026" strokeWidth="1.5" />
        </g>
      ) : null}
      <circle cx="50" cy="46" r="20" fill={skin} />
      {/* hair */}
      {a.hair === 0 ? <path d="M30 42c0-14 9-21 20-21s20 7 20 21c-5-6-12-8-20-8s-15 2-20 8z" fill={hair} /> : null}
      {a.hair === 1 ? (
        <g fill={hair}>
          <circle cx="31" cy="30" r="9" />
          <circle cx="69" cy="30" r="9" />
          <path d="M31 40c0-12 8-17 19-17s19 5 19 17c-6-5-12-7-19-7s-13 2-19 7z" />
        </g>
      ) : null}
      {a.hair === 2 ? (
        <g fill={hair}>
          <path d="M30 44c0-15 9-22 20-22s20 7 20 22c-5-7-12-9-20-9s-15 2-20 9z" />
          <rect x="27" y="44" width="5" height="26" rx="2.5" />
          <rect x="68" y="44" width="5" height="26" rx="2.5" />
        </g>
      ) : null}
      {a.hair === 3 ? (
        <g fill={hair}>
          <circle cx="50" cy="20" r="9" />
          <path d="M30 42c0-13 9-19 20-19s20 6 20 19c-5-6-12-8-20-8s-15 2-20 8z" />
        </g>
      ) : null}
      {a.hair === 4 ? (
        <g fill={hair}>
          {[32, 40, 50, 60, 68].map((x) => <circle key={x} cx={x} cy={x === 50 ? 25 : 30} r="8" />)}
        </g>
      ) : null}
      {a.hair === 5 ? (
        <g>
          <path d="M29 40c0-13 9-19 21-19s21 6 21 19z" fill="#2F5BFF" />
          <rect x="48" y="38" width="28" height="5" rx="2.5" fill="#2F5BFF" />
        </g>
      ) : null}
      {a.extra === "headband" ? <rect x="30" y="34" width="40" height="5" rx="2.5" fill="#FF5A3C" /> : null}
      {a.extra === "crown" ? <path d="M33 26 L38 12 L45 22 L50 9 L55 22 L62 12 L67 26 Z" fill="#F2B33D" stroke="#0B1026" strokeWidth="1.5" /> : null}
      {/* face */}
      <circle cx="43" cy="47" r="2.4" fill="#0B1026" />
      <circle cx="57" cy="47" r="2.4" fill="#0B1026" />
      <path d="M43 54c4 3.5 10 3.5 14 0" stroke="#0B1026" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {level >= 4 ? (
        <g fill="#F2B33D">
          <path d="M10 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
          <path d="M88 14l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" />
        </g>
      ) : null}
    </svg>
  );
}

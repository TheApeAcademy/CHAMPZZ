import type { ArenaGame } from "@/features/games/meta";

// Game icons and colours from the Claude Design "Champ Arena" lobby.
type P = { d: string; fill: string; stroke?: string; sw?: number; tf?: string; op?: number };
const I = "#0B1026", C = "#FFF8EC";
const RR = "M4 0h14a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z";
const CARD = "M4 0h18a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z";
const STAR = "M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z";

export const ARENA_STYLE: Record<ArenaGame, { tag: string; color: string; tint: string; verseRef: string; faithBody: string; icon: P[] }> = {
  scramble: {
    tag: "Words", color: "#FF5A3C", tint: "#FFB4A3", verseRef: "Psalm 119:105", faithBody: "Put the memory verse back in order before the clock runs out.",
    icon: [
      { d: RR, fill: C, tf: "translate(4 28) rotate(-14)" }, { d: "M6 8h10M6 14h6", fill: "none", tf: "translate(4 28) rotate(-14)" },
      { d: RR, fill: "#FFD978", tf: "translate(21 12) rotate(6)" }, { d: "M6 8h10M6 14h7", fill: "none", tf: "translate(21 12) rotate(6)" },
      { d: RR, fill: "#A8BCFF", tf: "translate(37 30) rotate(-5)" }, { d: "M6 8h10M6 14h5", fill: "none", tf: "translate(37 30) rotate(-5)" },
    ],
  },
  memory: {
    tag: "Memory", color: "#6B2C91", tint: "#B58AD6", verseRef: "Hebrews 11:7", faithBody: "Flip the cards and match each Bible hero to their story.",
    icon: [
      { d: CARD, fill: "#2F5BFF", tf: "translate(8 16) rotate(-14)" }, { d: "M5 5h16v24H5z", fill: "none", stroke: "rgba(255,248,236,.55)", sw: 1.5, tf: "translate(8 16) rotate(-14)" },
      { d: CARD, fill: C, tf: "translate(30 12) rotate(10)" }, { d: STAR, fill: "#F2B33D", tf: "translate(30 12) rotate(10) translate(1 5)" },
    ],
  },
  whoami: {
    tag: "Quiz", color: "#F2B33D", tint: "#FFE6A3", verseRef: "Esther 4:14", faithBody: "Clue by clue, guess the person from the Bible.",
    icon: [
      { d: "M32 6a12 12 0 1 1 0 24a12 12 0 1 1 0-24z", fill: I }, { d: "M10 58c2-13 11-20 22-20s20 7 22 20z", fill: I },
      { d: "M27.5 14.5a5 5 0 1 1 6.5 4.8c-1.3.5-2 1.5-2 3", fill: "none", stroke: "#F2B33D", sw: 3.2 }, { d: "M32 26.5v.2", fill: "none", stroke: "#F2B33D", sw: 3.6 },
    ],
  },
  wordsearch: {
    tag: "Puzzle", color: "#1E8F5A", tint: "#7EE0B5", verseRef: "2 Timothy 3:16", faithBody: "Find the books of the Bible hidden in the grid.",
    icon: [
      { d: "M10 10h12v12H10zM26 10h12v12H26zM42 10h12v12H42zM10 26h12v12H10zM26 26h12v12H26zM42 26h12v12H42zM10 42h12v12H10zM26 42h12v12H26zM42 42h12v12H42z", fill: C, sw: 2 },
      { d: "M2 26h60a6 6 0 0 1 0 12H2a6 6 0 0 1 0-12z", fill: "#F2B33D", tf: "rotate(45 32 32)", op: 0.9 },
    ],
  },
  jigsaw: {
    tag: "Jigsaw", color: "#B3263E", tint: "#FF8FB3", verseRef: "Daniel 6:22", faithBody: "Swap the pieces until the Bible picture is whole again.",
    icon: [
      { d: "M14 20h9a6 6 0 1 1 12 0h9v9a6 6 0 1 1 0 12v9H14z", fill: "#FFD978", tf: "translate(10 -8) rotate(12 30 35)" },
      { d: "M12 24h9a6 6 0 1 1 12 0h9v9a6 6 0 1 1 0 12v9H12z", fill: C }, { d: "M22 40c2 3 6 3 8 0M22 34h.1M30 34h.1", fill: "none", sw: 3 },
    ],
  },
  catch: {
    tag: "Action", color: "#2F5BFF", tint: "#A8BCFF", verseRef: "Genesis 7:9", faithBody: "Steer the ark, catch the animals two by two, dodge the storm.",
    icon: [
      { d: "M12 26a20 20 0 0 1 40 0", fill: "none", stroke: "#FF5A3C", sw: 3.5 }, { d: "M17 26a15 15 0 0 1 30 0", fill: "none", stroke: "#F2B33D", sw: 3.5 }, { d: "M22 26a10 10 0 0 1 20 0", fill: "none", stroke: "#7EE0B5", sw: 3.5 },
      { d: "M8 38h48l-8 12H16z", fill: "#A0662E" }, { d: "M20 27h24v11H20z", fill: "#C88A45" }, { d: "M17 28l15-8 15 8z", fill: "#7A4A22" }, { d: "M29 30h6v5h-6z", fill: "#F2B33D", sw: 2 },
      { d: "M2 56c5-3.5 9-3.5 14 0s9 3.5 14 0 9-3.5 14 0 9 3.5 14 0", fill: "none", stroke: C, sw: 3 },
    ],
  },
};

/** The glossy rounded app tile with the game's icon. */
export function ArenaIcon({ game, size = "46%" }: { game: ArenaGame; size?: string }) {
  const s = ARENA_STYLE[game];
  return (
    <span className="arena-float grid aspect-square place-items-center rounded-[28%]" style={{ width: size, background: `linear-gradient(155deg,${s.tint},${s.color})`, boxShadow: `inset 0 3px 0 rgba(255,255,255,.45), inset 0 -8px 0 rgba(0,0,0,.18), 0 0 0 1px rgba(255,248,236,.18), 0 26px 44px -16px ${s.color}` }}>
      <svg viewBox="0 0 64 64" width="76%" height="76%" aria-hidden="true" className="overflow-visible drop-shadow-[0_3px_0_rgba(11,16,38,.25)]">
        {s.icon.map((p, i) => (
          <path key={i} d={p.d} fill={p.fill} stroke={p.stroke ?? I} strokeWidth={p.sw ?? 2.5} strokeLinecap="round" strokeLinejoin="round" transform={p.tf || undefined} opacity={p.op ?? 1} />
        ))}
      </svg>
    </span>
  );
}

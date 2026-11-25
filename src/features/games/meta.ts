// Names and rules shared by the Road to Champ screens and the Arena.

export const TIERS = [
  { tier: 1, name: "Rookie", points: 100 },
  { tier: 2, name: "Rising Star", points: 200 },
  { tier: 3, name: "All-Star", points: 300 },
  { tier: 4, name: "Legend", points: 500 },
  { tier: 5, name: "Champ", points: 1000 },
] as const;

export type ArenaGame = "scramble" | "memory" | "whoami" | "wordsearch" | "jigsaw" | "catch";

export const ARENA: { key: ArenaGame; faithName: string; name: string; blurb: string; color: string }[] = [
  { key: "scramble", faithName: "Verse Scramble", name: "Word Scramble", blurb: "Put the words back in order.", color: "bg-brand text-white" },
  { key: "memory", faithName: "Memory Match", name: "Memory Match", blurb: "Find the matching pairs.", color: "bg-gold text-ink" },
  { key: "whoami", faithName: "Who Am I?", name: "Who Am I?", blurb: "Guess from the clues. Fewer clues, more points.", color: "bg-coral text-ink" },
  { key: "wordsearch", faithName: "Word Search", name: "Word Search", blurb: "Tap the first and last letter of each word.", color: "bg-surface text-ink border-2 border-line" },
  { key: "jigsaw", faithName: "Jigsaw", name: "Jigsaw", blurb: "Swap tiles to fix the picture.", color: "bg-[#E8F5EE] text-ink" },
  { key: "catch", faithName: "Ark Catch", name: "Star Catch", blurb: "Catch the good things, dodge the storms.", color: "bg-ink text-white" },
];

export function arenaName(key: ArenaGame, faith: boolean) {
  const g = ARENA.find((a) => a.key === key)!;
  return faith ? g.faithName : g.name;
}

export const JIGSAW_IMAGES = {
  faith: [
    { src: "/placeholders/scene-noah.webp", w: 427, h: 640, alt: "Noah's ark" },
    { src: "/placeholders/scene-david.webp", w: 427, h: 640, alt: "David" },
    { src: "/placeholders/scene-moses.webp", w: 427, h: 640, alt: "Moses" },
    { src: "/placeholders/scene-daniel.webp", w: 640, h: 357, alt: "Daniel" },
  ],
  general: [
    { src: "/placeholders/rocket.webp", w: 360, h: 360, alt: "A rocket" },
    { src: "/placeholders/game-rocket.webp", w: 360, h: 351, alt: "A game rocket" },
    { src: "/placeholders/teacher.webp", w: 400, h: 400, alt: "A teacher" },
    { src: "/placeholders/trophy.webp", w: 279, h: 360, alt: "A trophy" },
  ],
};

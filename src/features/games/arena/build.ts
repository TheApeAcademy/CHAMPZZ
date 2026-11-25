// Pure puzzle builders for the Arena. The server builds the first puzzle;
// the browser rebuilds for "Play again". No answers here are secret: Arena
// games are for fun, and their Champ Points are capped once a game a day.
import { randInt, shuffle } from "@/lib/random";

export type ScrambleItem = { title: string; text: string };
export type ScrambleRound = { title: string; words: string[]; order: number[] };
export function buildScramble(items: ScrambleItem[]): ScrambleRound[] {
  return shuffle(items).slice(0, 3).map((it) => {
    const words = it.text.trim().split(/\s+/);
    let order = shuffle(words.map((_, i) => i));
    if (order.every((v, i) => v === i) && words.length > 1) order = [...order.slice(1), order[0]!];
    return { title: it.title, words, order };
  });
}

export function buildMemory(): number[] {
  const icons = shuffle([...Array(12).keys()]).slice(0, 6);
  return shuffle([...icons, ...icons]);
}

export type WhoItem = { answer: string; clues: string[] };
export type WhoRound = { answer: string; clues: string[]; options: string[] };
export function buildWhoAmI(items: WhoItem[]): WhoRound[] {
  const pool = shuffle(items);
  return pool.slice(0, 3).map((it) => {
    const others = shuffle(items.filter((x) => x.answer !== it.answer).map((x) => x.answer)).slice(0, 3);
    return { answer: it.answer, clues: it.clues, options: shuffle([it.answer, ...others]) };
  });
}

export type Placed = { word: string; cells: number[] };
export type WordGrid = { size: number; letters: string[]; placed: Placed[]; title: string };
const DIRS = [[0, 1], [1, 0], [1, 1]] as const;
export function buildWordSearch(lists: { title: string; words: string[] }[]): WordGrid {
  const list = lists[randInt(lists.length)]!;
  const size = 10;
  const letters: string[] = Array(size * size).fill("");
  const placed: Placed[] = [];
  for (const raw of shuffle(list.words)) {
    const word = raw.toUpperCase().replace(/[^A-Z]/g, "");
    if (word.length < 2 || word.length > size) continue;
    for (let tries = 0; tries < 150; tries++) {
      const [dr, dc] = DIRS[randInt(DIRS.length)]!;
      const r0 = randInt(size - dr * (word.length - 1));
      const c0 = randInt(size - dc * (word.length - 1));
      const cells = [...word].map((_, i) => (r0 + dr * i) * size + (c0 + dc * i));
      if (cells.every((cell, i) => letters[cell] === "" || letters[cell] === word[i])) {
        cells.forEach((cell, i) => { letters[cell] = word[i]!; });
        placed.push({ word, cells });
        break;
      }
    }
  }
  const AZ = "ABCDEFGHIJKLMNOPRSTUVWY";
  for (let i = 0; i < letters.length; i++) if (!letters[i]) letters[i] = AZ[randInt(AZ.length)]!;
  return { size, letters, placed, title: list.title };
}

export type JigsawImage = { src: string; w: number; h: number; alt: string };
export function buildJigsaw(images: JigsawImage[]): { image: JigsawImage; order: number[] } {
  const image = images[randInt(images.length)]!;
  let order = shuffle([...Array(9).keys()]);
  while (order.every((v, i) => v === i)) order = shuffle(order);
  return { image, order };
}

"use client";
import { useState } from "react";
import { ArenaFinish } from "@/features/games/components/arena-finish";
import { buildWordSearch, type WordGrid } from "./build";

export function WordSearch({ slug, lists, initial }: { slug: string; lists: { title: string; words: string[] }[]; initial: WordGrid }) {
  const [g, setG] = useState(initial);
  const [start, setStart] = useState<number | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [miss, setMiss] = useState(false);
  const done = found.length === g.placed.length && g.placed.length > 0;

  const again = () => { setG(buildWordSearch(lists)); setStart(null); setFound([]); setMiss(false); };
  if (done) return <ArenaFinish slug={slug} game="wordsearch" score={found.length * 20} message="Every word found!" onAgain={again} />;

  const tap = (i: number) => {
    if (start === null) { setStart(i); setMiss(false); return; }
    const hit = g.placed.find((p) => !found.includes(p.word) &&
      ((p.cells[0] === start && p.cells.at(-1) === i) || (p.cells[0] === i && p.cells.at(-1) === start)));
    if (hit) setFound([...found, hit.word]); else setMiss(true);
    setStart(null);
  };
  const foundCells = new Set(g.placed.filter((p) => found.includes(p.word)).flatMap((p) => p.cells));

  return (
    <section className="flex flex-col gap-3" data-testid="wordsearch">
      <p className="text-sm font-bold text-muted">{g.title}: tap the first letter, then the last letter of a word.</p>
      <ul className="flex flex-wrap gap-2" aria-label="Words to find">
        {g.placed.map((p) => <li key={p.word} className={`rounded-full px-3 py-1 text-sm font-extrabold ${found.includes(p.word) ? "bg-[#1E8F5A] text-white line-through" : "bg-surface"}`}>{p.word}</li>)}
      </ul>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${g.size}, minmax(0, 1fr))` }} data-testid="ws-grid">
        {g.letters.map((l, i) => (
          <button key={i} type="button" onClick={() => tap(i)} data-cell={i} aria-label={`${l}, row ${Math.floor(i / g.size) + 1}, column ${(i % g.size) + 1}`}
            className={`flex aspect-square items-center justify-center rounded-[6px] text-sm font-extrabold sm:text-base ${start === i ? "bg-gold text-ink" : foundCells.has(i) ? "bg-[#1E8F5A] text-white" : "bg-surface"}`}>{l}</button>
        ))}
      </div>
      {miss ? <p role="alert" className="text-sm font-bold">Not a word. Try again!</p> : null}
    </section>
  );
}

"use client";
import { useState } from "react";
import { ArenaFinish } from "@/features/games/components/arena-finish";
import { buildScramble, type ScrambleItem, type ScrambleRound } from "./build";

export function Scramble({ slug, items, initial }: { slug: string; items: ScrambleItem[]; initial: ScrambleRound[] }) {
  const [rounds, setRounds] = useState(initial);
  const [r, setR] = useState(0);
  const [built, setBuilt] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);
  const round = rounds[r];

  const again = () => { setRounds(buildScramble(items)); setR(0); setBuilt([]); setMistakes(0); setScore(0); setWrong(false); setDone(false); };
  if (done || !round) return <ArenaFinish slug={slug} game="scramble" score={score} message="Unscrambled!" onAgain={again} />;

  const check = () => {
    if (built.every((w, i) => round.words[w] === round.words[i])) {
      const total = score + Math.max(10, 100 - mistakes * 20);
      setScore(total);
      if (r + 1 >= rounds.length) setDone(true);
      else { setR(r + 1); setBuilt([]); setMistakes(0); setWrong(false); }
    } else { setMistakes((m) => m + 1); setWrong(true); }
  };

  return (
    <section className="flex flex-col gap-4" data-testid="scramble">
      <p className="text-sm font-bold text-muted">Round {r + 1} of {rounds.length} · {round.title}</p>
      <div className="flex min-h-24 flex-wrap gap-2 rounded-[20px] border-2 border-dashed border-brand bg-surface p-3" aria-label="Your sentence" data-testid="scramble-answer">
        {built.map((w, i) => (
          <button key={`${w}-${i}`} type="button" onClick={() => { setBuilt(built.filter((_, j) => j !== i)); setWrong(false); }}
            className="min-h-11 rounded-[12px] bg-brand px-3 font-bold text-white">{round.words[w]}</button>
        ))}
        {built.length === 0 ? <span className="self-center text-sm text-muted">Tap the words below in the right order.</span> : null}
      </div>
      <div className="flex flex-wrap gap-2" data-testid="scramble-pool">
        {round.order.filter((w) => !built.includes(w)).map((w) => (
          <button key={w} type="button" onClick={() => { setBuilt([...built, w]); setWrong(false); }}
            className="min-h-11 rounded-[12px] border-2 border-line bg-surface px-3 font-bold">{round.words[w]}</button>
        ))}
      </div>
      {wrong ? <p role="alert" className="font-bold text-danger">Not quite. Tap a word in your sentence to take it back.</p> : null}
      <button type="button" onClick={check} disabled={built.length !== round.words.length}
        className="min-h-12 self-start rounded-full bg-gold px-6 font-extrabold text-ink disabled:opacity-50">Check</button>
    </section>
  );
}

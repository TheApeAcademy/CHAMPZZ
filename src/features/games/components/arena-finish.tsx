"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { finishArena } from "@/features/games/server/actions";
import type { ArenaGame } from "@/features/games/meta";

/** End-of-game panel: reports the play once and shows the Champ Points it earned. */
export function ArenaFinish({ slug, game, score, message, onAgain }: { slug: string; game: ArenaGame; score: number; message: string; onAgain: () => void }) {
  const [result, setResult] = useState<string>("Saving...");
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    finishArena(game, score)
      .then((r) => setResult("error" in r ? r.error : r.points ? `+${r.points} Champ Points!` : "You already earned today's points for this game. Play for fun!"))
      .catch(() => setResult("Could not save, but great playing!"));
  }, [game, score]);
  return (
    <section className="flex flex-col items-center gap-3 rounded-[28px] bg-ink p-6 text-center text-cream" data-testid="arena-done">
      <p className="text-sm font-extrabold uppercase tracking-widest text-gold">{message}</p>
      <p className="font-display text-5xl font-black" data-testid="arena-score">{score}</p>
      <p role="status" className="font-bold text-gold" data-testid="arena-points">{result}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onAgain} className="min-h-12 rounded-full bg-gold px-6 font-extrabold text-ink">Play again</button>
        <Link href={`/k/${slug}/games`} className="min-h-12 rounded-full border-2 border-cream px-6 py-2.5 font-extrabold">All games</Link>
      </div>
    </section>
  );
}

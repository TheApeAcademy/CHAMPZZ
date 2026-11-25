"use client";
import { useState } from "react";
import { ArenaFinish } from "@/features/games/components/arena-finish";
import { buildWhoAmI, type WhoItem, type WhoRound } from "./build";

export function WhoAmI({ slug, items, initial }: { slug: string; items: WhoItem[]; initial: WhoRound[] }) {
  const [rounds, setRounds] = useState(initial);
  const [r, setR] = useState(0);
  const [shown, setShown] = useState(1);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const round = rounds[r];

  const again = () => { setRounds(buildWhoAmI(items)); setR(0); setShown(1); setPicked(null); setScore(0); setDone(false); };
  if (done || !round) return <ArenaFinish slug={slug} game="whoami" score={score} message="Mystery solved!" onAgain={again} />;

  const pick = (o: string) => {
    if (picked) return;
    setPicked(o);
    if (o === round.answer) setScore((s) => s + Math.max(10, 40 - shown * 10));
  };
  const nextRound = () => {
    if (r + 1 >= rounds.length) setDone(true);
    else { setR(r + 1); setShown(1); setPicked(null); }
  };

  return (
    <section className="flex flex-col gap-4" data-testid="whoami">
      <p className="text-sm font-bold text-muted">Round {r + 1} of {rounds.length} · Score {score}</p>
      <ol className="flex flex-col gap-2">
        {round.clues.slice(0, shown).map((c, i) => <li key={i} className="rounded-[16px] bg-surface p-3 font-bold">Clue {i + 1}: {c}</li>)}
      </ol>
      {!picked && shown < round.clues.length ? (
        <button type="button" onClick={() => setShown(shown + 1)} className="min-h-11 self-start rounded-full border-2 border-ink px-4 text-sm font-extrabold">Another clue (fewer points)</button>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {round.options.map((o) => (
          <button key={o} type="button" onClick={() => pick(o)} disabled={Boolean(picked)}
            className={`min-h-14 rounded-[16px] px-3 font-extrabold ${picked && o === round.answer ? "bg-[#1E8F5A] text-white" : picked === o ? "bg-coral text-ink" : "bg-brand text-white"}`}>{o}</button>
        ))}
      </div>
      {picked ? (
        <div className="flex flex-col gap-2">
          <p role="status" className="font-extrabold">{picked === round.answer ? "You got it!" : `It was ${round.answer}.`}</p>
          <button type="button" onClick={nextRound} className="min-h-12 self-start rounded-full bg-gold px-6 font-extrabold text-ink">{r + 1 >= rounds.length ? "Finish" : "Next"}</button>
        </div>
      ) : null}
    </section>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { TIERS } from "@/features/games/meta";
import { trainingAnswer, trainingHalfTime, trainingState, type TrainingResult, type TrainingState } from "@/features/games/server/actions";

const CLOCK = 20;
const LETTERS = ["A", "B", "C", "D"];

/** Training Ground: one question at a time, checked by the server, never sent with its answer. */
export function Training({ slug, runId, initial }: { slug: string; runId: string; initial: TrainingState }) {
  const [s, setS] = useState(initial);
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [hidden, setHidden] = useState<number[]>([]);
  const [left, setLeft] = useState(CLOCK);
  const [pending, start] = useTransition();

  const answer = (choice: number) => {
    if (result || pending) return;
    setPicked(choice);
    start(async () => {
      const r = await trainingAnswer(runId, choice);
      if (r) setResult(r);
    });
  };

  useEffect(() => {
    if (s.finished || result || pending) return;
    const t = setTimeout(() => {
      if (left <= 1) answer(-1);
      setLeft((x) => x - 1);
    }, 1000);
    return () => clearTimeout(t);
  });

  const next = () => start(async () => {
    const ns = await trainingState(runId);
    if (ns) { setS(ns); setResult(null); setPicked(null); setHidden([]); setLeft(CLOCK); }
  });

  const halfTime = () => start(async () => {
    const h = await trainingHalfTime(runId);
    setHidden(h);
    setS((x) => ({ ...x, half_time_available: false }));
  });

  if (s.finished || (result?.finished && !s.question)) {
    const correct = result?.correct_total ?? s.correct;
    return (
      <section className="flex flex-col items-center gap-3 rounded-[28px] bg-ink p-6 text-center text-cream" data-testid="training-done">
        <p className="text-sm font-extrabold uppercase tracking-widest text-gold">Training complete</p>
        <p className="font-display text-5xl font-black" data-testid="training-score">{correct}/{s.total}</p>
        <p className="text-lg font-bold">{correct === s.total ? "Perfect round. Champ level!" : correct >= s.total / 2 ? "Great work! Keep training." : "Every champ was once a beginner. Go again!"}</p>
        {result ? <p className="font-bold text-gold" data-testid="training-points">{result.points ? `+${result.points} Champ Points` : "Champ Points for Training are once a day. Come back tomorrow!"}</p> : null}
        <Link href={`/k/${slug}/road`} className="min-h-12 rounded-full bg-gold px-6 py-3 font-extrabold text-ink">Play again</Link>
      </section>
    );
  }

  const q = s.question!;
  const tier = TIERS[q.tier - 1]!;
  return (
    <section className="flex flex-col gap-4 rounded-[28px] bg-ink p-5 text-cream" data-testid="training">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-extrabold uppercase tracking-widest text-gold">{tier.name}</p>
        <p className="text-sm font-bold">Question {s.index + 1} of {s.total}</p>
        <p className={`min-w-12 rounded-full px-3 py-1 text-center font-display text-xl font-black ${left <= 5 ? "bg-coral text-ink" : "bg-[#1C2340]"}`}>{Math.max(0, left)}</p>
      </div>
      <h1 className="text-xl font-extrabold" data-testid="training-question">{q.prompt}</h1>
      <div className="flex flex-col gap-2">
        {q.choices.map((c, i) => {
          const right = result && i === result.answer_index;
          const wrong = result && i === picked && !result.correct;
          return (
            <button key={i} type="button" disabled={Boolean(result) || pending || hidden.includes(i)} onClick={() => answer(i)} data-testid={`tchoice-${i}`}
              className={`flex min-h-14 items-center gap-3 rounded-[16px] border-2 px-4 text-left font-bold ${hidden.includes(i) ? "invisible" : ""} ${right ? "border-[#1E8F5A] bg-[#1E8F5A] text-white" : wrong ? "border-coral bg-coral text-ink" : "border-[#3A4470] bg-[#1C2340]"}`}>
              <span className="font-display font-black text-gold">{LETTERS[i]}</span>{c}
            </button>
          );
        })}
      </div>
      {result ? (
        <div className="flex flex-col gap-2 rounded-[16px] bg-[#1C2340] p-4" data-testid="training-feedback">
          <p className="text-lg font-extrabold">{result.correct ? "Yes! That's right." : picked === -1 ? "Time's up!" : "Not quite."}</p>
          {result.explanation ? <p className="text-sm">{result.explanation}</p> : null}
          <button type="button" onClick={next} disabled={pending} className="min-h-12 self-start rounded-full bg-gold px-6 font-extrabold text-ink">{result.finished ? "See my score" : "Next"}</button>
        </div>
      ) : s.half_time_available ? (
        <button type="button" onClick={halfTime} disabled={pending} className="min-h-11 self-start rounded-full border-2 border-gold px-4 text-sm font-extrabold text-gold">Half Time (once a round)</button>
      ) : null}
    </section>
  );
}

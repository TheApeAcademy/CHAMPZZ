"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TIERS } from "@/features/games/meta";
import { saveMatch } from "@/features/games/server/actions";
import { queueMatch } from "./pending-uploads";

export type HostQuestion = { id: string; tier: number; prompt: string; choices: string[]; answer_index: number; explanation: string | null };
type Power = { half: boolean; squad: boolean; coach: boolean };
const LETTERS = ["A", "B", "C", "D"];

/**
 * Road to Champ on one big screen. Everything runs in the browser, so a match
 * keeps going if the internet drops; the result is saved (or queued) at the end.
 */
export function HostGame({ slug, pack, questions, teams, clock }: {
  slug: string; pack: { id: string; name: string }; questions: HostQuestion[]; teams: string[]; clock: number;
}) {
  const pools = useMemo(() => TIERS.map((t) => questions.filter((q) => q.tier === t.tier)), [questions]);
  const used = useRef(new Set<string>());
  const draw = useCallback((tierIdx: number): HostQuestion | null => {
    // this tier first, then the nearest tiers, so a small pack still plays
    const order = [0, 1, -1, 2, -2, 3, -3, 4, -4].map((d) => tierIdx + d).filter((i) => i >= 0 && i < 5);
    for (const i of order) {
      const q = pools[i]!.find((x) => !used.current.has(x.id));
      if (q) { used.current.add(q.id); return q; }
    }
    return null;
  }, [pools]);

  const [phase, setPhase] = useState<"rules" | "play" | "results">("rules");
  const [turn, setTurn] = useState({ tier: 0, team: 0 });
  const [q, setQ] = useState<HostQuestion | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hidden, setHidden] = useState<number[]>([]);
  const [left, setLeft] = useState(clock);
  const [scores, setScores] = useState<number[]>(() => teams.map(() => 0));
  const [power, setPower] = useState<Power[]>(() => teams.map(() => ({ half: false, squad: false, coach: false })));
  const [played, setPlayed] = useState(0);
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "queued">("idle");
  const saved = useRef(false);

  const tier = TIERS[turn.tier]!;
  const begin = (tierIdx: number) => {
    const next = draw(tierIdx);
    setQ(next); setPicked(null); setRevealed(false); setHidden([]); setLeft(clock);
    if (!next) setPhase("results");
  };

  const reveal = useCallback((choice: number | null) => {
    if (!q || revealed) return;
    setPicked(choice); setRevealed(true); setPlayed((n) => n + 1);
    if (choice === q.answer_index) setScores((s) => s.map((v, i) => (i === turn.team ? v + tier.points : v)));
  }, [q, revealed, turn.team, tier.points]);

  // the Shot Clock
  useEffect(() => {
    if (phase !== "play" || revealed || clock === 0 || !q) return;
    const t = setTimeout(() => {
      if (left <= 1) reveal(null);
      setLeft((s) => s - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [phase, revealed, left, clock, q, reveal]);

  const next = () => {
    let { tier: t, team } = turn;
    team += 1;
    if (team >= teams.length) { team = 0; t += 1; }
    if (t >= TIERS.length) { setPhase("results"); return; }
    setTurn({ tier: t, team });
    begin(t);
  };

  // keys 1 to 4 (or A to D) answer for the team, Enter moves on
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      const i = "1234".indexOf(e.key) >= 0 ? "1234".indexOf(e.key) : "abcd".indexOf(e.key.toLowerCase());
      if (!revealed && i >= 0 && !hidden.includes(i)) reveal(i);
      else if (revealed && e.key === "Enter") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const applyPower = (kind: keyof Power) => {
    if (!q || revealed || power[turn.team]![kind]) return;
    setPower((p) => p.map((x, i) => (i === turn.team ? { ...x, [kind]: true } : x)));
    if (kind === "half") {
      const wrong = [0, 1, 2, 3].filter((i) => i !== q.answer_index);
      const keep = wrong[(q.prompt.length + played) % 3]!;
      setHidden(wrong.filter((i) => i !== keep));
    } else if (kind === "squad") {
      setLeft((s) => s + 15);
    } else {
      const swap = draw(turn.tier);
      if (swap) { setQ(swap); setHidden([]); setLeft(clock); }
    }
  };

  // save once at the end, or keep it on this device until we are back online
  useEffect(() => {
    if (phase !== "results" || saved.current) return;
    saved.current = true;
    const payload = {
      packId: pack.id, teams: teams.map((name, i) => ({ name, score: scores[i]! })), questions: played,
      clientId: crypto.randomUUID(), playedAt: new Date().toISOString(),
    };
    setSave("saving");
    saveMatch(slug, payload)
      .then((r) => { if (r.ok) setSave("saved"); else { queueMatch(slug, payload); setSave("queued"); } })
      .catch(() => { queueMatch(slug, payload); setSave("queued"); });
  }, [phase, pack.id, teams, scores, played, slug]);

  if (phase === "rules") {
    return (
      <section className="flex flex-col gap-5 rounded-[28px] bg-ink p-6 text-cream sm:p-10" data-testid="quiz-rules">
        <p className="text-sm font-extrabold uppercase tracking-widest text-gold">Road to Champ · {pack.name}</p>
        <h1 className="font-display text-4xl font-black italic uppercase sm:text-5xl">Ground rules</h1>
        <ol className="flex list-decimal flex-col gap-2 pl-6 text-lg">
          <li>Teams take turns. Each team gets one question at every level, from Rookie up to Champ.</li>
          <li>Right answers score: {TIERS.map((t) => `${t.name} ${t.points}`).join(", ")}.</li>
          <li>{clock ? `The Shot Clock gives you ${clock} seconds. When it hits zero, the turn is over.` : "There is no Shot Clock this game. Take your time!"}</li>
          <li>Each team has three power-ups, once each: <strong>Half Time</strong> takes away two wrong answers, <strong>Ask the Squad</strong> adds 15 seconds to talk it over, <strong>Coach&apos;s Call</strong> swaps the question for a new one.</li>
          <li>Cheer for every team. Champs play fair!</li>
        </ol>
        <p className="font-bold">Teams: {teams.join(", ")}</p>
        <button type="button" onClick={() => { setPhase("play"); begin(0); }} className="min-h-14 self-start rounded-full bg-gold px-8 text-xl font-extrabold text-ink">Let&apos;s play!</button>
      </section>
    );
  }

  if (phase === "results") {
    const ranked = teams.map((name, i) => ({ name, score: scores[i]! })).sort((a, b) => b.score - a.score);
    const top = ranked[0]!.score;
    const winners = ranked.filter((r) => r.score === top).map((r) => r.name);
    return (
      <section className="flex flex-col gap-5 rounded-[28px] bg-ink p-6 text-cream sm:p-10" data-testid="quiz-results">
        <p className="text-sm font-extrabold uppercase tracking-widest text-gold">Final whistle</p>
        <h1 className="font-display text-4xl font-black italic uppercase sm:text-5xl" data-testid="quiz-winner">
          {top === 0 ? "Great effort, everyone!" : winners.length > 1 ? `It's a tie: ${winners.join(" and ")}!` : `${winners[0]} are the Champs!`}
        </h1>
        <ol className="flex flex-col gap-2">
          {ranked.map((r, i) => (
            <li key={r.name} className={`flex items-center justify-between rounded-[16px] px-5 py-3 text-xl font-extrabold ${i === 0 && top > 0 ? "bg-gold text-ink" : "bg-[#1C2340]"}`}>
              <span>{i + 1}. {r.name}</span><span data-testid={`final-${r.name}`}>{r.score.toLocaleString("en-GB")}</span>
            </li>
          ))}
        </ol>
        <p role="status" className="font-bold" data-testid="save-status">
          {save === "saving" ? "Saving the result..." : save === "saved" ? "Result saved to your match history." : save === "queued" ? "No internet right now. The result is saved on this device and will upload next time you open Road to Champ." : ""}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/o/${slug}/quiz`} className="min-h-12 rounded-full bg-gold px-6 py-3 font-extrabold text-ink">Back to Road to Champ</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4" data-testid="quiz-play">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${teams.length}, minmax(0, 1fr))` }}>
        {teams.map((name, i) => (
          <div key={name} className={`rounded-[16px] p-3 text-center ${i === turn.team ? "bg-brand text-white ring-4 ring-gold" : "bg-surface"}`}>
            <p className="truncate font-extrabold">{name}</p>
            <p className="font-display text-2xl font-black" data-testid={`score-${name}`}>{scores[i]!.toLocaleString("en-GB")}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 rounded-[28px] bg-ink p-5 text-cream sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-extrabold uppercase tracking-widest text-gold" data-testid="quiz-tier">{tier.name} · {tier.points} points</p>
          <p className="font-bold">{teams[turn.team]}&apos;s turn</p>
          {clock ? (
            <p aria-live="off" className={`min-w-16 rounded-full px-3 py-1 text-center font-display text-2xl font-black ${left <= 5 ? "bg-coral text-ink" : "bg-[#1C2340]"}`} data-testid="shot-clock">{Math.max(0, left)}</p>
          ) : null}
        </div>
        <h2 className="text-2xl font-extrabold sm:text-3xl" data-testid="quiz-question">{q?.prompt}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {q?.choices.map((c, i) => {
            const gone = hidden.includes(i);
            const right = revealed && i === q.answer_index;
            const wrong = revealed && i === picked && i !== q.answer_index;
            return (
              <button key={i} type="button" disabled={revealed || gone} onClick={() => reveal(i)} data-testid={`choice-${i}`}
                className={`flex min-h-16 items-center gap-3 rounded-[18px] border-2 px-4 text-left text-lg font-bold ${gone ? "invisible" : ""} ${right ? "border-[#1E8F5A] bg-[#1E8F5A] text-white" : wrong ? "border-coral bg-coral text-ink" : "border-[#3A4470] bg-[#1C2340]"}`}>
                <span className="font-display text-xl font-black text-gold">{LETTERS[i]}</span>{c}
              </button>
            );
          })}
        </div>
        {revealed && q ? (
          <div className="flex flex-col gap-3 rounded-[18px] bg-[#1C2340] p-4" data-testid="quiz-reveal">
            <p className="text-xl font-extrabold">{picked === q.answer_index ? `Yes! +${tier.points} for ${teams[turn.team]}` : picked === null ? "Time! The Shot Clock beat you." : "Not this time."} The answer is {LETTERS[q.answer_index]}: {q.choices[q.answer_index]}.</p>
            {q.explanation ? <p>{q.explanation}</p> : null}
            <button type="button" onClick={next} className="min-h-12 self-start rounded-full bg-gold px-6 font-extrabold text-ink">Next question</button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2" aria-label="Power-ups">
            {([["half", "Half Time"], ["squad", "Ask the Squad"], ["coach", "Coach's Call"]] as const).map(([k, label]) => (
              <button key={k} type="button" onClick={() => applyPower(k)} disabled={power[turn.team]![k] || (k === "squad" && !clock)}
                className="min-h-11 rounded-full border-2 border-gold px-4 text-sm font-extrabold text-gold disabled:border-[#3A4470] disabled:text-[#7A82A8]">{label}</button>
            ))}
          </div>
        )}
      </div>
      <p className="text-center text-xs text-muted">Host tip: press 1 to 4 to answer for the team, and Enter for the next question.</p>
    </section>
  );
}

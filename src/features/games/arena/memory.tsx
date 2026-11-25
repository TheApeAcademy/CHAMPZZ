"use client";
import { useState } from "react";
import { PictureIcon, PICTURES } from "@/features/kids/components/picture-pin";
import { ArenaFinish } from "@/features/games/components/arena-finish";
import { buildMemory } from "./build";

export function Memory({ slug, initial }: { slug: string; initial: number[] }) {
  const [cards, setCards] = useState(initial);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const done = found.length === cards.length;

  const again = () => { setCards(buildMemory()); setOpen([]); setFound([]); setMoves(0); setBusy(false); };
  if (done) return <ArenaFinish slug={slug} game="memory" score={Math.max(10, 200 - Math.max(0, moves - 6) * 10)} message={`All pairs in ${moves} moves!`} onAgain={again} />;

  const flip = (i: number) => {
    if (busy || open.includes(i) || found.includes(i)) return;
    const now = [...open, i];
    setOpen(now);
    if (now.length === 2) {
      setMoves((m) => m + 1);
      if (cards[now[0]!] === cards[now[1]!]) { setFound([...found, ...now]); setOpen([]); }
      else { setBusy(true); setTimeout(() => { setOpen([]); setBusy(false); }, 800); }
    }
  };

  return (
    <section className="flex flex-col gap-3" data-testid="memory">
      <p className="text-sm font-bold text-muted">Moves: {moves} · Pairs: {found.length / 2} of 6</p>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c, i) => {
          const shown = open.includes(i) || found.includes(i);
          return (
            <button key={i} type="button" onClick={() => flip(i)} data-testid={`card-${i}`} data-icon={c}
              aria-label={shown ? PICTURES[c]!.name : `Card ${i + 1}, face down`}
              className={`flex aspect-square items-center justify-center rounded-[16px] ${found.includes(i) ? "bg-[#E8F5EE]" : shown ? "bg-surface" : "bg-brand"}`}>
              {shown ? <PictureIcon index={c} size={40} /> : <span className="font-display text-2xl font-black text-white">?</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

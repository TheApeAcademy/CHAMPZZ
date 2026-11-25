"use client";
import { useState } from "react";
import { ArenaFinish } from "@/features/games/components/arena-finish";
import { buildJigsaw, type JigsawImage } from "./build";

export function Jigsaw({ slug, images, initial }: { slug: string; images: JigsawImage[]; initial: { image: JigsawImage; order: number[] } }) {
  const [p, setP] = useState(initial);
  const [sel, setSel] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const solved = p.order.every((v, i) => v === i);

  const again = () => { setP(buildJigsaw(images)); setSel(null); setMoves(0); };
  if (solved) return <ArenaFinish slug={slug} game="jigsaw" score={Math.max(10, 150 - moves * 5)} message={`Picture fixed in ${moves} swaps!`} onAgain={again} />;

  const tap = (i: number) => {
    if (sel === null) { setSel(i); return; }
    if (sel !== i) {
      const o = [...p.order];
      [o[sel], o[i]] = [o[i]!, o[sel]!];
      setP({ ...p, order: o });
      setMoves((m) => m + 1);
    }
    setSel(null);
  };

  return (
    <section className="flex flex-col gap-3" data-testid="jigsaw">
      <p className="text-sm font-bold text-muted">Tap two tiles to swap them. Swaps: {moves}</p>
      <div className="mx-auto grid w-full max-w-sm grid-cols-3 gap-0.5 rounded-[12px] bg-ink p-0.5" style={{ aspectRatio: `${p.image.w} / ${p.image.h}` }}
        role="group" aria-label={`Jigsaw of ${p.image.alt}`}>
        {p.order.map((tile, i) => (
          <button key={i} type="button" onClick={() => tap(i)} data-tile={tile} aria-label={`Tile ${i + 1}${sel === i ? ", selected" : ""}`}
            className={`${sel === i ? "outline outline-4 outline-gold" : ""}`}
            style={{ backgroundImage: `url(${p.image.src})`, backgroundSize: "300% 300%", backgroundPosition: `${(tile % 3) * 50}% ${Math.floor(tile / 3) * 50}%` }} />
        ))}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.image.src} alt="" className="mx-auto h-20 w-auto rounded-[8px] opacity-80" aria-hidden="true" />
    </section>
  );
}

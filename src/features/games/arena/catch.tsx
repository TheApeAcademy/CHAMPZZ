"use client";
import { useEffect, useRef, useState } from "react";
import { ArenaFinish } from "@/features/games/components/arena-finish";

type Item = { x: number; y: number; v: number; good: boolean; hue: number };
const W = 360, H = 480, CATCHER = 76, SECONDS = 30;
const HUES = ["#F2B33D", "#FF5A3C", "#2F5BFF", "#1E8F5A"];

/**
 * Ark Catch (faith mode) or Star Catch: move along the bottom and catch the
 * good things, dodge the storm clouds. Pointer, touch or arrow keys.
 */
export function Catch({ slug, faith }: { slug: string; faith: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"ready" | "play" | "done">("ready");
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(SECONDS);

  useEffect(() => {
    if (phase !== "play") return;
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const st = { x: W / 2, items: [] as Item[], score: 0, last: performance.now(), spawn: 0, end: performance.now() + SECONDS * 1000, keys: new Set<string>() };
    let raf = 0;

    const toCanvasX = (clientX: number) => {
      const r = c.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * W;
    };
    const onMove = (e: PointerEvent) => { st.x = Math.max(CATCHER / 2, Math.min(W - CATCHER / 2, toCanvasX(e.clientX))); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); if (e.type === "keydown") st.keys.add(e.key); else st.keys.delete(e.key); }
    };
    c.addEventListener("pointermove", onMove);
    c.addEventListener("pointerdown", onMove);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);

    const star = (x: number, y: number, r: number, fill: string) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    };
    const critter = (x: number, y: number, fill: string) => {
      ctx.fillStyle = fill;
      ctx.beginPath(); ctx.arc(x - 9, y - 11, 6, 0, Math.PI * 2); ctx.arc(x + 9, y - 11, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0B1026";
      ctx.beginPath(); ctx.arc(x - 5, y - 2, 2.2, 0, Math.PI * 2); ctx.arc(x + 5, y - 2, 2.2, 0, Math.PI * 2); ctx.fill();
    };
    const cloud = (x: number, y: number) => {
      ctx.fillStyle = "#4D5172";
      ctx.beginPath(); ctx.arc(x - 10, y, 10, 0, Math.PI * 2); ctx.arc(x + 4, y - 6, 13, 0, Math.PI * 2); ctx.arc(x + 14, y + 2, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#F2B33D"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x + 2, y + 10); ctx.lineTo(x - 4, y + 20); ctx.lineTo(x + 4, y + 20); ctx.lineTo(x - 2, y + 30); ctx.stroke();
    };
    const catcher = (x: number) => {
      const y = H - 34;
      if (faith) {
        ctx.fillStyle = "#8A5A2B";
        ctx.beginPath(); ctx.moveTo(x - CATCHER / 2, y); ctx.lineTo(x + CATCHER / 2, y); ctx.lineTo(x + CATCHER / 2 - 12, y + 24); ctx.lineTo(x - CATCHER / 2 + 12, y + 24); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#C08A50"; ctx.fillRect(x - 16, y - 16, 32, 16);
      } else {
        ctx.fillStyle = "#2F5BFF";
        ctx.beginPath(); ctx.roundRect(x - CATCHER / 2, y, CATCHER, 22, 8); ctx.fill();
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(50, now - st.last); st.last = now;
      if (st.keys.has("ArrowLeft")) st.x = Math.max(CATCHER / 2, st.x - dt * 0.4);
      if (st.keys.has("ArrowRight")) st.x = Math.min(W - CATCHER / 2, st.x + dt * 0.4);
      const remaining = Math.max(0, st.end - now);
      st.spawn -= dt;
      if (st.spawn <= 0) {
        const speed = 0.12 + (1 - remaining / (SECONDS * 1000)) * 0.12;
        st.items.push({ x: 20 + Math.random() * (W - 40), y: -20, v: speed + Math.random() * 0.05, good: Math.random() < 0.72, hue: Math.floor(Math.random() * HUES.length) });
        st.spawn = 650;
      }
      for (const it of st.items) it.y += it.v * dt;
      st.items = st.items.filter((it) => {
        if (it.y > H - 40 && it.y < H - 10 && Math.abs(it.x - st.x) < CATCHER / 2 + 10) {
          st.score = Math.max(0, st.score + (it.good ? 10 : -5));
          return false;
        }
        return it.y < H + 30;
      });
      ctx.fillStyle = faith ? "#DDE9FF" : "#0B1026"; ctx.fillRect(0, 0, W, H);
      for (const it of st.items) {
        if (!it.good) cloud(it.x, it.y);
        else if (faith) critter(it.x, it.y, HUES[it.hue]!);
        else star(it.x, it.y, 14, HUES[it.hue]!);
      }
      catcher(st.x);
      setScore(st.score);
      setLeft(Math.ceil(remaining / 1000));
      if (remaining <= 0) { setPhase("done"); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      c.removeEventListener("pointermove", onMove); c.removeEventListener("pointerdown", onMove);
      window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKey);
    };
  }, [phase, faith]);

  if (phase === "done") {
    return <ArenaFinish slug={slug} game="catch" score={score} message={faith ? "The ark is full!" : "Stars caught!"} onAgain={() => { setScore(0); setLeft(SECONDS); setPhase("play"); }} />;
  }
  return (
    <section className="flex flex-col items-center gap-3" data-testid="catch">
      <div className="flex w-full max-w-sm justify-between text-sm font-extrabold"><span>Score {score}</span><span>{left}s</span></div>
      <canvas ref={canvas} width={W} height={H} className="w-full max-w-sm touch-none rounded-[20px] bg-ink"
        aria-label={faith ? "Ark Catch: move the ark to catch the animals and dodge the storm clouds" : "Star Catch: move the tray to catch the stars and dodge the storm clouds"} />
      {phase === "ready" ? (
        <button type="button" onClick={() => setPhase("play")} className="min-h-12 rounded-full bg-gold px-8 font-extrabold text-ink">Start</button>
      ) : <p className="text-xs text-muted">Slide your finger, move your mouse, or use the arrow keys.</p>}
    </section>
  );
}

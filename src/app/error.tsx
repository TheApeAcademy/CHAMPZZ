"use client";
import Link from "next/link";
import { useEffect } from "react";

/** Friendly fallback when a page fails. Never shows technical details to families. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-xl flex-col items-start justify-center gap-5 px-5 py-12">
      <h1 className="cz-display text-[clamp(52px,15vw,88px)]">Oops, a wobble</h1>
      <p className="text-lg text-muted">Something went wrong on our side. Please try again. If it keeps happening, tell your club leader.</p>
      {error.digest ? <p className="text-sm text-muted">Reference: <span className="font-mono">{error.digest}</span></p> : null}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="inline-flex min-h-[60px] items-center justify-center rounded-full border-[2.5px] border-ink bg-gold px-6 text-[19px] font-black text-ink shadow-[0_6px_0_var(--ink)]">Try again</button>
        <Link href="/" className="inline-flex min-h-[60px] items-center justify-center rounded-full border-[2.5px] border-ink bg-[#FFFDF7] px-6 text-[19px] font-black text-ink shadow-[0_5px_0_var(--ink)]">Go home</Link>
      </div>
    </main>
  );
}

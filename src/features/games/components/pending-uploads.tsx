"use client";
import { useEffect, useState } from "react";
import { saveMatch, type MatchPayload } from "@/features/games/server/actions";

const KEY = "champzz:pending-matches";
type Pending = { slug: string; payload: MatchPayload };

export function readPending(): Pending[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Pending[]; } catch { return []; }
}
export function writePending(items: Pending[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage blocked: nothing more we can do */ }
}
export function queueMatch(slug: string, payload: MatchPayload) {
  writePending([...readPending().filter((p) => p.payload.clientId !== payload.clientId), { slug, payload }]);
}

/** Uploads Road to Champ results that were saved on this device while offline. */
export function PendingUploads({ slug }: { slug: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    const mine = readPending().filter((p) => p.slug === slug);
    if (mine.length === 0) return;
    let cancelled = false;
    (async () => {
      let done = 0;
      for (const p of mine) {
        try {
          const r = await saveMatch(slug, p.payload);
          if (r.ok) { done++; writePending(readPending().filter((x) => x.payload.clientId !== p.payload.clientId)); }
        } catch { /* still offline */ }
      }
      if (!cancelled) setMsg(done ? `Uploaded ${done} match result${done === 1 ? "" : "s"} saved while offline.` : `${mine.length} match result${mine.length === 1 ? " is" : "s are"} waiting on this device. They will upload when you are back online.`);
    })();
    return () => { cancelled = true; };
  }, [slug]);
  return msg ? <p role="status" className="rounded-[12px] bg-[#DDE5FF] p-3 text-sm font-bold text-[#1A2C80]">{msg}</p> : null;
}

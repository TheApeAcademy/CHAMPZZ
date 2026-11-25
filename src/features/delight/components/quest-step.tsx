"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeStep } from "@/features/delight/server/actions";

export function QuestStep({ stepId, prompt, choices }: { stepId: string; prompt: string; choices: string[] }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const pick = (i: number) => start(async () => {
    const r = await completeStep(stepId, i);
    if ("error" in r) setMsg(r.error);
    else if (r.correct) { setMsg(r.points ? `Checkpoint passed! +${r.points} Champ Points` : "Checkpoint passed!"); router.refresh(); }
    else setMsg("Not quite. Read the story again and have another go!");
  });
  return (
    <div className="flex flex-col gap-2 rounded-[16px] border-2 border-dashed border-gold p-4" data-testid="checkpoint">
      <p className="font-extrabold">Checkpoint: {prompt}</p>
      {choices.map((c, i) => (
        <button key={i} type="button" disabled={pending} onClick={() => pick(i)} className="min-h-12 rounded-[14px] bg-brand px-4 text-left font-bold text-white">{c}</button>
      ))}
      {msg ? <p role="status" className="font-bold">{msg}</p> : null}
    </div>
  );
}

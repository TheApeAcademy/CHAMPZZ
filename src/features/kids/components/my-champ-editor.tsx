"use client";
import { useActionState, useState } from "react";
import { ChampAvatar } from "./champ-avatar";
import { EXTRAS, HAIRS, HAIR_COLORS, OUTFITS, SKINS, type AvatarConfig } from "@/features/kids/avatar";
import { Banner } from "@/components/ui/primitives";
import type { ActionState } from "@/components/ui/action-form";

function Swatches({ label, colors, value, onPick }: { label: string; colors: string[]; value: number; onPick: (i: number) => void }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 font-extrabold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {colors.map((c, i) => (
          <button key={c} type="button" aria-label={`${label} ${i + 1}`} aria-pressed={value === i} onClick={() => onPick(i)}
            className={`h-11 w-11 rounded-full border-[3px] ${value === i ? "border-ink" : "border-transparent"}`} style={{ background: c }} />
        ))}
      </div>
    </fieldset>
  );
}

export function MyChampEditor({ initial, levelSort, action }: { initial: AvatarConfig; levelSort: number; action: (prev: ActionState, data: FormData) => Promise<ActionState> }) {
  const [a, setA] = useState<AvatarConfig>(initial);
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.error ? <Banner tone="error">{state.error}</Banner> : null}
      {state?.ok ? <Banner tone="ok">{state.ok}</Banner> : null}
      <div className="flex justify-center rounded-[28px] bg-surface p-4"><ChampAvatar a={a} level={levelSort} size={160} label="Your Champ" /></div>
      {(["skin", "hair", "hairColor", "outfit", "extra"] as const).map((k) => <input key={k} type="hidden" name={k} value={String(a[k])} />)}
      <Swatches label="Skin" colors={SKINS} value={a.skin} onPick={(i) => setA({ ...a, skin: i })} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-extrabold">Hair</legend>
        <div className="flex flex-wrap gap-2">
          {HAIRS.map((h, i) => (
            <button key={h} type="button" aria-pressed={a.hair === i} onClick={() => setA({ ...a, hair: i })}
              className={`min-h-11 rounded-full px-4 text-sm font-extrabold ${a.hair === i ? "bg-ink text-white" : "bg-surface"}`}>{h}</button>
          ))}
        </div>
      </fieldset>
      <Swatches label="Hair colour" colors={HAIR_COLORS} value={a.hairColor} onPick={(i) => setA({ ...a, hairColor: i })} />
      <Swatches label="Outfit" colors={OUTFITS} value={a.outfit} onPick={(i) => setA({ ...a, outfit: i })} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-extrabold">Extras</legend>
        <div className="flex flex-wrap gap-2">
          {EXTRAS.map((e) => {
            const locked = e.level > levelSort;
            return (
              <button key={e.key} type="button" disabled={locked} aria-pressed={a.extra === e.key} onClick={() => setA({ ...a, extra: e.key })}
                className={`min-h-11 rounded-full px-4 text-sm font-extrabold disabled:opacity-60 ${a.extra === e.key ? "bg-ink text-white" : "bg-surface"}`}>
                {e.name}{locked ? ` (unlocks at ${e.levelName})` : ""}
              </button>
            );
          })}
        </div>
      </fieldset>
      <button type="submit" disabled={pending} className="min-h-12 rounded-[16px] bg-brand font-extrabold text-white disabled:opacity-50">{pending ? "Saving..." : "Save my Champ"}</button>
    </form>
  );
}

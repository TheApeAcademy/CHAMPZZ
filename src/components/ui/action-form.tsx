"use client";
import { useActionState, type ReactNode } from "react";
import { Banner } from "./primitives";

export type ActionState = { error?: string; ok?: string; value?: string; valueLabel?: string } | null;

/** A form bound to a server action that reports a friendly error or success line. */
export function ActionForm({
  action,
  children,
  className = "flex flex-col gap-4",
}: {
  action: (prev: ActionState, data: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {state?.error ? <Banner tone="error">{state.error}</Banner> : null}
      {state?.ok ? <Banner tone="ok">{state.ok}</Banner> : null}
      {state?.value ? (
        <label className="flex flex-col gap-1.5 text-sm font-bold">{state.valueLabel ?? "Copy this"}
          <input readOnly value={state.value} data-testid="action-value" onFocus={(e) => e.currentTarget.select()}
            className="min-h-11 rounded-[12px] border border-line bg-cream px-3 font-mono text-sm" />
        </label>
      ) : null}
      {children}
    </form>
  );
}

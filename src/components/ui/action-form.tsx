"use client";
import { useActionState, type ReactNode } from "react";
import { Banner } from "./primitives";

export type ActionState = { error?: string; ok?: string; value?: string; valueLabel?: string } | null;

/**
 * A form bound to a server action that reports a friendly error or success line.
 * With `okPanel`, a success replaces the form with that panel (the success line
 * is shown inside it), e.g. the "Check your inbox" card after sign-up.
 */
export function ActionForm({
  action,
  children,
  className = "flex flex-col gap-4",
  okPanel,
}: {
  action: (prev: ActionState, data: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  okPanel?: { title: string; art?: ReactNode; footer?: ReactNode };
}) {
  const [state, formAction] = useActionState(action, null);
  if (state?.ok && okPanel) {
    return (
      <div className="flex flex-col gap-4 rounded-[32px] border-4 border-ink bg-[#FFFDF7] p-6 shadow-[0_10px_0_var(--ink)] sm:p-8">
        {okPanel.art}
        <h2 className="cz-display text-[clamp(40px,11vw,60px)]">{okPanel.title}</h2>
        <p role="status" className="text-lg font-bold">{state.ok}</p>
        {okPanel.footer ? <div className="text-[15px] text-muted">{okPanel.footer}</div> : null}
      </div>
    );
  }
  return (
    <form action={formAction} className={className}>
      {state?.error ? <Banner tone="error">{state.error}</Banner> : null}
      {state?.ok ? <Banner tone="ok">{state.ok}</Banner> : null}
      {state?.value ? (
        <label className="flex flex-col gap-1.5 text-sm font-bold">{state.valueLabel ?? "Copy this"}
          <input readOnly value={state.value} data-testid="action-value" onFocus={(e) => e.currentTarget.select()}
            className="min-h-12 rounded-[14px] border-2 border-ink bg-cream px-3 font-mono text-base" />
        </label>
      ) : null}
      {children}
    </form>
  );
}

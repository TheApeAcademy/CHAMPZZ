import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { usernameSchema } from "@/lib/validation";
import { env } from "@/lib/env";

export const metadata = { title: "Ask a grown-up" };

export default async function StartDonePage({ searchParams }: PageProps<"/start/done">) {
  const { u, c } = await searchParams;
  const username = usernameSchema.safeParse(u);
  const code = typeof c === "string" && /^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(c) ? c : null;
  return (
    <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-5 px-4 pb-16 pt-4">
      <Link href="/" aria-label="Champzz home" className="self-start"><Logo size={30} /></Link>
      <h1 className="cz-rise cz-display text-[clamp(56px,17vw,104px)] text-brand [text-shadow:3px_3px_0_#1F3EC0,6px_6px_0_var(--ink)]">Almost there!</h1>
      {username.success ? (
        <section className="rounded-[28px] border-4 border-ink bg-ink p-5 text-cream shadow-[0_8px_0_var(--gold)]">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gold">Your username</p>
          <p className="font-mono text-2xl font-extrabold [overflow-wrap:anywhere]" data-testid="new-username">{username.data}</p>
          <p className="mt-1 text-sm">Remember it, and your 4 pictures. Nobody else needs to know your real name.</p>
        </section>
      ) : null}
      {code ? (
        <section className="rounded-[28px] border-4 border-ink bg-[#FFFDF7] p-5 shadow-[0_8px_0_var(--ink)]">
          <p className="font-extrabold">Now ask your mum, dad or a grown-up who looks after you to:</p>
          <ol className="mt-2 list-decimal pl-5 text-sm">
            <li>Go to <strong className="[overflow-wrap:anywhere]">{new URL(env().APP_URL).host}/approve</strong></li>
            <li>Type this code:</li>
          </ol>
          <p className="mt-2 rounded-[12px] bg-cream py-3 text-center font-mono text-3xl font-extrabold tracking-[0.2em]" data-testid="approval-code">{code}</p>
          <p className="mt-2 text-sm text-muted">The code works for 7 days. When they say yes, sign in with your username and pictures.</p>
        </section>
      ) : null}
      <Link className="inline-flex min-h-[60px] items-center justify-center rounded-full border-[2.5px] border-ink bg-gold px-6 text-[19px] font-black text-ink shadow-[0_6px_0_var(--ink)]" href="/login?kid=1">Go to sign in</Link>
    </main>
  );
}

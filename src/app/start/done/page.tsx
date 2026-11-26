import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { usernameSchema } from "@/lib/validation";

export const metadata = { title: "Ask a grown-up" };

export default async function StartDonePage({ searchParams }: PageProps<"/start/done">) {
  const { u, c } = await searchParams;
  const username = usernameSchema.safeParse(u);
  const code = typeof c === "string" && /^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(c) ? c : null;
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-8">
      <Link href="/" aria-label="Champzz home"><Logo size={30} /></Link>
      <h1 className="font-display text-4xl font-black italic uppercase">Almost there!</h1>
      {username.success ? (
        <section className="rounded-[20px] bg-ink p-5 text-cream">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gold">Your username</p>
          <p className="font-mono text-2xl font-extrabold" data-testid="new-username">{username.data}</p>
          <p className="mt-1 text-sm">Remember it, and your 4 pictures. Nobody else needs to know your real name.</p>
        </section>
      ) : null}
      {code ? (
        <section className="rounded-[20px] border-2 border-gold bg-surface p-5">
          <p className="font-extrabold">Now ask your mum, dad or a grown-up who looks after you to:</p>
          <ol className="mt-2 list-decimal pl-5 text-sm">
            <li>Go to <strong>champzz.vercel.app/approve</strong></li>
            <li>Type this code:</li>
          </ol>
          <p className="mt-2 rounded-[12px] bg-cream py-3 text-center font-mono text-3xl font-extrabold tracking-[0.2em]" data-testid="approval-code">{code}</p>
          <p className="mt-2 text-sm text-muted">The code works for 7 days. When they say yes, sign in with your username and pictures.</p>
        </section>
      ) : null}
      <Link className="font-extrabold text-brand underline" href="/login?kid=1">Go to sign in</Link>
    </main>
  );
}

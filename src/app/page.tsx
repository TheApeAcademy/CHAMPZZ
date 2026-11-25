import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { buttonClass } from "@/components/ui/primitives";
import { supabaseServer } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await supabaseServer();
  const { data: prices } = await supabase
    .from("plan_prices")
    .select("id, amount_minor, currency, billing_interval, plans!inner(name, kid_limit, sort)")
    .eq("currency", "NGN")
    .eq("billing_interval", "month");
  const sorted = (prices ?? []).sort((a, b) => a.plans.sort - b.plans.sort);

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between bg-ink px-4 py-4 sm:px-8">
        <Logo size={26} tone="cream" />
        <nav className="flex gap-2">
          <Link className="min-h-11 rounded-[12px] px-3 py-2.5 font-extrabold text-cream" href="/login">Sign in</Link>
          <Link className={buttonClass("primary")} href="/signup">Start your club</Link>
        </nav>
      </header>
      <section className="bg-ink px-4 pb-16 pt-10 text-cream sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-5xl font-black italic uppercase leading-none sm:text-7xl">Every kid<br />a champ.</h1>
          <p className="mt-5 max-w-xl text-lg">Lessons, games and safe community for kids&apos; clubs and children&apos;s ministries. Built to run on any phone, even on slow networks.</p>
        </div>
      </section>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-8">
        <h2 className="mb-6 font-display text-3xl font-extrabold">Simple monthly plans</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {sorted.map((p) => (
            <div key={p.id} className="rounded-[20px] border border-line bg-surface p-6">
              <p className="font-display text-2xl font-extrabold">{p.plans.name}</p>
              <p className="mt-1 text-xl font-bold">{new Intl.NumberFormat("en-NG", { style: "currency", currency: p.currency, maximumFractionDigits: 0 }).format(p.amount_minor / 100)}<span className="text-sm text-muted"> / month</span></p>
              <p className="mt-2 text-sm text-muted">Up to {p.plans.kid_limit} kids</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">Running a network of branches? Talk to us about a Network plan.</p>
      </main>
      <footer className="border-t border-line px-4 py-6 text-center text-sm text-muted">Built by Zebraish</footer>
    </div>
  );
}

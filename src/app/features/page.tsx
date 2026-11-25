import Link from "next/link";
import { Art, FeatureCard, MarketingPage, Section } from "@/components/marketing";
import { buttonClass } from "@/components/ui/primitives";
import { AUDIENCES, FEATURES, GAMES } from "@/content/features";

export const metadata = { title: "Features", description: "Everything inside Champzz, for kids, teachers, club leaders and parents." };

export default function FeaturesPage() {
  const live = FEATURES.filter((f) => f.status === "live").length;
  return (
    <MarketingPage>
      <section className="bg-ink px-4 py-14 text-cream sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <p className="text-sm font-extrabold uppercase tracking-widest text-gold">Everything inside</p>
          <h1 className="font-display text-5xl font-black italic uppercase leading-none">Features</h1>
          <p className="max-w-2xl text-lg text-[#E4E1D6]">{FEATURES.length} features across four kinds of people. {live} are live today; the rest are marked Coming soon and arrive release by release.</p>
          <nav aria-label="Jump to" className="flex flex-wrap gap-2">
            {AUDIENCES.map((a) => <a key={a.key} href={`#${a.key}`} className="min-h-11 rounded-full border-2 border-cream/40 px-4 py-2.5 text-sm font-extrabold">{a.title}</a>)}
          </nav>
        </div>
      </section>
      {AUDIENCES.map((a, i) => (
        <Section key={a.key} id={a.key} eyebrow={a.title} title={a.lead} tone={i % 2 === 0 ? "cream" : "white"}>
          <Art name={a.art} size={112} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.filter((f) => f.audience === a.key).map((f) => <FeatureCard key={f.key} f={f} />)}
          </div>
        </Section>
      ))}
      <Section eyebrow="The Arena" title="The six games" tone="ink">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GAMES.map((g) => <li key={g} className="rounded-[20px] border-2 border-cream/30 p-4 font-display text-lg font-black italic uppercase">{g}</li>)}
        </ul>
      </Section>
      <section className="bg-gold px-4 py-14 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4">
          <h2 className="font-display text-4xl font-black italic uppercase text-ink">Start building your club</h2>
          <Link href="/signup" className={buttonClass("primary")}>Start your club</Link>
        </div>
      </section>
    </MarketingPage>
  );
}

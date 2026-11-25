import Link from "next/link";
import Image from "next/image";
import { Art, MarketingPage, PhoneMock, Section, FeatureCard, SoonChip } from "@/components/marketing";
import { PricingCards } from "@/components/pricing-cards";
import { buttonClass } from "@/components/ui/primitives";
import { AUDIENCES, FEATURES, GAMES } from "@/content/features";
import { getPublicPlans } from "@/features/marketing/plans";

const FAQ = [
  { q: "Is Champzz only for churches?", a: "No. Churches and children's ministries switch faith mode on for Bible lessons, verses and Bible games. Kids' clubs and schools switch it off and get the same games and tools with general content." },
  { q: "Do kids need an email address or phone?", a: "No. A parent adds them, and they sign in with a username and a picture PIN: 4 taps on pictures they choose." },
  { q: "Can a stranger join our club with a forwarded code?", a: "A code alone is not enough. Only a parent with a verified account can add a child, each parent can add a limited number of kids, and a sudden rush of sign-ups pauses joining automatically. You can also switch to approval mode and handpick every kid." },
  { q: "Who can see my child's name or progress?", a: "Only your child's club leaders and teachers, and you. Nothing about a child is ever public. Leaderboards stay inside the class and show first names only." },
  { q: "Will it work on slow mobile data?", a: "Yes. Pages are built to be light, and games and the quiz show load only when they are used. The quiz show is designed to run offline once loaded." },
  { q: "How do we pay?", a: "Monthly by club size. Pay online or by bank transfer. If a payment is late you get a grace week, then read-only mode. Your data is never deleted for a late payment." },
  { q: "What happens to our data if we stop?", a: "Your club goes read-only and you can export everything. Kids' personal data is deleted after a year if you do not come back, with notices before that happens." },
];

export default async function Home() {
  const plans = await getPublicPlans();
  return (
    <MarketingPage darkHeader>
      {/* hero */}
      <section className="bg-ink px-4 pb-16 pt-10 text-cream sm:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-extrabold uppercase tracking-widest text-gold">For kids&apos; clubs and children&apos;s ministries</p>
            <h1 className="font-display text-5xl font-black italic uppercase leading-[0.95] sm:text-7xl">Every kid<br />a champ.</h1>
            <p className="max-w-xl text-lg text-[#E4E1D6]">Lessons, games and safe community in one place. Kids play and learn, teachers run class from a phone, parents see what their child is learning, and your club runs under its own name.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className={buttonClass("primary")}>Start your club</Link>
              <Link href="/features" className="inline-flex min-h-11 items-center rounded-[14px] border-2 border-cream px-5 font-extrabold">See every feature</Link>
            </div>
            <p className="text-sm text-[#D8D4C8]">Set up before you pay. Plans from {plans[0] ? new Intl.NumberFormat("en-NG", { style: "currency", currency: plans[0].currency, maximumFractionDigits: 0 }).format(plans[0].amountMinor / 100) : "a small monthly fee"} a month.</p>
          </div>
          <PhoneMock />
        </div>
      </section>

      {/* who it is for */}
      <section className="bg-gold px-4 py-8 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 text-ink sm:grid-cols-3">
          <p className="font-extrabold"><span className="font-display text-xl font-black italic uppercase">Churches and ministries</span><br />Faith mode on: Bible lessons, verses, Bible games.</p>
          <p className="font-extrabold"><span className="font-display text-xl font-black italic uppercase">Kids&apos; clubs</span><br />Faith mode off: the same fun with general content.</p>
          <p className="font-extrabold"><span className="font-display text-xl font-black italic uppercase">Schools</span><br />Classes, attendance, games and progress in one place.</p>
        </div>
      </section>

      {/* faith mode */}
      <Section eyebrow="Faith mode" title="Bible stories that come alive" lead="Churches switch faith mode on for Faith Quest lessons, memory verses, reading plans and Bible games. Clubs and schools switch it off and every Bible item disappears." tone="white">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["scene-david", "scene-noah", "scene-moses", "scene-daniel"].map((s) => (
            <Image key={s} src={`/placeholders/${s}.webp`} alt="" width={427} height={640} loading="lazy" className="h-48 w-full rounded-[20px] object-cover sm:h-64" />
          ))}
        </div>
        <p className="text-sm text-muted">Faith Quest lessons arrive with the lessons release.<SoonChip /></p>
      </Section>

      {/* road to champ */}
      <Section eyebrow="The quiz show" title="Road to Champ" lead="Five tiers from Rookie to Champ. Power-ups: Half Time, Ask the Squad and Coach's Call. A shot clock that gets louder near the end. Nobody is knocked out: a wrong answer shows the right one and play goes on." tone="ink">
        <div className="flex items-center gap-4"><Art name="quiz" size={96} /><Art name="trophy" size={80} /></div>
        <div className="flex flex-wrap gap-2" aria-label="Road to Champ tiers">
          {["Rookie", "Rising Star", "All-Star", "Legend", "CHAMP"].map((t, i) => (
            <span key={t} className={`rounded-full px-4 py-2 font-display font-black italic uppercase ${i === 4 ? "bg-gold text-ink" : "border-2 border-cream/40"}`}>{t}</span>
          ))}
        </div>
        <p className="text-sm text-[#D8D4C8]">Host it for the whole room on one screen, teams or solo, even with no internet once it has loaded.<SoonChip /></p>
      </Section>

      {/* games */}
      <Section eyebrow="The Arena" title="Six games worth coming back for" lead="Every game earns Champ Points. Clubs add their own verses, characters and words, so the games grow with your teaching." tone="white">
        <Art name="game-rocket" size={96} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GAMES.map((g, i) => (
            <div key={g} className={`flex h-28 items-end rounded-[24px] p-4 font-display text-lg font-black italic uppercase ${["bg-brand text-white", "bg-gold text-ink", "bg-coral text-ink", "bg-ink text-white", "bg-surface text-ink border-2 border-line", "bg-brand text-white"][i]}`}>{g}</div>
          ))}
        </div>
        <p className="text-sm text-muted">Arriving with the games release.<SoonChip /></p>
      </Section>

      {/* each audience */}
      {AUDIENCES.map((a, idx) => (
        <Section key={a.key} id={a.key} eyebrow={a.title} title={a.lead} tone={idx % 2 === 0 ? "cream" : "white"}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.filter((f) => f.audience === a.key).map((f) => <FeatureCard key={f.key} f={f} />)}
          </div>
        </Section>
      ))}

      {/* safety */}
      <Section eyebrow="Safe by design" title="Built for children's data from day one" lead="Safety is enforced by the database itself, not just hidden in the app." tone="brand">
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            "Every club's data is walled off from every other club. Tested on every table, for every role.",
            "No child's name, photo or profile is ever public.",
            "Kids sign in with a picture PIN that locks after 5 wrong tries.",
            "Parental consent is recorded for every child.",
            "We collect a first name and a surname initial, not full names or birthdays.",
            "Talk to Someone keeps a child's anonymity even from the adults reading it.",
          ].map((s) => <li key={s} className="rounded-[16px] bg-white/10 p-4 font-bold">{s}</li>)}
        </ul>
        <Link href="/safety" className="inline-flex min-h-11 items-center self-start rounded-[14px] bg-white px-5 font-extrabold text-ink">How we keep kids safe</Link>
      </Section>

      {/* slow networks */}
      <Section eyebrow="Made for real phones" title="Fast on slow data" lead="Light pages, no heavy downloads, and games that load only when a kid opens them. Made for Nigeria first, and clubs everywhere." tone="cream">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[20px] border border-line bg-surface p-5"><p className="font-extrabold">Light pages</p><p className="text-sm text-muted">Text-first design with drawn shapes instead of heavy photos.</p></div>
          <div className="rounded-[20px] border border-line bg-surface p-5"><p className="font-extrabold">Load on demand</p><p className="text-sm text-muted">Each game downloads only when it is played.</p></div>
          <div className="rounded-[20px] border border-line bg-surface p-5"><p className="font-extrabold">Offline quiz show<SoonChip /></p><p className="text-sm text-muted">Run Road to Champ in a hall with no wifi.</p></div>
        </div>
      </Section>

      {/* get started */}
      <Section eyebrow="Get started" title="Running in under ten minutes" tone="white">
        <ol className="grid gap-3 sm:grid-cols-3">
          {[
            ["1", "Create your club", "Name, web address and type. You can set up classes before you pay."],
            ["2", "Choose a plan", "Pay online or by bank transfer. Your join code appears the moment you are active."],
            ["3", "Share your code", "Parents open your Clubhouse page, enter the code and add their kids."],
          ].map(([n, t, d]) => (
            <li key={n} className="flex flex-col gap-2 rounded-[20px] border border-line bg-cream p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-display font-black text-white">{n}</span>
              <span className="font-extrabold">{t}</span>
              <span className="text-sm text-muted">{d}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* pricing */}
      <Section id="pricing" eyebrow="Pricing" title="Simple monthly plans" lead="Priced by the number of kids. No setup fee." tone="cream">
        <PricingCards plans={plans} />
      </Section>

      {/* faq */}
      <Section eyebrow="Questions" title="Good to know" tone="white">
        <div className="flex flex-col divide-y divide-line rounded-[20px] border border-line bg-surface">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none font-extrabold">{f.q}</summary>
              <p className="pt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* final cta */}
      <section className="bg-gold px-4 py-16 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5">
          <h2 className="font-display text-4xl font-black italic uppercase leading-tight text-ink sm:text-5xl">Ready to crown some champs?</h2>
          <Link href="/signup" className={buttonClass("primary")}>Start your club</Link>
        </div>
      </section>
    </MarketingPage>
  );
}

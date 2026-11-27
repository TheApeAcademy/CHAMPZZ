import { MarketingPage, Section } from "@/components/marketing";
import { PricingCards } from "@/components/pricing-cards";
import { getPublicPlans } from "@/features/marketing/plans";

export const metadata = { title: "Pricing", description: "Simple monthly plans priced by the number of kids." };

export default async function PricingPage() {
  const plans = await getPublicPlans();
  return (
    <MarketingPage>
      <section className="bg-ink px-4 py-14 text-cream sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <p className="text-sm font-extrabold uppercase tracking-widest text-gold">Pricing</p>
          <h1 className="font-display text-5xl font-black italic uppercase leading-none">Simple monthly plans</h1>
          <p className="max-w-2xl text-lg text-[#E4E1D6]">Priced by the number of kids in your club. No setup fee.</p>
        </div>
      </section>
      <Section eyebrow="Plans" title="Pick your size" lead="Prices in Naira. Plans in pounds, dollars, euros and Canadian dollars are on the way." tone="cream">
        <PricingCards plans={plans} />
      </Section>
      <Section eyebrow="How paying works" title="No surprises" tone="white">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            ["Set up first, pay when ready", "Create your club, add classes and look around before you pay."],
            ["Online or bank transfer", "Pay online, or by bank transfer and we activate your club when it arrives."],
            ["A grace week", "If a payment is late, everything keeps working for 7 days while we remind you."],
            ["Never deleted for being late", "After the grace week your club goes read-only. Pay again and everything switches back on."],
            ["Messaging credits", "SMS and WhatsApp messages are paid as you go, never unlimited, so there are no surprise bills."],
            ["Room to grow", "Move up a plan any time when your club grows past its kid limit."],
          ].map(([t, d]) => <li key={t} className="rounded-[20px] border border-line bg-cream p-5"><p className="font-extrabold">{t}</p><p className="mt-1 text-muted">{d}</p></li>)}
        </ul>
      </Section>
    </MarketingPage>
  );
}

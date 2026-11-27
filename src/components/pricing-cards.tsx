import Link from "next/link";
import { buttonClass } from "@/components/ui/primitives";
import { formatPrice, type PublicPlan } from "@/features/marketing/plans";

export function PricingCards({ plans }: { plans: PublicPlan[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="pricing-cards">
      {plans.map((p, i) => (
        <div key={p.id} className={`flex flex-col gap-3 rounded-[24px] border-2 p-6 ${i === 1 ? "border-brand bg-surface" : "border-line bg-surface"}`}>
          {i === 1 ? <span className="self-start rounded-full bg-gold px-3 py-0.5 text-xs font-extrabold">A good place to start</span> : null}
          <p className="font-display text-2xl font-black italic uppercase">{p.name}</p>
          <p className="text-2xl font-extrabold">{formatPrice(p.amountMinor, p.currency)}<span className="text-sm font-bold text-muted"> / month</span></p>
          <p className="text-sm text-muted">Up to {p.kidLimit} kids</p>
          <Link href="/signup" className={`${buttonClass(i === 1 ? "primary" : "outline")} mt-auto`}>Start with {p.name}</Link>
        </div>
      ))}
      <div className="flex flex-col gap-3 rounded-[24px] border-2 border-ink bg-ink p-6 text-cream">
        <p className="font-display text-2xl font-black italic uppercase">Network</p>
        <p className="text-2xl font-extrabold">Custom</p>
        <p className="text-sm text-[#D8D4C8]">Many branches, one account. Limits and price set together with you.</p>
        <Link href="/signup" className={`${buttonClass("primary")} mt-auto`}>Talk to us</Link>
      </div>
    </div>
  );
}

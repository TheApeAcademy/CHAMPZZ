import LandingV2 from "@/features/marketing/landing-v2/landing-v2";
import { getPublicPlans } from "@/features/marketing/plans";

const PRICED = ["starter", "basic", "pro"];

export default async function Home() {
  const plans = await getPublicPlans();
  // Monthly NGN prices for Starter, Basic and Pro, from the plans table.
  const ngn = PRICED.map((name) => plans.find((p) => p.name.toLowerCase() === name)?.amountMinor);
  const ngnPrices = ngn.every((n) => typeof n === "number") ? ngn.map((n) => (n as number) / 100) : undefined;
  return <LandingV2 ngnPrices={ngnPrices} />;
}

import { MarketingPage } from "@/components/marketing";
import { Banner } from "@/components/ui/primitives";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <MarketingPage>
      <article className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-12 leading-relaxed sm:px-8">
        <Banner tone="warn">Draft for review. These terms need legal review, and the company details must be filled in, before launch.</Banner>
        <h1 className="font-display text-4xl font-black italic uppercase">Terms</h1>
        <h2 className="text-xl font-extrabold">The service</h2>
        <p>Champzz provides an online platform for kids&apos; clubs, schools and children&apos;s ministries, run by [company legal name to be added].</p>
        <h2 className="text-xl font-extrabold">Club accounts</h2>
        <p>The person who creates a club is its Org Admin and is responsible for who they invite and for getting parents&apos; consent where the law requires it.</p>
        <h2 className="text-xl font-extrabold">Payment</h2>
        <p>Plans are paid monthly or as agreed. If payment is late the club gets a grace week, then becomes read-only until it pays. We do not delete a club&apos;s data because a payment is late.</p>
        <h2 className="text-xl font-extrabold">Acceptable use</h2>
        <p>No harmful, abusive or unlawful content, no attempts to access other clubs&apos; data, and no use that puts children at risk. We may suspend a club that breaks these rules.</p>
        <h2 className="text-xl font-extrabold">Your content</h2>
        <p>Clubs own the content they add. They give Champzz permission to store and display it to their members so the service can work.</p>
        <h2 className="text-xl font-extrabold">Contact</h2>
        <p>[Contact email to be added].</p>
      </article>
    </MarketingPage>
  );
}

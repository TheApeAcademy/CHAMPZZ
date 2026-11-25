import { MarketingPage } from "@/components/marketing";
import { Banner } from "@/components/ui/primitives";

export const metadata = { title: "Privacy notice" };

export default function PrivacyPage() {
  return (
    <MarketingPage>
      <article className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-12 leading-relaxed sm:px-8">
        <Banner tone="warn">Draft for review. This notice explains how Champzz is built to handle data. It needs legal review, and the company details below must be filled in, before launch.</Banner>
        <h1 className="font-display text-4xl font-black italic uppercase">Privacy notice</h1>
        <h2 className="text-xl font-extrabold">Who we are</h2>
        <p>Champzz is run by [company legal name and address to be added]. Each club that uses Champzz decides how it uses the platform for its own members; for that information the club is responsible, and Champzz processes it on the club&apos;s behalf.</p>
        <h2 className="text-xl font-extrabold">What we collect</h2>
        <ul className="list-disc pl-6">
          <li>Adults (leaders, teachers, parents): name, email address, password (stored hashed by our authentication provider), and the clubs they belong to.</li>
          <li>Children: first name, surname initial, a made-up username, a picture PIN (stored hashed), their club and class, and the consent given by their parent or guardian.</li>
          <li>Clubs: club name, address on Champzz, settings, and payment records.</li>
          <li>Security records: sign-in attempts and an audit log of sensitive actions.</li>
        </ul>
        <h2 className="text-xl font-extrabold">What we do not collect from children</h2>
        <p>No email address, phone number, full surname or full date of birth.</p>
        <h2 className="text-xl font-extrabold">Why we use it</h2>
        <p>To run the club&apos;s activities on Champzz, keep children safe, keep accounts secure, and take payment from clubs.</p>
        <h2 className="text-xl font-extrabold">Who can see a child&apos;s information</h2>
        <p>Only that child&apos;s club leaders and teachers, the parents or guardians linked to them, and the child. Nothing about a child is public.</p>
        <h2 className="text-xl font-extrabold">Where it is stored</h2>
        <p>On Supabase (database) in the European Union (Ireland) and served by Vercel.</p>
        <h2 className="text-xl font-extrabold">How long we keep it</h2>
        <p>While the club is active. If a club stops paying it becomes read-only; after a year, children&apos;s personal data is deleted, with notices first. Payment and audit records are kept as the law requires.</p>
        <h2 className="text-xl font-extrabold">Your choices</h2>
        <p>Parents can ask the club to correct or remove their child&apos;s data, and can withdraw optional consents. Clubs can export or delete their data.</p>
        <h2 className="text-xl font-extrabold">Contact</h2>
        <p>[Contact email to be added].</p>
      </article>
    </MarketingPage>
  );
}

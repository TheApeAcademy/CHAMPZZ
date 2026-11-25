import { Art, MarketingPage, Section, SoonChip } from "@/components/marketing";

export const metadata = { title: "Safety", description: "How Champzz keeps children and their data safe." };

const LIVE = [
  { t: "Every club is walled off", d: "Each club's data lives behind rules enforced inside the database. Our automated tests try, for every kind of user, to read and change another club's records on every table. Every attempt must fail before we ship." },
  { t: "Nothing about a child is public", d: "No page that a stranger can open shows a child's name, photo, profile or scores. A club's public Clubhouse page shows the club, never its kids." },
  { t: "A forwarded code is not enough", d: "Joining needs a signed-in parent with a verified email, and each parent can add a limited number of kids. A sudden rush of sign-ups pauses joining by itself and tells the club leader." },
  { t: "Picture PINs that lock", d: "Kids sign in with 4 pictures. Five wrong tries locks the account for 15 minutes, longer each time, until a teacher resets it. Usernames are made up, never the child's real name." },
  { t: "Consent on record", d: "A parent or guardian gives consent for every child, and we keep a dated record of it, including optional choices like photos." },
  { t: "Collect the minimum", d: "A first name and a surname initial. No child email, phone number or full birthday." },
  { t: "Everything sensitive is logged", d: "Payments, PIN resets, approvals, suspensions and code changes go into an audit log that nobody can edit." },
  { t: "Late payment never deletes data", d: "A club that stops paying goes read-only. Nothing is deleted on expiry. Kids' personal data is removed after a year of inactivity, with notices first." },
];

const SOON = [
  { t: "Talk to Someone", d: "A child can tell a trusted adult something is wrong. If they choose to stay anonymous, the database hides who they are even from the adults reading it, and serious messages escalate to the club's safeguarding lead." },
  { t: "No hidden one-to-one channels", d: "Messages between adults and children are visible to the club's leaders, by default." },
  { t: "Photo checks", d: "A child's new profile picture waits for a teacher to approve it before anyone else sees it." },
  { t: "Text screening", d: "Profile text is checked for phone numbers, emails, social media handles and abusive words before it is saved." },
];

export default function SafetyPage() {
  return (
    <MarketingPage>
      <section className="bg-brand px-4 py-14 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <p className="text-sm font-extrabold uppercase tracking-widest text-gold">Safety</p>
          <h1 className="font-display text-5xl font-black italic uppercase leading-none">Safe by design</h1>
          <p className="max-w-2xl text-lg">Every promise on this page is backed by a rule in the database or an automated test, not just a line in the app.</p>
        </div>
      </section>
      <Section eyebrow="Today" title="How Champzz protects kids" tone="cream">
        <Art name="heart-tree" size={112} />
        <div className="grid gap-3 sm:grid-cols-2">
          {LIVE.map((x) => <div key={x.t} className="rounded-[20px] border border-line bg-surface p-5"><p className="font-extrabold">{x.t}</p><p className="mt-1 text-muted">{x.d}</p></div>)}
        </div>
      </Section>
      <Section eyebrow="Arriving with the next releases" title="More safeguarding on the way" tone="white">
        <div className="grid gap-3 sm:grid-cols-2">
          {SOON.map((x) => <div key={x.t} className="rounded-[20px] border border-line bg-cream p-5"><p className="font-extrabold">{x.t}<SoonChip /></p><p className="mt-1 text-muted">{x.d}</p></div>)}
        </div>
      </Section>
      <Section eyebrow="Privacy law" title="Designed for the rules that protect children" tone="cream">
        <p className="max-w-3xl text-muted">Champzz is designed around Nigeria&apos;s Data Protection Act and built to be ready for the UK and EU GDPR and the US COPPA rules: consent records, minimum data, data export, and deletion. This describes how the product is designed; it is not a legal certification.</p>
      </Section>
    </MarketingPage>
  );
}

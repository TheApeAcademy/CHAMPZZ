import { Logo } from "@/components/ui/logo";
import { PrintButton } from "@/components/ui/print-button";

/** A printable, club-branded certificate. Prints on one landscape page. */
export function Certificate({ kidName, title, reason, club, color, logo, issuedAt }: {
  kidName: string; title: string; reason: string | null; club: string; color: string | null; logo: string | null; issuedAt: string;
}) {
  const accent = color ?? "#2F5BFF";
  return (
    <div className="flex flex-col items-center gap-4">
      <article data-testid="certificate" className="relative flex aspect-[1.414] w-full max-w-3xl flex-col items-center justify-center gap-3 overflow-hidden rounded-[18px] border-[10px] bg-cream p-8 text-center print:max-w-none print:rounded-none"
        style={{ borderColor: accent }}>
        <div className="absolute inset-3 rounded-[10px] border-2 border-gold" aria-hidden="true" />
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={`${club} logo`} className="h-14 w-auto max-w-40 object-contain" />
        ) : null}
        <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-muted">{club}</p>
        <p className="font-display text-xl font-black italic uppercase" style={{ color: accent }}>Certificate of Achievement</p>
        <p className="text-sm text-muted">This is to celebrate</p>
        <p className="font-display text-4xl font-black sm:text-5xl" data-testid="certificate-name">{kidName}</p>
        <p className="font-display text-2xl font-extrabold" data-testid="certificate-title">{title}</p>
        {reason ? <p className="max-w-md">{reason}</p> : null}
        <p className="mt-2 text-sm font-bold text-muted">{new Date(issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        <div className="absolute bottom-5 right-6"><Logo size={18} /></div>
      </article>
      <div className="print:hidden"><PrintButton>Print certificate</PrintButton></div>
    </div>
  );
}

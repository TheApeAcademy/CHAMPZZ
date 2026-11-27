import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { buttonClass } from "@/components/ui/primitives";

export const metadata = { title: "Page not found" };

/** Shown for any address that does not exist, or that this person may not open. */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-xl flex-col items-start justify-center gap-5 px-5 py-12">
      <Link href="/" aria-label="Champzz home"><Logo size={34} /></Link>
      <Image src="/placeholders/landing/stone-render.webp" alt="" width={120} height={120} className="h-28 w-28 object-contain" />
      <h1 className="cz-display text-[clamp(52px,15vw,88px)]">Lost in Champ Town</h1>
      <p className="text-lg text-muted">We could not find that page. It may have moved, or it may belong to a club you are not part of.</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className={buttonClass("gold", "lg")}>Go home</Link>
        <Link href="/login" className={buttonClass("outline", "lg")}>Sign in</Link>
      </div>
    </main>
  );
}

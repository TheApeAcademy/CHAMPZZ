import Link from "next/link";
import type { ReactNode } from "react";
import "./auth-frame.css";

const FONTS = "https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Mr+Dafoe&family=Permanent+Marker&family=Nunito+Sans:wght@400;600;700;800;900&display=swap";

/** Sign-in / sign-up chrome that matches the landing page. */
export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="cz-auth">
      <link rel="stylesheet" href={FONTS} precedence="default" />
      <header className="cz-auth-top">
        <Link href="/" aria-label="Champzz home" className="cz-auth-logo">Champions</Link>
      </header>
      <main className="cz-auth-main"><div className="cz-auth-card">{children}</div></main>
    </div>
  );
}

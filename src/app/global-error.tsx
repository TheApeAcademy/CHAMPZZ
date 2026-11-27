"use client";

/** Last-resort fallback if the root layout itself fails. Plain HTML, no app styles. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#FFF8EC", color: "#0B1026", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 520, margin: "0 auto", padding: "64px 20px" }}>
          <h1 style={{ fontSize: 40, margin: "0 0 12px" }}>Champzz hit a wobble</h1>
          <p style={{ fontSize: 18 }}>Please try again in a moment.</p>
          <button type="button" onClick={reset} style={{ marginTop: 16, minHeight: 52, padding: "0 24px", borderRadius: 999, border: "2.5px solid #0B1026", background: "#F2B33D", fontWeight: 900, fontSize: 18 }}>Try again</button>
        </main>
      </body>
    </html>
  );
}

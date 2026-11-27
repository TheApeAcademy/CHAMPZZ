import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted (src/app/fonts/README.md): kids' devices never call Google Fonts.
const archivo = localFont({
  variable: "--font-archivo",
  display: "swap",
  src: [
    { path: "./fonts/archivo-latin-wdth-normal.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/archivo-latin-wdth-italic.woff2", weight: "100 900", style: "italic" },
  ],
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});
const nunitoSans = localFont({
  variable: "--font-nunito-sans",
  display: "swap",
  src: [
    { path: "./fonts/nunito-sans-latin-wght-normal.woff2", weight: "200 1000", style: "normal" },
    { path: "./fonts/nunito-sans-latin-wght-italic.woff2", weight: "200 1000", style: "italic" },
  ],
});
// The hand-signed Champzz wordmark (landing and every header).
const mrDafoe = localFont({ variable: "--font-mr-dafoe", display: "swap", src: "./fonts/mr-dafoe-latin-400-normal.woff2", weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")),
  title: { default: "Champzz", template: "%s · Champzz" },
  description: "Learning, games and community for kids' clubs and children's ministries.",
  applicationName: "Champzz",
  appleWebApp: { capable: true, title: "Champzz", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "Champzz",
    title: "Champzz · Where every kid becomes a champion",
    description: "Learning, games and community for kids' clubs and children's ministries.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Champzz: where every kid becomes a champion" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFF8EC",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${nunitoSans.variable} ${mrDafoe.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

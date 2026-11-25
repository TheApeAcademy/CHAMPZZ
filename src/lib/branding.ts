import { env } from "@/lib/env";

/** Public URL of an uploaded club logo (the branding bucket is public; files are server-checked images). */
export function logoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${env().NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/branding/${path.split("/").map(encodeURIComponent).join("/")}`;
}

/** Ink or white text, whichever reads better on a club's chosen colour (WCAG relative luminance). */
export function textOn(hex: string): "#0B1026" | "#FFFFFF" {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const l = 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
  return (l + 0.05) / (0.0465 + 0.05) > 1.05 / (l + 0.05) ? "#0B1026" : "#FFFFFF";
}

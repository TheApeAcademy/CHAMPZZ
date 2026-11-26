import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const OTP_TYPES: EmailOtpType[] = ["signup", "recovery", "invite", "magiclink", "email_change", "email"];

// Links in Champzz emails land here and are traded for a session, then the
// user continues to a same-site path only (never an open redirect).
// - ?token_hash=&type= works on any device (the email templates use this).
// - ?code= is the default PKCE link; it only works in the browser that asked.
export async function GET(request: NextRequest) {
  const base = env().APP_URL;
  const params = request.nextUrl.searchParams;
  const nextParam = params.get("next") ?? "/onboarding";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") && !nextParam.startsWith("/\\") ? nextParam : "/onboarding";
  const supabase = await supabaseServer();

  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${base}${next}`, 303);
  }

  const code = params.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${base}${next}`, 303);
  }
  return NextResponse.redirect(`${base}/login?confirm=failed`, 303);
}

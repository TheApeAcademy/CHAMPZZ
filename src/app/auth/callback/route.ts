import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { env } from "@/lib/env";

// The link in the confirmation email lands here with ?code=. Trade it for a
// session, then continue to a same-site path only (never an open redirect).
export async function GET(request: NextRequest) {
  const base = env().APP_URL;
  const code = request.nextUrl.searchParams.get("code");
  const nextParam = request.nextUrl.searchParams.get("next") ?? "/onboarding";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") && !nextParam.startsWith("/\\") ? nextParam : "/onboarding";
  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${base}${next}`, 303);
  }
  return NextResponse.redirect(`${base}/login?confirm=failed`, 303);
}

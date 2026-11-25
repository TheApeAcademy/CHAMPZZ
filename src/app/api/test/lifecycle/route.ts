import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Test hook so end-to-end tests can run the daily lifecycle job at a chosen
// time. Returns 404 unless ENABLE_TEST_HOOKS=1, which is never set in production.
export async function POST(request: NextRequest) {
  if (env().ENABLE_TEST_HOOKS !== "1") return new NextResponse(null, { status: 404 });
  const { now } = (await request.json().catch(() => ({}))) as { now?: string };
  const at = now && !Number.isNaN(Date.parse(now)) ? new Date(now).toISOString() : new Date().toISOString();
  const { data, error } = await supabaseAdmin().rpc("svc_lifecycle_tick", { p_now: at });
  if (error) return NextResponse.json({ error: "tick failed" }, { status: 500 });
  return NextResponse.json({ moved: data });
}

import { NextResponse, type NextRequest } from "next/server";
import { flutterwave } from "@/lib/billing/flutterwave";
import { settleTransaction } from "@/lib/billing/apply";
import { supabaseAdmin } from "@/lib/supabase/admin";

// 1. authenticate (verif-hash, constant-time)  2. record the event once
// 3. re-verify with Flutterwave and apply       4. mark processed
export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (raw.length > 100_000) return new NextResponse(null, { status: 413 });
  const event = flutterwave.authenticateWebhook(raw, request.headers);
  if (!event) return new NextResponse(null, { status: 401 });

  const admin = supabaseAdmin();
  const { data: inserted, error } = await admin
    .from("billing_events")
    .upsert({ provider: "flutterwave", provider_event_id: event.eventId, payload: JSON.parse(raw) }, { onConflict: "provider,provider_event_id", ignoreDuplicates: true })
    .select("id")
    .maybeSingle();
  if (error) return new NextResponse(null, { status: 500 });
  if (!inserted) return NextResponse.json({ received: true, duplicate: true });

  try {
    const result = await settleTransaction(flutterwave, event.txId);
    await admin.from("billing_events").update({ processed_at: new Date().toISOString(), error: result === "ignored" ? "ignored" : null }).eq("id", inserted.id);
    return NextResponse.json({ received: true, result });
  } catch {
    // Leave it unprocessed and let the provider retry: drop the event row so the retry is not seen as a duplicate.
    await admin.from("billing_events").delete().eq("id", inserted.id);
    return new NextResponse(null, { status: 500 });
  }
}

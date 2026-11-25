import { NextResponse, type NextRequest } from "next/server";
import { flutterwave } from "@/lib/billing/flutterwave";
import { settleTransaction } from "@/lib/billing/apply";
import { env } from "@/lib/env";

// Flutterwave sends the customer back here with ?status&tx_ref&transaction_id.
// The query string is never trusted: settleTransaction re-verifies with
// Flutterwave and checks the amount against our own checkout record. The
// webhook does the same, and whichever lands first wins (idempotent).
export async function GET(request: NextRequest, ctx: RouteContext<"/o/[org]/billing/return">) {
  const { org } = await ctx.params;
  const base = `${env().APP_URL}/o/${encodeURIComponent(org)}`;
  const txId = request.nextUrl.searchParams.get("transaction_id");
  if (!txId || !/^[0-9]{1,20}$/.test(txId)) return NextResponse.redirect(`${base}?paid=0`, 303);
  try {
    const result = await settleTransaction(flutterwave, txId);
    return NextResponse.redirect(`${base}?paid=${result === "applied" ? "1" : "0"}`, 303);
  } catch {
    return NextResponse.redirect(`${base}?paid=0`, 303);
  }
}

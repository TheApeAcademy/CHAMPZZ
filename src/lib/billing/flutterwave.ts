import "server-only";
import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import type { BillingProvider, VerifiedTransaction } from "./provider";

/*
 * Flutterwave (v3 API), per Flutterwave's developer docs as checked on
 * 2026-11-25 (see docs/PAYMENTS.md):
 *  - webhooks carry the secret hash we set in the dashboard in a `verif-hash`
 *    header; compare it in constant time and drop the request otherwise
 *  - never trust the webhook body: re-verify the transaction by id and check
 *    status, tx_ref, currency and amount against our own checkout record
 *  - amounts are in major units (naira, pounds), we store minor units
 * The exact endpoint paths below must be re-confirmed with Banks's test keys
 * before going live.
 */

function toMajor(minor: number): number {
  return Math.round(minor) / 100;
}

function toMinor(major: number): number {
  return Math.round(major * 100);
}

function headersJson() {
  const key = env().FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("Flutterwave is not configured.");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const METHOD: Record<string, VerifiedTransaction["method"]> = {
  card: "card",
  bank_transfer: "bank_transfer",
  account: "bank_transfer",
  ussd: "other",
  mobilemoneyghana: "mobile_money",
  mobile_money: "mobile_money",
};

export const flutterwave: BillingProvider = {
  id: "flutterwave",

  async createCheckout(input) {
    const res = await fetch(`${env().FLUTTERWAVE_API_BASE}/payments`, {
      method: "POST",
      headers: headersJson(),
      body: JSON.stringify({
        tx_ref: input.txRef,
        amount: toMajor(input.amountMinor),
        currency: input.currency,
        redirect_url: input.redirectUrl,
        customer: { email: input.customer.email, name: input.customer.name },
        customizations: { title: input.title },
      }),
      cache: "no-store",
    });
    const body = (await res.json().catch(() => null)) as { status?: string; data?: { link?: string } } | null;
    if (!res.ok || body?.status !== "success" || !body.data?.link) {
      throw new Error("Could not start the payment.");
    }
    return { url: body.data.link };
  },

  authenticateWebhook(rawBody, headers) {
    const expected = env().FLUTTERWAVE_WEBHOOK_HASH;
    const got = headers.get("verif-hash");
    if (!expected || !got || !safeEqual(got, expected)) return null;
    let payload: { event?: string; data?: { id?: number | string; tx_ref?: string } };
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return null;
    }
    const id = payload.data?.id;
    const txRef = payload.data?.tx_ref;
    if (id === undefined || id === null || typeof txRef !== "string") return null;
    return { eventId: `${payload.event ?? "event"}:${id}`, txId: String(id), txRef };
  },

  async verifyTransaction(providerTxId) {
    if (!/^[0-9]{1,20}$/.test(providerTxId)) throw new Error("Bad transaction id.");
    const res = await fetch(`${env().FLUTTERWAVE_API_BASE}/transactions/${providerTxId}/verify`, {
      headers: headersJson(),
      cache: "no-store",
    });
    const body = (await res.json().catch(() => null)) as {
      status?: string;
      data?: { id: number; tx_ref: string; status: string; amount: number; currency: string; payment_type?: string };
    } | null;
    if (!res.ok || body?.status !== "success" || !body.data) throw new Error("Could not verify the payment.");
    const d = body.data;
    return {
      providerTxId: String(d.id),
      txRef: d.tx_ref,
      status: d.status === "successful" ? "successful" : d.status === "failed" ? "failed" : "pending",
      amountMinor: toMinor(d.amount),
      currency: d.currency,
      method: METHOD[d.payment_type ?? ""] ?? "other",
    };
  },
};

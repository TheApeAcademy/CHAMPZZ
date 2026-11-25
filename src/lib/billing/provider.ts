import "server-only";

export type CheckoutInput = {
  txRef: string;
  amountMinor: number;
  currency: string;
  redirectUrl: string;
  customer: { email: string; name: string };
  title: string;
};

export type VerifiedTransaction = {
  providerTxId: string;
  txRef: string;
  status: "successful" | "failed" | "pending";
  amountMinor: number;
  currency: string;
  method: "card" | "bank_transfer" | "mobile_money" | "other";
};

/** Every payment provider implements this. Stripe can be added later without touching anything else. */
export interface BillingProvider {
  id: "flutterwave" | "stripe";
  createCheckout(input: CheckoutInput): Promise<{ url: string }>;
  /** Returns the provider's transaction id if the request is authentic, otherwise null. */
  authenticateWebhook(rawBody: string, headers: Headers): { eventId: string; txId: string; txRef: string } | null;
  verifyTransaction(providerTxId: string): Promise<VerifiedTransaction>;
}

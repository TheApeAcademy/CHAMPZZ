import "server-only";
import { createHmac } from "node:crypto";
import { env } from "@/lib/env";

/** Kid auth users never receive email; the address only has to be unique. */
export function kidEmail(kidId: string): string {
  return `kid-${kidId}@${env().KID_EMAIL_DOMAIN}`;
}

/**
 * The kid's real auth password: 256 bits derived from a server secret. No
 * person ever sees it, so guessing at the auth endpoint is pointless. The only
 * way in is the throttled picture-PIN check.
 */
function kidSecret(): string {
  const e = env();
  return e.KID_AUTH_SECRET ?? createHmac("sha256", e.SUPABASE_SECRET_KEY).update("champzz-kid-auth-v1").digest("base64url");
}

export function kidPassword(kidId: string): string {
  return createHmac("sha256", kidSecret()).update(`kid:${kidId}`).digest("base64url");
}

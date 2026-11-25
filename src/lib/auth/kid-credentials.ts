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
export function kidPassword(kidId: string): string {
  return createHmac("sha256", env().KID_AUTH_SECRET).update(`kid:${kidId}`).digest("base64url");
}

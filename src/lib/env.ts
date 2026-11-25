import "server-only";
import { z } from "zod";

// Server environment, validated once. Nothing here is ever sent to a browser.
const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  SUPABASE_SECRET_KEY: z.string().min(20),
  APP_URL: z.url(),
  // Derives each kid's real auth password. Optional: when unset it is derived
  // from SUPABASE_SECRET_KEY, so production needs only one secret. Rotating
  // either is safe: the next PIN sign-in re-derives the password.
  KID_AUTH_SECRET: z.string().min(32).optional(),
  // Synthetic emails for kid auth users. Never emailed. Must be a domain
  // Champzz controls once one exists.
  KID_EMAIL_DOMAIN: z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_WEBHOOK_HASH: z.string().optional(),
  FLUTTERWAVE_API_BASE: z.url().default("https://api.flutterwave.com/v3"),
  // Offline payment instructions shown to unpaid orgs. Changeable without a deploy.
  OFFLINE_BANK_NAME: z.string().max(80).optional(),
  OFFLINE_ACCOUNT_NUMBER: z.string().regex(/^[0-9]{6,20}$/).optional(),
  OFFLINE_ACCOUNT_NAME: z.string().max(120).optional(),
  // Lets Playwright drive the daily lifecycle job. Off in production.
  ENABLE_TEST_HOOKS: z.enum(["0", "1"]).default("0"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | undefined;

export function env(): ServerEnv {
  if (!cached) {
    const parsed = serverSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Invalid server environment: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`);
    }
    cached = parsed.data;
  }
  return cached;
}

import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS, so it is used only for the few jobs that
 * need it (creating kid auth users, payment webhooks, kid PIN checks) and
 * only after the caller has been authorised in code. Never import this from
 * a client component: "server-only" makes that a build error.
 */
export function supabaseAdmin() {
  const e = env();
  return createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });
}

/** Same, pointed at the private `app` schema for service-only functions. */
export function supabaseAdminApp() {
  const e = env();
  return createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "app" },
  });
}

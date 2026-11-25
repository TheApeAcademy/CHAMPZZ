import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Service-role client. Bypasses RLS, so it is used only for the few jobs that
 * need it (creating kid auth users, payment webhooks, kid PIN checks) and
 * only after the caller has been authorised in code. Never import this from
 * a client component: "server-only" makes that a build error.
 */
export function supabaseAdmin() {
  const e = env();
  return createClient<Database>(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });
}

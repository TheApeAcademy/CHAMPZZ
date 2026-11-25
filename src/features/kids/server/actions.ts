"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { kidPassword } from "@/lib/auth/kid-credentials";
import { pinSchema, slugSchema, usernameSchema } from "@/lib/validation";
import type { ActionState } from "@/components/ui/action-form";

/** Kid sign-in: org + username + picture PIN, throttled and locked out in the database. */
export async function kidSignIn(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const s = slugSchema.safeParse(slug);
  const u = usernameSchema.safeParse(data.get("username"));
  const p = pinSchema.safeParse(data.get("pin"));
  if (!s.success || !u.success || !p.success) return { error: "Type your username and tap your 4 pictures." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]!.trim() || h.get("x-real-ip") || "unknown";

  const { data: rows, error } = await supabaseAdmin().rpc("svc_kid_verify_pin", { p_slug: s.data, p_username: u.data, p_pin: p.data, p_ip: ip });
  const r = rows?.[0];
  if (error || !r) return { error: "Something went wrong. Please try again." };
  if (r.result === "locked") return { error: "Too many tries. Ask your teacher to help you, or wait a little while." };
  if (r.result === "rate_limited") return { error: "Too many tries from this device. Please wait a few minutes." };
  if (r.result !== "ok" || !r.user_id) return { error: "That username and picture PIN do not match." };

  const admin = supabaseAdmin();
  const { data: user } = await admin.auth.admin.getUserById(r.user_id);
  const kidId = user.user?.app_metadata?.kid_id as string | undefined;
  const email = user.user?.email;
  if (!kidId || !email) return { error: "Something went wrong. Please try again." };

  const supabase = await supabaseServer();
  let { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: kidPassword(kidId) });
  if (signInErr) {
    // KID_AUTH_SECRET was rotated: the PIN was already proven, so re-derive.
    await admin.auth.admin.updateUserById(r.user_id, { password: kidPassword(kidId) });
    ({ error: signInErr } = await supabase.auth.signInWithPassword({ email, password: kidPassword(kidId) }));
  }
  if (signInErr) return { error: "Something went wrong. Please try again." };
  redirect(`/k/${s.data}/home`);
}

"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getViewer } from "@/lib/auth/viewer";
import { toDbAvatar } from "@/features/kids/avatar";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { kidPassword } from "@/lib/auth/kid-credentials";
import { pinSchema, slugSchema, usernameSchema } from "@/lib/validation";
import type { ActionState } from "@/components/ui/action-form";

/** Kid sign-in from the one sign-in page: username + picture PIN, no club needed. */
export async function kidSignInAnywhere(_prev: ActionState, data: FormData): Promise<ActionState> {
  const u = usernameSchema.safeParse(data.get("username"));
  if (!u.success) return { error: "Type your username and tap your 4 pictures." };
  const { data: slug } = await supabaseAdmin().rpc("svc_kid_club_for_username", { p_username: u.data });
  // An unknown username still goes through the same slow PIN check, so it takes the same time.
  return kidSignIn(typeof slug === "string" && slug ? slug : "champzz-home", _prev, data);
}

const startSchema = z.object({
  firstName: z.string().trim().min(1, "Type your first name.").max(40).regex(/^[\p{L}' -]+$/u, "Use letters only."),
  pin: pinSchema,
});

/** A kid starts their own account. It stays locked until a grown-up approves it with the code. */
export async function startKidSignup(_prev: ActionState, data: FormData): Promise<ActionState> {
  const parsed = startSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]!.trim() || h.get("x-real-ip") || "unknown";
  const { data: rows, error } = await supabaseAdmin().rpc("svc_start_kid_signup", { p_first_name: parsed.data.firstName, p_pin: parsed.data.pin, p_ip: ip });
  const r = rows?.[0];
  if (error?.message.includes("too_many_signups")) return { error: "Lots of accounts were started on this device. Please try again later." };
  if (error || !r) return { error: "Something went wrong. Please try again." };
  redirect(`/start/done?u=${encodeURIComponent(r.username)}&c=${encodeURIComponent(r.code)}`);
}

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

const avatarSchema = z.object({
  skin: z.coerce.number().int().min(0).max(5),
  hair: z.coerce.number().int().min(0).max(5),
  hairColor: z.coerce.number().int().min(0).max(5),
  outfit: z.coerce.number().int().min(0).max(7),
  extra: z.enum(["none", "headband", "cape", "medal", "crown"]),
});

export async function saveMyChamp(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (viewer.kind !== "kid" || viewer.org.slug !== slug) return { error: "Please sign in again." };
  const parsed = avatarSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: "Something looks wrong. Try again." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("update_my_champ", { p_avatar: toDbAvatar(parsed.data) });
  if (error) return { error: error.message === "locked_item" ? "Keep playing to unlock that one!" : "Could not save. Try again." };
  revalidatePath(`/k/${slug}`, "layout");
  return { ok: "Saved! Looking great, Champ." };
}

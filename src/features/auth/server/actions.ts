"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getViewer, homeFor } from "@/lib/auth/viewer";
import { env } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ActionState } from "@/components/ui/action-form";

const USERNAME = /^[a-z0-9._]{3,24}$/;

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name.").max(120),
  username: z.string().trim().toLowerCase().regex(USERNAME, "Usernames are 3 to 24 letters, numbers, dots or underscores."),
  email: z.union([z.literal(""), z.email("Please enter a valid email.")]).optional(),
  password: z.string().min(8, "Use at least 8 characters.").max(128),
  next: z.string().optional(),
});

const signInSchema = z.object({
  login: z.string().trim().min(1, "Enter your username or email.").max(254),
  password: z.string().min(1, "Please enter your password.").max(128),
  next: z.string().optional(),
});

/** Username-only accounts get a private, never-mailed address so Supabase can key them. */
function usernameEmail(username: string): string {
  return `u-${username}@${env().KID_EMAIL_DOMAIN}`;
}

/** Only same-site paths, never an open redirect. */
function safeNext(next: string | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

export async function signUp(_prev: ActionState, data: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const d = parsed.data;
  const dest = safeNext(d.next) ?? "/onboarding";
  const supabase = await supabaseServer();

  // No email: create a ready-to-use account straight away, no confirmation step.
  if (!d.email) {
    const { error } = await supabaseAdmin().auth.admin.createUser({
      email: usernameEmail(d.username),
      password: d.password,
      email_confirm: true,
      user_metadata: { full_name: d.fullName, username: d.username },
    });
    if (error) return { error: /already|exists|registered/i.test(error.message) ? "That username is taken. Try another." : "We could not create your account. Please try again." };
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: usernameEmail(d.username), password: d.password });
    if (signInErr) return { error: "Account made. Please sign in." };
    redirect(dest);
  }

  const { data: res, error } = await supabase.auth.signUp({
    email: d.email,
    password: d.password,
    options: {
      data: { full_name: d.fullName, username: d.username },
      emailRedirectTo: `${env().APP_URL}/auth/callback?next=${encodeURIComponent(dest)}`,
    },
  });
  if (error) {
    if (error.code === "user_already_exists") return { error: "An account with that email already exists. Sign in instead, or reset your password." };
    if (error.code === "over_email_send_rate_limit") return { error: "Too many emails just now. Wait a minute, then try again." };
    return { error: "We could not create your account. Please try again." };
  }
  // Supabase hides existing accounts: no identities means the email is already registered and no mail was sent.
  if (res.user && (res.user.identities?.length ?? 0) === 0) return { error: "An account with that email already exists. Sign in instead, or reset your password." };
  if (!res.session) return { ok: `We sent a confirmation link to ${d.email}. Check spam too. No email? Use "Resend" below.` };
  redirect(dest);
}

const resendSchema = z.object({ email: z.email("Please enter a valid email.") });

export async function resendConfirmation(_prev: ActionState, data: FormData): Promise<ActionState> {
  const parsed = resendSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the email." };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${env().APP_URL}/auth/callback?next=%2Fonboarding` },
  });
  if (error) return { error: error.code === "over_email_send_rate_limit" ? "Please wait a minute before asking again." : "We could not resend right now. Please try again shortly." };
  return { ok: `If ${parsed.data.email} still needs confirming, a fresh link is on its way.` };
}

export async function signIn(_prev: ActionState, data: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const login = parsed.data.login;
  const email = login.includes("@") ? login : usernameEmail(login.toLowerCase());
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error) {
    if (error.code === "email_not_confirmed") return { error: "Please confirm your email first. Check your inbox, or resend the link from the sign-up page." };
    return { error: "That username/email and password do not match." };
  }
  const next = safeNext(parsed.data.next);
  if (next) redirect(next);
  const viewer = await getViewer();
  redirect(viewer.kind === "adult" ? homeFor(viewer) : "/");
}

export async function signOut(): Promise<void> {
  const supabase = await supabaseServer();
  const viewer = await getViewer();
  await supabase.auth.signOut();
  redirect(viewer.kind === "kid" ? `/k/${viewer.org.slug}` : "/login");
}

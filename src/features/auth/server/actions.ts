"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getViewer, homeFor } from "@/lib/auth/viewer";
import { env } from "@/lib/env";
import type { ActionState } from "@/components/ui/action-form";

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email."),
  password: z.string().min(10, "Use at least 10 characters.").max(128),
  next: z.string().optional(),
});

const signInSchema = z.object({
  email: z.email("Please enter a valid email."),
  password: z.string().min(1, "Please enter your password.").max(128),
  next: z.string().optional(),
});

/** Only same-site paths, never an open redirect. */
function safeNext(next: string | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}

export async function signUp(_prev: ActionState, data: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const supabase = await supabaseServer();
  const { data: res, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${env().APP_URL}/auth/callback?next=${encodeURIComponent(safeNext(parsed.data.next) ?? "/onboarding")}`,
    },
  });
  if (error) return { error: error.code === "user_already_exists" ? "An account with that email already exists. Sign in instead." : "We could not create your account. Please try again." };
  if (!res.session) return { ok: "Check your email to confirm your account, then sign in." };
  redirect(safeNext(parsed.data.next) ?? "/onboarding");
}

export async function signIn(_prev: ActionState, data: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return { error: "That email and password do not match." };
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

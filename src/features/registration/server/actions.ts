"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdult } from "@/lib/auth/viewer";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { kidEmail, kidPassword } from "@/lib/auth/kid-credentials";
import { friendlyError } from "@/lib/errors";
import { POLICY_VERSION, pinSchema } from "@/lib/validation";
import type { ActionState } from "@/components/ui/action-form";

const joinSchema = z.object({
  joinCode: z.string().trim().toUpperCase().regex(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/, "Join codes look like ABCD-2345."),
  firstName: z.string().trim().min(1, "Enter your child's first name.").max(40).regex(/^[\p{L}' -]+$/u, "Use letters only."),
  lastInitial: z.string().trim().max(1).regex(/^[A-Za-z]?$/, "Just the first letter of the surname.").optional(),
  pin: pinSchema,
  consent: z.literal("on", { error: "Please tick the consent box to continue." }),
  photos: z.literal("on").optional(),
});

/**
 * A verified parent adds their child to an org. The database does the hard
 * part atomically (code check, org status, caps, consent, PIN hash); this
 * creates the kid's own auth user around it and cleans up if that fails.
 */
export async function registerKid(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const viewer = await requireAdult(`/c/${slug}`);
  if (!viewer.emailConfirmed) return { error: "Please confirm your email address first, then try again." };
  const parsed = joinSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const d = parsed.data;

  const app = supabaseAdmin();
  const { data: rows, error } = await app.rpc("svc_register_kid", {
    p_parent: viewer.userId,
    p_join_code: d.joinCode,
    p_first_name: d.firstName,
    p_last_initial: d.lastInitial ?? "",
    p_class_id: null as unknown as string,
    p_pin: d.pin,
    p_policy_version: POLICY_VERSION,
    p_scopes: { photos: d.photos === "on" },
  });
  if (error || !rows?.[0]) return { error: friendlyError(error) };
  const kid = rows[0];

  const admin = supabaseAdmin();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: kidEmail(kid.kid_id),
    password: kidPassword(kid.kid_id),
    email_confirm: true,
    app_metadata: { kind: "kid", kid_id: kid.kid_id, organization_id: kid.organization_id },
  });
  if (createErr || !created.user) {
    await app.rpc("svc_discard_kid", { p_kid: kid.kid_id });
    return { error: "We could not finish adding your child. Please try again." };
  }
  await app.rpc("svc_attach_kid_user", { p_kid: kid.kid_id, p_user: created.user.id });
  await admin.from("memberships").upsert(
    { organization_id: kid.organization_id, user_id: viewer.userId, role: "parent" },
    { onConflict: "organization_id,user_id,role", ignoreDuplicates: true },
  );
  redirect(`/p?added=${encodeURIComponent(kid.username)}&club=${encodeURIComponent(slug)}`);
}

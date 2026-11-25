import { expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { testEnv } from "./env";

const e = testEnv();
export const admin = createClient(e.NEXT_PUBLIC_SUPABASE_URL!, e.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
export const WEBHOOK_HASH = e.FLUTTERWAVE_WEBHOOK_HASH!;
export const PASSWORD = "correct-horse-battery";

export function uniq(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

/** An adult account with a confirmed email, created directly (fixture). */
export async function createAdult(name: string): Promise<{ id: string; email: string }> {
  const email = `${uniq(name.toLowerCase().replace(/[^a-z]/g, ""))}@test.champzz.local`;
  const { data, error } = await admin.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { full_name: name } });
  if (error || !data.user) throw error ?? new Error("user");
  return { id: data.user.id, email };
}

export async function createPlatformAdmin() {
  const u = await createAdult("Banks");
  const { error } = await admin.from("platform_admins").insert({ user_id: u.id });
  if (error) throw error;
  return u;
}

/** An org that has already paid (fixture), with an Org Admin and optional teacher. */
export async function createActiveOrg(opts: { kidLimit?: number; plan?: string } = {}) {
  const owner = await createAdult("Owner");
  const slug = uniq("club");
  const { data: org, error } = await admin.from("organizations").insert({ slug, name: `Club ${slug}`, kind: "church", created_by: owner.id }).select("id").single();
  if (error || !org) throw error;
  await admin.from("org_branding").insert({ organization_id: org.id });
  await admin.from("memberships").insert({ organization_id: org.id, user_id: owner.id, role: "org_admin" });
  const { data: plan } = await admin.from("plans").select("id").eq("code", opts.plan ?? "starter").single();
  const { error: payErr } = await admin.rpc("svc_apply_payment", {
    p_org: org.id, p_plan: plan!.id, p_interval: "month", p_currency: "NGN", p_amount_minor: 2000000,
    p_period_end: new Date(Date.now() + 30 * 86_400_000).toISOString(), p_provider: "manual", p_method: "cash", p_ref: uniq("fixture"),
  });
  if (payErr) throw payErr;
  if (opts.kidLimit) await admin.from("subscriptions").update({ kid_limit_override: opts.kidLimit }).eq("organization_id", org.id);
  return { id: org.id, slug, owner, joinCode: await joinCode(org.id) };
}

export async function joinCode(orgId: string): Promise<string> {
  const { data } = await admin.from("join_codes").select("code").eq("organization_id", orgId).eq("active", true).single();
  return data!.code;
}

export async function addTeacher(orgId: string) {
  const t = await createAdult("Teacher");
  await admin.from("memberships").insert({ organization_id: orgId, user_id: t.id, role: "teacher" });
  return t;
}

export async function signIn(page: Page, email: string, next?: string) {
  await page.goto(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((u) => u.pathname !== "/login");
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL((u) => u.pathname === "/login" || /^\/k\/[^/]+$/.test(u.pathname));
}

/** Our own alerts, not Next's hidden route announcer (which also has role=alert). */
export function alert(page: Page) {
  return page.locator('[role="alert"]:not(#__next-route-announcer__)');
}

export async function tapPin(page: Page, pin: number[]) {
  const names = ["Star", "Heart", "Sun", "Moon", "Ball", "Fish", "Tree", "House", "Rocket", "Flower", "Cloud", "Car"];
  for (const i of pin) await page.getByRole("button", { name: names[i]!, exact: true }).click();
}

/** A parent signs in and adds a child through the Clubhouse. Returns the kid's username, or null if refused. */
export async function registerViaClubhouse(page: Page, slug: string, code: string, firstName: string, pin = [0, 1, 2, 3]) {
  const parent = await createAdult("Parent");
  await signIn(page, parent.email, `/c/${slug}`);
  await expect(page.getByTestId("clubhouse-name")).toBeVisible();
  await page.getByLabel("Join code").fill(code);
  await page.getByLabel("Child's first name").fill(firstName);
  await page.getByLabel("Surname initial").fill("T");
  await tapPin(page, pin);
  await page.getByRole("checkbox", { name: /I am this child/ }).check();
  await page.getByRole("button", { name: "Add my child" }).click();
  return parent;
}

export async function kidSignIn(page: Page, slug: string, username: string, pin: number[]) {
  await page.goto(`/k/${slug}`);
  await page.getByLabel("Your username").fill(username);
  await tapPin(page, pin);
  await page.getByRole("button", { name: "Let's go" }).click();
}

import { expect, test } from "@playwright/test";
import { PASSWORD, WEBHOOK_HASH, admin, createAdult, createPlatformAdmin, signIn, signOut, uniq } from "./helpers";

async function signUpAndCreateOrg(page: import("@playwright/test").Page) {
  const email = `${uniq("founder")}@test.champzz.local`;
  const slug = uniq("club");
  await page.goto("/signup");
  await page.getByLabel("Your name").fill("Funmi Founder");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByLabel("Club or ministry name").fill("Sunrise Kids Club");
  await page.getByLabel("Web address").fill(slug);
  await page.getByRole("button", { name: "Create my club" }).click();
  await expect(page).toHaveURL(new RegExp(`/o/${slug}$`));
  await expect(page.getByTestId("org-status")).toHaveText("pending");
  await expect(page.getByTestId("join-code")).toHaveCount(0);
  return { email, slug };
}

test("sign up -> pending -> active by online payment (hosted checkout and redirect)", async ({ page }) => {
  const { slug } = await signUpAndCreateOrg(page);
  await page.getByText("Starter", { exact: true }).click();
  await page.getByRole("button", { name: "Pay online" }).click();
  await expect(page.getByRole("heading", { name: "Fake Flutterwave checkout" })).toBeVisible();
  await page.getByRole("button", { name: "Pay now" }).click();
  await expect(page).toHaveURL(new RegExp(`/o/${slug}\\?paid=1$`));
  await expect(page.getByTestId("org-status")).toHaveText("active");
  await expect(page.getByTestId("join-code")).toHaveText(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
});

test("online payment by webhook alone: verified, idempotent, forged hash refused", async ({ page, request }) => {
  const { slug } = await signUpAndCreateOrg(page);
  await page.getByRole("button", { name: "Pay online" }).click();
  await expect(page.getByRole("heading", { name: "Fake Flutterwave checkout" })).toBeVisible();
  const txRef = decodeURIComponent(new URL(page.url()).pathname.split("/").pop()!);
  // The customer pays but never comes back (closed the tab). Only the webhook arrives.
  const settled = await (await request.post(`http://localhost:3999/__settle/${encodeURIComponent(txRef)}`)).json();
  const body = { event: "charge.completed", data: { id: settled.id, tx_ref: txRef, amount: settled.amount, currency: settled.currency, status: "successful" } };

  const forged = await request.post("/api/webhooks/flutterwave", { data: body, headers: { "verif-hash": "wrong" } });
  expect(forged.status()).toBe(401);
  const { data: before } = await admin.from("organizations").select("status").eq("slug", slug).single();
  expect(before!.status).toBe("pending");

  const ok = await request.post("/api/webhooks/flutterwave", { data: body, headers: { "verif-hash": WEBHOOK_HASH } });
  expect(ok.status()).toBe(200);
  expect((await ok.json()).result).toBe("applied");
  const again = await request.post("/api/webhooks/flutterwave", { data: body, headers: { "verif-hash": WEBHOOK_HASH } });
  expect((await again.json()).duplicate).toBe(true);

  const { data: org } = await admin.from("organizations").select("id, status").eq("slug", slug).single();
  expect(org!.status).toBe("active");
  const { count } = await admin.from("payments").select("id", { count: "exact", head: true }).eq("organization_id", org!.id);
  expect(count).toBe(1);

  await page.goto(`/o/${slug}`);
  await expect(page.getByTestId("org-status")).toHaveText("active");
});

test("webhook with a mismatched amount does not activate", async ({ page, request }) => {
  const { slug } = await signUpAndCreateOrg(page);
  await page.getByRole("button", { name: "Pay online" }).click();
  await expect(page.getByRole("heading", { name: "Fake Flutterwave checkout" })).toBeVisible();
  const txRef = decodeURIComponent(new URL(page.url()).pathname.split("/").pop()!);
  const { data: org } = await admin.from("organizations").select("id").eq("slug", slug).single();
  // Tamper: our own record now expects more than the customer paid.
  await admin.from("checkout_sessions").update({ amount_minor: 999_999_999 }).eq("tx_ref", txRef);
  const settled = await (await request.post(`http://localhost:3999/__settle/${encodeURIComponent(txRef)}`)).json();
  const res = await request.post("/api/webhooks/flutterwave", {
    data: { event: "charge.completed", data: { id: settled.id, tx_ref: txRef } },
    headers: { "verif-hash": WEBHOOK_HASH },
  });
  expect(res.status()).toBe(200);
  expect((await res.json()).result).toBe("ignored");
  const { data: after } = await admin.from("organizations").select("status").eq("id", org!.id).single();
  expect(after!.status).toBe("pending");
});

test("sign up -> pending -> active by Super Admin Mark as paid (offline payment)", async ({ page }) => {
  const { email, slug } = await signUpAndCreateOrg(page);
  await signOut(page);
  const banks = await createPlatformAdmin();
  await signIn(page, banks.email);
  await expect(page).toHaveURL(/\/console$/);
  await expect(page.getByTestId("console-orgs")).toContainText(slug);
  const { data: org } = await admin.from("organizations").select("id").eq("slug", slug).single();
  await page.goto(`/console/orgs/${org!.id}`);
  await expect(page.getByTestId("console-org-status")).toHaveText("pending");
  await page.getByLabel("Plan").selectOption({ label: "Basic (150 kids)" });
  await page.getByLabel("Amount received").fill("45000");
  await page.getByLabel("Note (optional)").fill("Bank transfer seen");
  await page.getByRole("button", { name: "Mark as paid" }).click();
  await expect(page.getByText("Marked as paid. The org is active.")).toBeVisible();
  await expect(page.getByTestId("console-org-status")).toHaveText("active");

  const { data: pay } = await admin.from("payments").select("provider, method, approved_by, approved_at").eq("organization_id", org!.id).single();
  expect(pay).toMatchObject({ provider: "manual", method: "bank_transfer", approved_by: banks.id });
  expect(pay!.approved_at).not.toBeNull();

  await signOut(page);
  await signIn(page, email);
  await expect(page.getByTestId("org-status")).toHaveText("active");
  await expect(page.getByTestId("join-code")).toBeVisible();
});

test("only a Super Admin can open the console", async ({ page }) => {
  const someone = await createAdult("Nosy");
  await signIn(page, someone.email);
  const res = await page.goto("/console");
  expect(res?.status()).toBe(404);
});

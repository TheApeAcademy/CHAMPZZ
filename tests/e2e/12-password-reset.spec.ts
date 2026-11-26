import { expect, test } from "@playwright/test";
import { alert, createActiveOrg, createAdult, PASSWORD } from "./helpers";

// Local Supabase captures outgoing mail in Mailpit (supabase/config.jsonc local_smtp).
const MAILPIT = "http://127.0.0.1:54324";

async function resetLinkFor(email: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const res = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`);
    const { messages } = (await res.json()) as { messages: { ID: string }[] };
    if (messages?.length) {
      const msg = (await (await fetch(`${MAILPIT}/api/v1/message/${messages[0]!.ID}`)).json()) as { HTML: string; Text: string };
      const m = (msg.HTML || msg.Text).match(/href="([^"]+)"/) ?? (msg.Text || "").match(/(https?:\/\/\S+verify\S+)/);
      if (m) return m[1]!.replace(/&amp;/g, "&");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("no reset email");
}

test("forgot password: email link, new password, old one stops working", async ({ page }) => {
  const org = await createActiveOrg();
  const email = org.owner.email;

  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("a reset link is on its way")).toBeVisible();

  await page.goto(await resetLinkFor(email));
  await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
  await page.getByLabel("New password").fill("brand-new-password-1");
  await page.getByLabel("Type it again").fill("different-password-1");
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(alert(page)).toContainText("do not match");
  await page.getByLabel("New password").fill("brand-new-password-1");
  await page.getByLabel("Type it again").fill("brand-new-password-1");
  await page.getByRole("button", { name: "Save new password" }).click();
  await page.waitForURL(`**/o/${org.slug}`);

  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("**/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(alert(page)).toContainText("do not match");
  await page.getByLabel("Password").fill("brand-new-password-1");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(`**/o/${org.slug}`);
});

test("forgot password never reveals whether an account exists", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill("nobody-here@test.champzz.local");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("If that email has a Champzz account, a reset link is on its way")).toBeVisible();
});

test("the reset page refuses without a valid link", async ({ page }) => {
  await createAdult("Nobody");
  await page.goto("/reset-password");
  await expect(page.getByText("This reset link has expired or was already used.")).toBeVisible();
  await page.goto("/auth/callback?token_hash=bogus&type=recovery&next=/reset-password");
  await expect(page.getByText("That link has expired or was already used.")).toBeVisible();
});

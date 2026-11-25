import { expect, test, type Page } from "@playwright/test";
import { addTeacher, createActiveOrg, kidSignIn, registerViaClubhouse, signIn, signOut } from "./helpers";

const PNG_1PX = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const FAKE = "http://localhost:3999/anthropic/last";

async function newKid(page: Page, slug: string, code: string, name: string, pin: number[]) {
  const parent = await registerViaClubhouse(page, slug, code, name, pin);
  const username = await page.getByTestId("new-username").innerText();
  await signOut(page);
  return { parent, username };
}

test("Faith Quest, private journal, Champ collection", async ({ page }) => {
  const org = await createActiveOrg();
  const { username } = await newKid(page, org.slug, org.joinCode, "Ife", [0, 1, 2, 3]);
  await kidSignIn(page, org.slug, username, [0, 1, 2, 3]);

  await page.goto(`/k/${org.slug}/quest`);
  await expect(page.getByRole("heading", { name: "Faith Quest" })).toBeVisible();
  await page.getByTestId("quest-list").getByRole("link", { name: /Brave like David/ }).click();
  const cp = page.getByTestId("checkpoint");
  await cp.getByRole("button", { name: "Building boats" }).click();
  await expect(cp.getByRole("status")).toContainText("Not quite");
  await cp.getByRole("button", { name: "Looking after sheep" }).click();
  await expect(page.locator('[data-step="1"]')).toHaveAttribute("data-done", "yes");
  await expect(page.locator('[data-step="2"]').getByTestId("checkpoint")).toBeVisible();
  await expect(page.locator('[data-step="3"]')).toContainText("Finish the step before this one");

  await page.goto(`/k/${org.slug}/journal`);
  await expect(page.getByTestId("journal-private")).toContainText("Only you can read this");
  await expect(page.getByTestId("pray-for")).toBeVisible();
  await page.getByLabel("Write it here").fill("For my grandma to feel better");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("journal-list")).toContainText("For my grandma");
  await page.getByRole("button", { name: "Mark as answered" }).click();
  await expect(page.getByTestId("journal-list")).toContainText("Answered!");

  // 5 (visit) + 10 (checkpoint) = 15: Spark only
  await page.goto(`/k/${org.slug}/collection`);
  await expect(page.getByTestId("collection-count")).toHaveText("1 of 12 collected");
  await expect(page.locator('[data-code="spark"]')).toHaveAttribute("data-unlocked", "yes");
  await expect(page.locator('[data-code="sunny"]')).toHaveAttribute("data-unlocked", "no");
});

test("My Stuff: a picture is checked by a grown-up before parents see it", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  const { parent, username } = await newKid(page, org.slug, org.joinCode, "Jide", [4, 5, 6, 7]);

  await kidSignIn(page, org.slug, username, [4, 5, 6, 7]);
  await page.goto(`/k/${org.slug}/stuff`);
  await page.getByLabel(/^Picture/).setInputFiles({ name: "x.png", mimeType: "image/png", buffer: Buffer.from("<svg onload=alert(1)>") });
  await page.getByRole("button", { name: "Send to My Stuff" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Use a PNG, JPG or WebP picture." })).toBeVisible();
  await page.getByLabel(/^Picture/).setInputFiles({ name: "x.png", mimeType: "image/png", buffer: PNG_1PX });
  await page.getByLabel("Title (optional)").fill("My rocket");
  await page.getByRole("button", { name: "Send to My Stuff" }).click();
  await expect(page.getByRole("status")).toContainText("A grown-up will check it");
  await page.reload();
  await expect(page.locator('[data-status="pending"]')).toContainText("Waiting for a grown-up");
  await signOut(page);

  await signIn(page, parent.email);
  await page.getByTestId(`progress-link-${username}`).click();
  await expect(page.getByTestId("parent-stuff")).toHaveCount(0);
  await signOut(page);

  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/moderation`);
  await expect(page.getByTestId("moderation-list")).toContainText("My rocket");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByTestId("moderation-list")).toContainText("All checked!");
  await signOut(page);

  await signIn(page, parent.email);
  await page.getByTestId(`progress-link-${username}`).click();
  const img = page.getByTestId("parent-stuff").getByRole("img", { name: "My rocket" });
  await expect(img).toBeVisible();
  const src = await img.getAttribute("src");
  expect(src).toContain("/storage/v1/object/sign/kid-uploads/");
  expect((await page.request.get(src!)).status()).toBe(200);
  // the bucket is private: the plain path does not work
  expect((await page.request.get(src!.replace("/object/sign/", "/object/public/").split("?")[0]!)).status()).not.toBe(200);
});

test("Champ Buddy: Pro plan, club switch and parent consent; names never sent; distress never reaches the AI", async ({ page }) => {
  const starter = await createActiveOrg();
  await signIn(page, starter.owner.email);
  await page.goto(`/o/${starter.slug}/settings`);
  await expect(page.getByTestId("buddy-plan")).toContainText("Pro plan");
  await signOut(page);

  const org = await createActiveOrg({ plan: "pro" });
  const { parent, username } = await newKid(page, org.slug, org.joinCode, "Kemi", [8, 9, 10, 11]);

  await kidSignIn(page, org.slug, username, [8, 9, 10, 11]);
  await page.goto(`/k/${org.slug}/buddy`);
  await expect(page.getByTestId("buddy-off")).toContainText("not switched on at your club");
  await signOut(page);

  await signIn(page, org.owner.email);
  await page.goto(`/o/${org.slug}/settings`);
  await page.getByLabel("Switch on Champ Buddy for our club").check();
  await page.getByRole("button", { name: "Save", exact: true }).last().click();
  await expect(page.getByText("Champ Buddy setting saved.")).toBeVisible();
  await signOut(page);

  await kidSignIn(page, org.slug, username, [8, 9, 10, 11]);
  await page.goto(`/k/${org.slug}/buddy`);
  await expect(page.getByTestId("buddy-off")).toContainText("needs a yes from your parent");
  await signOut(page);

  await signIn(page, parent.email);
  await page.getByTestId(`progress-link-${username}`).click();
  await page.getByRole("button", { name: "Yes, Kemi may use Champ Buddy" }).click();
  await expect(page.getByTestId("buddy-consent")).toContainText("You have said yes");
  await signOut(page);

  await kidSignIn(page, org.slug, username, [8, 9, 10, 11]);
  await page.goto(`/k/${org.slug}/buddy`);
  await page.getByLabel("Ask Champ Buddy").fill("Hi, I'm Kemi. Why are rainbows colourful?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("buddy-thread")).toContainText("Rainbows happen when sunlight shines");
  const sent = await (await page.request.get(FAKE)).json();
  expect(sent.body.model).toBe("claude-opus-5-5");
  expect(sent.body.fallbacks).toBe("default");
  expect(sent.body.output_config.effort).toBe("low");
  expect(sent.body.system).toContain("Champ Buddy");
  // the system prompt and everything we add never carry the child's name, username or club
  expect(JSON.stringify(sent.body.system)).not.toContain("Kemi");
  expect(JSON.stringify(sent.body)).not.toContain(username);
  expect(JSON.stringify(sent.body)).not.toContain(org.slug);

  await page.getByLabel("Ask Champ Buddy").fill("someone hits me at home and I am scared");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("buddy-thread")).toContainText("Please tell a trusted grown-up right now");
  const after = await (await page.request.get(FAKE)).json();
  expect(JSON.stringify(after.body)).not.toContain("hits me");

  await page.getByLabel("Ask Champ Buddy").fill("my number is 0803 123 4567");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("buddy-thread")).toContainText("keep personal things like phone numbers");
  await signOut(page);

  await signIn(page, org.owner.email);
  await expect(page.getByTestId("bell")).not.toHaveAttribute("data-urgent", "0");
  await page.goto(`/o/${org.slug}/buddy`);
  await expect(page.getByTestId("buddy-flagged")).toContainText("someone hits me at home");
  await page.goto(`/o/${org.slug}/audit`);
  await expect(page.getByTestId("audit-table")).toContainText("ai.consent_granted");
  await signOut(page);

  await signIn(page, parent.email);
  await page.getByTestId(`progress-link-${username}`).click();
  await expect(page.getByTestId("parent-buddy")).toContainText("Why are rainbows colourful?");
  await expect(page.getByTestId("parent-buddy")).toContainText("(flagged for the club)");
});

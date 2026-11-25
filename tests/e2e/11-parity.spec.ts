import { expect, test, type Page } from "@playwright/test";
import { addTeacher, createActiveOrg, kidSignIn, registerViaClubhouse, signIn, signOut } from "./helpers";

const PNG_1PX = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");
// the first bytes of a WebM file are enough for the server's check
const WEBM = Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(400, 1)]);

async function newKid(page: Page, slug: string, code: string, name: string, pin: number[]) {
  const parent = await registerViaClubhouse(page, slug, code, name, pin);
  const username = await page.getByTestId("new-username").innerText();
  await signOut(page);
  return { parent, username };
}

test("Clubhouse posts: published news is public, drafts are not", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/posts`);
  await page.getByLabel("Title").fill("Fun day this Saturday");
  await page.getByLabel("Post", { exact: true }).fill("Games, snacks and a big quiz. Bring a friend!");
  await page.getByRole("button", { name: "Save post" }).click();
  await expect(page.getByTestId("post-list")).toContainText("Fun day this Saturday");
  await page.getByLabel("Title").fill("Secret draft");
  await page.getByLabel("Post", { exact: true }).fill("Not ready");
  await page.getByLabel("Publish on the Clubhouse now").uncheck();
  await page.getByRole("button", { name: "Save post" }).click();
  await expect(page.getByTestId("post-list")).toContainText("Secret draft");
  await signOut(page);

  await page.goto(`/c/${org.slug}`);
  await expect(page.getByTestId("clubhouse-posts")).toContainText("Fun day this Saturday");
  await expect(page.getByTestId("clubhouse-posts")).not.toContainText("Secret draft");
});

test("Reading plan: tick off every day, earn a certificate", async ({ page }) => {
  const org = await createActiveOrg();
  const { username } = await newKid(page, org.slug, org.joinCode, "Lola", [0, 1, 2, 3]);
  await kidSignIn(page, org.slug, username, [0, 1, 2, 3]);
  await page.goto(`/k/${org.slug}/reading`);
  const plan = page.getByTestId("plan-Brave hearts: 5 Psalms");
  for (let i = 0; i < 5; i++) {
    await plan.getByRole("button", { name: "I read it" }).first().click();
    await expect(plan).toContainText(`(${i + 1} of 5)`);
  }
  await page.goto(`/k/${org.slug}/trophies`);
  await expect(page.getByTestId("kid-certificates")).toContainText("Reading plan: Brave hearts: 5 Psalms");
  await page.goto(`/k/${org.slug}/home`);
  await expect(page.getByTestId("kid-points")).toHaveText("30 Champ Points");
});

test("Digital Bank: staff files stay with staff, shared files reach families", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  const { parent } = await newKid(page, org.slug, org.joinCode, "Musa", [4, 5, 6, 7]);

  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/media`);
  await page.getByLabel("Title").fill("Team rota");
  await page.getByLabel(/^File/).setInputFiles({ name: "rota.pdf", mimeType: "application/pdf", buffer: PDF });
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(page.getByTestId("media-list")).toContainText("Team rota");
  await page.getByLabel("Title").fill("Colouring page");
  await page.getByLabel("Who can see it").selectOption("families");
  await page.getByLabel(/^File/).setInputFiles({ name: "colour.png", mimeType: "image/png", buffer: PNG_1PX });
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(page.getByTestId("media-list")).toContainText("Shared with families");
  await page.getByLabel("Title").fill("Fake");
  await page.getByLabel(/^File/).setInputFiles({ name: "x.pdf", mimeType: "application/pdf", buffer: Buffer.from("<html>not a pdf</html>") });
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Use a PDF, PNG, JPG or WebP file." })).toBeVisible();
  const rotaHref = await page.getByRole("link", { name: "Team rota" }).getAttribute("href");
  const pdf = await page.request.get(rotaHref!);
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await signOut(page);

  await signIn(page, parent.email);
  await expect(page.getByTestId("parent-files")).toContainText("Colouring page");
  await expect(page.getByTestId("parent-files")).not.toContainText("Team rota");
  expect((await page.request.get(rotaHref!, { maxRedirects: 0 })).status()).toBe(404);
  const colourHref = await page.getByTestId("parent-files").getByRole("link", { name: "Colouring page" }).getAttribute("href");
  expect((await page.request.get(colourHref!)).status()).toBe(200);
});

test("Record-a-verse: a kid sends a recording, the teacher listens and gives a star", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  const { username } = await newKid(page, org.slug, org.joinCode, "Nkem", [8, 9, 10, 11]);

  await kidSignIn(page, org.slug, username, [8, 9, 10, 11]);
  await page.goto(`/k/${org.slug}/verse`);
  await page.getByLabel("Or choose a recording").setInputFiles({ name: "x.webm", mimeType: "audio/webm", buffer: Buffer.from("not audio at all") });
  await page.getByRole("button", { name: "Send to my teacher" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "does not look like a recording" })).toBeVisible();
  await page.getByLabel("Or choose a recording").setInputFiles({ name: "verse.webm", mimeType: "audio/webm", buffer: WEBM });
  await page.getByRole("button", { name: "Send to my teacher" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Sent to your teacher" })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("my-recordings")).toContainText("Waiting for your teacher");
  await signOut(page);

  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/verses`);
  await expect(page.getByTestId("verse-list").locator("audio")).toHaveCount(1);
  await page.getByRole("button", { name: "Give a star" }).click();
  await expect(page.getByTestId("verse-list")).toContainText("No new recordings.");
  await signOut(page);

  await kidSignIn(page, org.slug, username, [8, 9, 10, 11]);
  await expect(page.getByTestId("kid-points")).toHaveText("15 Champ Points");
  await page.goto(`/k/${org.slug}/verse`);
  await expect(page.getByTestId("my-recordings")).toContainText("Your teacher listened!");
});

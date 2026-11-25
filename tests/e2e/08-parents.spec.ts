import { expect, test } from "@playwright/test";
import { addTeacher, createActiveOrg, createAdult, kidSignIn, registerViaClubhouse, signIn, signOut } from "./helpers";

test("parents: Take-Home card, progress page, weekly report, other parents shut out", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  const parent = await registerViaClubhouse(page, org.slug, org.joinCode, "Dami", [0, 1, 2, 3]);
  const username = await page.getByTestId("new-username").innerText();
  await signOut(page);

  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/lessons`);
  await page.getByLabel("Title").fill("Never give up");
  await page.getByLabel("What kids will read").fill("Champs keep going.");
  await page.getByLabel("Talk: a question to ask at home").fill("What is hard for you right now?");
  await page.getByLabel("Do: something to do together").fill("Build the tallest tower you can");
  await page.getByLabel(/^Pray: /).fill("Ask for strength to keep going");
  await page.getByLabel("Publish now so kids can see it").check();
  await page.getByRole("button", { name: "Save lesson" }).click();
  await expect(page.getByTestId("lesson-list")).toContainText("Never give up");
  await page.goto(`/o/${org.slug}`);
  await page.getByTestId(`kid-${username}`).getByRole("button", { name: "Give a star" }).click();
  await expect(page.getByTestId(`kid-${username}`).getByText(/Star given/)).toBeVisible();
  await signOut(page);

  await kidSignIn(page, org.slug, username, [0, 1, 2, 3]);
  await page.goto(`/k/${org.slug}/class`);
  await expect(page.getByTestId("kid-lessons")).toContainText("Ask your family: What is hard for you right now?");
  await signOut(page);

  await signIn(page, parent.email);
  await page.getByTestId(`progress-link-${username}`).click();
  await expect(page.getByTestId("progress-name")).toHaveText("Dami T.");
  await expect(page.getByTestId("progress-points")).toHaveText("15");
  await expect(page.getByTestId("progress-level")).toHaveText("Rookie");
  await expect(page.getByRole("progressbar")).toBeVisible();
  await page.getByRole("link", { name: "This week's report" }).click();
  await expect(page.getByTestId("report-points")).toHaveText("15");
  await expect(page.getByTestId("report-stars")).toHaveText("1");
  await expect(page.getByTestId("report-visits")).toHaveText("1");
  await expect(page.getByTestId("report-trophies")).toContainText("Shining Star");
  const takeHome = page.getByTestId("report-takehome");
  await expect(takeHome).toContainText("Never give up");
  await expect(takeHome).toContainText("Build the tallest tower you can");
  await expect(takeHome).toContainText("Pray");
  await expect(page.getByRole("button", { name: "Print report" })).toBeVisible();
  const reportUrl = page.url();
  await page.getByRole("link", { name: "Previous week" }).click();
  await expect(page.getByTestId("report-points")).toHaveText("0");
  await expect(page.getByTestId("report-takehome")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Next week" })).toBeVisible();
  await signOut(page);

  // another parent cannot open this child's pages
  const stranger = await createAdult("Stranger");
  await signIn(page, stranger.email);
  expect((await page.goto(reportUrl))?.status()).toBe(404);
  expect((await page.goto(reportUrl.replace(/\/report$/, "")))?.status()).toBe(404);
});

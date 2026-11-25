import { expect, test, type Page } from "@playwright/test";
import { addTeacher, createActiveOrg, createPlatformAdmin, kidSignIn, registerViaClubhouse, signIn, signOut, alert } from "./helpers";

async function expectSignedOut(page: Page) {
  await expect(page).toHaveURL(/\/login$/);
  const res = await page.goto("/p");
  expect(new URL(page.url()).pathname).toBe("/login");
  expect(res?.ok()).toBeTruthy();
}

test("Super Admin signs in and out", async ({ page }) => {
  const banks = await createPlatformAdmin();
  await signIn(page, banks.email);
  await expect(page).toHaveURL(/\/console$/);
  await signOut(page);
  await expectSignedOut(page);
});

test("Org Admin signs in and out", async ({ page }) => {
  const org = await createActiveOrg();
  await signIn(page, org.owner.email);
  await expect(page).toHaveURL(new RegExp(`/o/${org.slug}$`));
  await expect(page.getByRole("main").getByText("Org Admin", { exact: true })).toBeVisible();
  await signOut(page);
  await expectSignedOut(page);
});

test("Teacher signs in and out, and sees no billing", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  await signIn(page, teacher.email);
  await expect(page).toHaveURL(new RegExp(`/o/${org.slug}$`));
  await expect(page.getByRole("main").getByText("Teacher", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "New code" })).toHaveCount(0);
  await expect(page.getByText("Paid until")).toHaveCount(0);
  await signOut(page);
  await expectSignedOut(page);
});

test("Parent signs in and out", async ({ page }) => {
  const org = await createActiveOrg();
  const parent = await registerViaClubhouse(page, org.slug, org.joinCode, "Tobi");
  await signOut(page);
  await signIn(page, parent.email);
  await expect(page).toHaveURL(/\/p$/);
  await expect(page.getByTestId("parent-kids")).toContainText("Tobi");
  await signOut(page);
  await expectSignedOut(page);
});

test("Kid signs in with username + picture PIN and out", async ({ page }) => {
  const org = await createActiveOrg();
  await registerViaClubhouse(page, org.slug, org.joinCode, "Zara", [4, 7, 9, 11]);
  const username = await page.getByTestId("new-username").innerText();
  await signOut(page);
  await kidSignIn(page, org.slug, username, [4, 7, 9, 11]);
  await expect(page).toHaveURL(new RegExp(`/k/${org.slug}/home$`));
  await expect(page.getByTestId("kid-greeting")).toHaveText(/Hi, Zara!/i);
  await signOut(page);
  await expect(page).toHaveURL(new RegExp(`/k/${org.slug}$`));
  await page.goto(`/k/${org.slug}/home`);
  await expect(page).toHaveURL(new RegExp(`/k/${org.slug}$`));
});

test("Kid is locked out after 5 wrong PINs, and a teacher reset lets them back in", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  await registerViaClubhouse(page, org.slug, org.joinCode, "Femi", [0, 0, 0, 0]);
  const username = await page.getByTestId("new-username").innerText();
  await signOut(page);
  for (let i = 0; i < 4; i++) {
    await kidSignIn(page, org.slug, username, [1, 1, 1, 1]);
    await expect(alert(page)).toHaveText("That username and picture PIN do not match.");
  }
  await kidSignIn(page, org.slug, username, [1, 1, 1, 1]);
  await expect(alert(page)).toContainText("Too many tries");
  await kidSignIn(page, org.slug, username, [0, 0, 0, 0]);
  await expect(alert(page)).toContainText("Too many tries");

  await signIn(page, teacher.email);
  const row = page.getByTestId(`kid-${username}`);
  await row.getByText("Reset picture PIN").click();
  for (const name of ["Tree", "Tree", "Car", "Car"]) await row.getByRole("button", { name, exact: true }).click();
  await row.getByRole("button", { name: "Set new PIN" }).click();
  await expect(row.getByText("New PIN set. Any lockout is cleared.")).toBeVisible();
  await signOut(page);
  await kidSignIn(page, org.slug, username, [6, 6, 11, 11]);
  await expect(page.getByTestId("kid-greeting")).toBeVisible();
});

test("Wrong adult password is refused", async ({ page }) => {
  const org = await createActiveOrg();
  await page.goto("/login");
  await page.getByLabel("Email").fill(org.owner.email);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(alert(page)).toHaveText("That email and password do not match.");
});

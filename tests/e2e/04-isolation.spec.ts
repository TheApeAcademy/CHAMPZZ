import { expect, test } from "@playwright/test";
import { addTeacher, createActiveOrg, kidSignIn, registerViaClubhouse, signIn, signOut, alert } from "./helpers";

test("org A users of every role cannot reach org B", async ({ page }) => {
  const a = await createActiveOrg();
  const b = await createActiveOrg();
  const teacherA = await addTeacher(a.id);

  const parentA = await registerViaClubhouse(page, a.slug, a.joinCode, "Alpha", [0, 1, 2, 3]);
  const kidA = await page.getByTestId("new-username").innerText();
  await signOut(page);
  await registerViaClubhouse(page, b.slug, b.joinCode, "Bravo", [0, 1, 2, 3]);
  const kidB = await page.getByTestId("new-username").innerText();
  await signOut(page);

  // Org Admin A
  await signIn(page, a.owner.email);
  expect((await page.goto(`/o/${b.slug}`))?.status()).toBe(404);
  await page.goto(`/o/${a.slug}`);
  await expect(page.getByTestId("kid-list")).toContainText("Alpha");
  await expect(page.getByTestId("kid-list")).not.toContainText("Bravo");
  await signOut(page);

  // Teacher A
  await signIn(page, teacherA.email);
  expect((await page.goto(`/o/${b.slug}`))?.status()).toBe(404);
  await page.goto(`/o/${a.slug}`);
  await expect(page.getByTestId("kid-list")).not.toContainText("Bravo");
  await signOut(page);

  // Parent A
  await signIn(page, parentA.email);
  await expect(page.getByTestId("parent-kids")).toContainText("Alpha");
  await expect(page.getByTestId("parent-kids")).not.toContainText("Bravo");
  expect((await page.goto(`/o/${a.slug}`))?.status()).toBe(404);
  expect((await page.goto(`/o/${b.slug}`))?.status()).toBe(404);
  await page.goto("/p");
  await signOut(page);

  // Kid A: cannot use org B's kid area, and cannot sign in to org B with an org A username
  await kidSignIn(page, a.slug, kidA, [0, 1, 2, 3]);
  await expect(page.getByTestId("kid-greeting")).toBeVisible();
  await page.goto(`/k/${b.slug}/home`);
  await expect(page).toHaveURL(new RegExp(`/k/${b.slug}$`));
  await page.goto(`/k/${a.slug}/home`);
  await signOut(page);
  await kidSignIn(page, b.slug, kidA, [0, 1, 2, 3]);
  await expect(alert(page)).toHaveText("That username and picture PIN do not match.");
  await kidSignIn(page, b.slug, kidB, [0, 1, 2, 3]);
  await expect(page.getByTestId("kid-greeting")).toHaveText(/Bravo/i);
});

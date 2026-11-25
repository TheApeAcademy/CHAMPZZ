import { expect, test } from "@playwright/test";
import { admin, createActiveOrg, registerViaClubhouse, signIn, signOut, alert } from "./helpers";

// Runs last: it moves the clock forward for every org in the test database.
test("unpaid org: active -> grace -> read_only, data kept, writes blocked", async ({ page, request }) => {
  const org = await createActiveOrg();
  await registerViaClubhouse(page, org.slug, org.joinCode, "Keeper");
  await signOut(page);

  const day = 86_400_000;
  await request.post("/api/test/lifecycle", { data: { now: new Date(Date.now() + 31 * day).toISOString() } });
  await signIn(page, org.owner.email);
  await expect(page.getByTestId("org-status")).toHaveText("grace");
  await expect(page.getByText("Your plan has ended.")).toBeVisible();

  await request.post("/api/test/lifecycle", { data: { now: new Date(Date.now() + 39 * day).toISOString() } });
  await page.reload();
  await expect(page.getByTestId("org-status")).toHaveText("read_only");
  await expect(page.getByText("Nothing has been deleted.")).toBeVisible();
  await expect(page.getByTestId("kid-list")).toContainText("Keeper");

  await page.getByLabel("New class name").fill("Too late");
  await page.getByRole("button", { name: "Add class" }).click();
  await expect(alert(page)).toBeVisible();
  const { count } = await admin.from("classes").select("id", { count: "exact", head: true }).eq("organization_id", org.id);
  expect(count).toBe(0);
  const { count: kids } = await admin.from("kids").select("id", { count: "exact", head: true }).eq("organization_id", org.id);
  expect(kids).toBe(1);
});

import { expect, test } from "@playwright/test";
import { admin, createActiveOrg, createAdult, registerViaClubhouse, signIn, signOut, alert } from "./helpers";

test("kid registration with join code: active at once, 'new' until a teacher confirms", async ({ page }) => {
  const org = await createActiveOrg();
  await registerViaClubhouse(page, org.slug, org.joinCode, "Ada");
  await expect(page).toHaveURL(/\/p\?added=/);
  const username = await page.getByTestId("new-username").innerText();
  expect(username).toMatch(/^[a-z]+-[a-z]+-[0-9]{2}$/);
  await expect(page.getByTestId("parent-kids")).toContainText("Ada T.");
  await expect(page.getByTestId("parent-kids")).toContainText("New");

  await signOut(page);
  await signIn(page, org.owner.email);
  const row = page.getByTestId(`kid-${username}`);
  await expect(row).toContainText("New");
  await row.getByRole("button", { name: "Confirm" }).click();
  await expect(row).toContainText("Confirmed");

  const { data: consent } = await admin.from("consents").select("method, policy_version").eq("organization_id", org.id).single();
  expect(consent).toMatchObject({ method: "online" });
});

test("a forwarded code alone gets a stranger nothing: sign-in required, kid names never shown", async ({ page }) => {
  const org = await createActiveOrg();
  await registerViaClubhouse(page, org.slug, org.joinCode, "Ada");
  await signOut(page);
  await page.goto(`/c/${org.slug}`);
  await expect(page.getByRole("link", { name: "Create a parent account" })).toBeVisible();
  await expect(page.getByLabel("Join code")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("Ada");
});

test("registration is blocked at the kid limit and the Org Admin sees Upgrade", async ({ page }) => {
  const org = await createActiveOrg({ kidLimit: 1 });
  await registerViaClubhouse(page, org.slug, org.joinCode, "First");
  await expect(page).toHaveURL(/\/p\?added=/);
  await signOut(page);
  await registerViaClubhouse(page, org.slug, org.joinCode, "Second");
  await expect(alert(page)).toHaveText("This club is full right now. Ask the club leader.");
  await signOut(page);
  await signIn(page, org.owner.email);
  await expect(page.getByTestId("kid-count")).toContainText("1");
  await expect(page.getByTestId("upgrade-prompt")).toBeVisible();
});

test("the database cap holds under simultaneous registrations", async () => {
  const org = await createActiveOrg({ kidLimit: 3 });
  const parents = await Promise.all(Array.from({ length: 8 }, () => createAdult("Racer")));
  const results = await Promise.all(
    parents.map((p, i) =>
      admin.rpc("svc_register_kid", {
        p_parent: p.id, p_join_code: org.joinCode, p_first_name: `Racer${i}`, p_last_initial: "", p_class_id: null,
        p_pin: "1-2-3-4", p_policy_version: "test", p_scopes: {},
      }),
    ),
  );
  const ok = results.filter((r) => !r.error).length;
  const capped = results.filter((r) => r.error?.message === "kid_limit_reached").length;
  expect(ok).toBe(3);
  expect(capped).toBe(5);
  const { count } = await admin.from("kids").select("id", { count: "exact", head: true }).eq("organization_id", org.id).eq("status", "active");
  expect(count).toBe(3);
});

test("regenerating the join code kills the old one", async ({ page }) => {
  const org = await createActiveOrg();
  await signIn(page, org.owner.email);
  await expect(page.getByTestId("join-code")).toHaveText(org.joinCode);
  await page.getByRole("button", { name: "New code" }).click();
  await expect(page.getByTestId("join-code")).not.toHaveText(org.joinCode);
  await signOut(page);
  await registerViaClubhouse(page, org.slug, org.joinCode, "Late");
  await expect(alert(page)).toHaveText("That join code is not valid. Ask the club leader for the current one.");
});

test("approval mode: the kid waits until the Org Admin approves", async ({ page }) => {
  const org = await createActiveOrg();
  await signIn(page, org.owner.email);
  await page.getByLabel("How kids join").selectOption("approval");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Joining settings saved.")).toBeVisible();
  await signOut(page);
  await registerViaClubhouse(page, org.slug, org.joinCode, "Waiting");
  await expect(page.getByTestId("parent-kids")).toContainText("Waiting for the club to approve");
  const username = await page.getByTestId("new-username").innerText();
  await signOut(page);
  await signIn(page, org.owner.email);
  const row = page.getByTestId(`kid-${username}`);
  await row.getByRole("button", { name: "Approve" }).click();
  await expect(row).toContainText("New");
});

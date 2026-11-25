import { expect, test } from "@playwright/test";
import { addTeacher, admin, alert, createActiveOrg, kidSignIn, registerViaClubhouse, signIn, signOut } from "./helpers";

async function newKid(page: import("@playwright/test").Page, slug: string, code: string, name: string, pin: number[]) {
  const parent = await registerViaClubhouse(page, slug, code, name, pin);
  const username = await page.getByTestId("new-username").innerText();
  await signOut(page);
  return { parent, username };
}

test("daily visit, points, streak, Welcome trophy, teacher star, Shining Star", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  const { parent, username } = await newKid(page, org.slug, org.joinCode, "Ada", [0, 1, 2, 3]);

  await kidSignIn(page, org.slug, username, [0, 1, 2, 3]);
  await expect(page.getByTestId("kid-points")).toHaveText("5 Champ Points");
  await expect(page.getByTestId("kid-streak")).toHaveText("1");
  await expect(page.getByTestId("kid-trophies")).toHaveText("1");
  await expect(page.getByTestId("kid-level")).toHaveText("Rookie");
  await page.reload();
  await expect(page.getByTestId("kid-points")).toHaveText("5 Champ Points");
  await signOut(page);

  await signIn(page, teacher.email);
  const row = page.getByTestId(`kid-${username}`);
  await row.getByRole("button", { name: "Give a star" }).click();
  await expect(row.getByText("Star given! +10 Champ Points.")).toBeVisible();
  await expect(row.getByTestId("kid-points")).toHaveText("15 pts");
  await signOut(page);

  await kidSignIn(page, org.slug, username, [0, 1, 2, 3]);
  await expect(page.getByTestId("kid-points")).toHaveText("15 Champ Points");
  await page.getByRole("navigation", { name: "Champ Town" }).getByRole("link", { name: "Trophies" }).click();
  await expect(page.locator('[data-code="welcome"]')).toHaveAttribute("data-earned", "yes");
  await expect(page.locator('[data-code="first_star"]')).toHaveAttribute("data-earned", "yes");
  await expect(page.locator('[data-code="streak_7"]')).toHaveAttribute("data-earned", "no");
  await signOut(page);

  await signIn(page, parent.email);
  await expect(page.getByTestId(`parent-stats-${username}`)).toContainText("15");
});

test("Hall of Champs: own club only, new kids hidden until confirmed", async ({ page }) => {
  const org = await createActiveOrg();
  const other = await createActiveOrg();
  const a = await newKid(page, org.slug, org.joinCode, "Ada", [0, 1, 2, 3]);
  const b = await newKid(page, org.slug, org.joinCode, "Bola", [4, 5, 6, 7]);
  await newKid(page, other.slug, other.joinCode, "Stranger", [0, 1, 2, 3]);

  await kidSignIn(page, org.slug, a.username, [0, 1, 2, 3]);
  await page.getByRole("navigation", { name: "Champ Town" }).getByRole("link", { name: "Hall" }).click();
  const hall = page.getByTestId("hall-list");
  await expect(hall).toContainText("Ada T. (you)");
  await expect(hall).not.toContainText("Bola");
  await expect(hall).not.toContainText("Stranger");
  await expect(hall).not.toContainText(a.username);
  await signOut(page);

  await signIn(page, org.owner.email);
  await page.getByTestId(`kid-${b.username}`).getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByTestId(`kid-${b.username}`)).toContainText("Confirmed");
  await signOut(page);

  await kidSignIn(page, org.slug, a.username, [0, 1, 2, 3]);
  await page.goto(`/k/${org.slug}/hall`);
  await expect(page.getByTestId("hall-list")).toContainText("Bola T.");
  await expect(page.getByTestId("hall-list")).not.toContainText("Stranger");
});

test("My Champ saves, locked extras stay locked, Champ Card shows the kid", async ({ page }) => {
  const org = await createActiveOrg();
  const { username } = await newKid(page, org.slug, org.joinCode, "Zara", [8, 9, 10, 11]);
  await kidSignIn(page, org.slug, username, [8, 9, 10, 11]);
  await page.goto(`/k/${org.slug}/my-champ`);
  await expect(page.getByRole("button", { name: "Crown (unlocks at Champ)" })).toBeDisabled();
  await page.getByRole("button", { name: "Braids" }).click();
  await page.getByRole("button", { name: "Outfit 5" }).click();
  await page.getByRole("button", { name: "Save my Champ" }).click();
  await expect(page.getByText("Saved! Looking great, Champ.")).toBeVisible();
  const { data } = await admin.from("kids").select("avatar").eq("username", username).single();
  expect(data!.avatar).toMatchObject({ hair: "2", outfit: "4", extra: "none" });

  await page.goto(`/k/${org.slug}/card`);
  await expect(page.getByTestId("champ-card")).toContainText("Zara");
  await expect(page.getByTestId("champ-card")).toContainText(username);
});

test("Little Champs mode follows the class age band", async ({ page }) => {
  const org = await createActiveOrg();
  const { username } = await newKid(page, org.slug, org.joinCode, "Tiny", [1, 1, 2, 2]);
  const { data: cls } = await admin.from("classes").insert({ organization_id: org.id, name: "Tots", age_band: "little" }).select("id").single();
  await admin.from("kids").update({ class_id: cls!.id }).eq("username", username);
  await kidSignIn(page, org.slug, username, [1, 1, 2, 2]);
  await expect(page.locator("main")).toHaveAttribute("data-mode", "little");
});

test("teachers: name tags and Hall per class; a kid cannot open the staff pages", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  const { username } = await newKid(page, org.slug, org.joinCode, "Femi", [3, 3, 3, 3]);
  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/tags`);
  await expect(page.getByTestId("name-tags")).toContainText(username);
  await expect(page.getByTestId("name-tags")).not.toContainText("3-3-3-3");
  await page.goto(`/o/${org.slug}/hall`);
  await expect(page.getByText("Create a class first.")).toBeVisible();
  await page.goto(`/o/${org.slug}`);
  await signOut(page);

  await kidSignIn(page, org.slug, username, [3, 3, 3, 3]);
  const res = await page.goto(`/o/${org.slug}/tags`);
  expect(new URL(page.url()).pathname).toBe("/login");
  expect(res?.ok()).toBeTruthy();
  void alert;
});

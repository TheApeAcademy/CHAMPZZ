import { expect, test, type Page } from "@playwright/test";
import { addTeacher, createActiveOrg, createAdult, kidSignIn, registerViaClubhouse, signIn, signOut } from "./helpers";

const PNG_1PX = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

async function newKid(page: Page, slug: string, code: string, name: string, pin: number[]) {
  const parent = await registerViaClubhouse(page, slug, code, name, pin);
  const username = await page.getByTestId("new-username").innerText();
  await signOut(page);
  return { parent, username };
}

test("team: invite link, join, change role, remove; links work once", async ({ page }) => {
  const org = await createActiveOrg();
  const joiner = await createAdult("Joiner");

  await signIn(page, org.owner.email);
  await page.goto(`/o/${org.slug}/team`);
  await page.locator(`select[name="role"]`).first().selectOption("teacher");
  await page.getByRole("button", { name: "Create invite link" }).click();
  const link = await page.getByTestId("action-value").inputValue();
  expect(link).toMatch(/\/join\/[0-9a-f]{48}$/);
  await expect(page.getByTestId("invite-list")).toContainText("open");
  await signOut(page);

  const path = new URL(link).pathname;
  await page.goto(path);
  await expect(page.getByRole("heading", { name: "You have been invited" })).toBeVisible();
  await page.getByRole("main").getByRole("link", { name: "Sign in" }).click();
  await page.getByLabel("Email").fill(joiner.email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((u) => u.pathname === path);
  await page.getByRole("button", { name: "Accept invite" }).click();
  await page.waitForURL((u) => u.pathname === `/o/${org.slug}`);
  await signOut(page);

  // the same link cannot be used again, by anyone
  const other = await createAdult("Other");
  await signIn(page, other.email, path);
  await page.getByRole("button", { name: "Accept invite" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "expired, been used, or been cancelled" })).toBeVisible();
  await signOut(page);

  await signIn(page, org.owner.email);
  await page.goto(`/o/${org.slug}/team`);
  const row = page.getByTestId(`member-${joiner.email}`);
  await expect(row).toContainText("Teacher");
  await row.getByLabel("Change role").selectOption("org_admin");
  await row.getByRole("button", { name: "Save role" }).click();
  await expect(row.getByText("Role updated.")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId(`member-${joiner.email}`)).toContainText("Org Admin");
  await page.getByTestId(`member-${joiner.email}`).getByText("Remove from team").click();
  await page.getByTestId(`member-${joiner.email}`).getByRole("button", { name: "Yes, remove" }).click();
  await expect(page.getByTestId("team-list")).not.toContainText(joiner.email);
  // the last Org Admin cannot remove themselves
  await page.getByTestId(`member-${org.owner.email}`).getByText("Remove from team").click();
  await page.getByTestId(`member-${org.owner.email}`).getByRole("button", { name: "Yes, remove" }).click();
  await expect(page.getByTestId(`member-${org.owner.email}`).getByRole("alert")).toContainText("at least one Org Admin");
  await signOut(page);

  // a removed member loses access
  await signIn(page, joiner.email);
  const res = await page.goto(`/o/${org.slug}/checkin`);
  expect(res?.status()).toBe(404);
});

test("check-in and pickup codes: parent sees the code, wrong code refused, right code releases", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  const { parent, username } = await newKid(page, org.slug, org.joinCode, "Ada", [0, 1, 2, 3]);
  const second = await newKid(page, org.slug, org.joinCode, "Bola", [4, 5, 6, 7]);

  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/checkin`);
  const row = page.getByTestId(`register-${username}`);
  await expect(row).toContainText("New");
  await row.getByRole("button", { name: "Check in" }).click();
  await expect(row.getByTestId("action-value")).toHaveValue(/^[0-9]{4}$/);
  const code = await row.getByTestId("action-value").inputValue();
  await page.getByTestId(`register-${second.username}`).getByRole("button", { name: "Check in" }).click();
  await expect(page.getByTestId(`register-${second.username}`).getByTestId("action-value")).toBeVisible();
  await page.reload();
  await page.getByTestId(`register-${username}`).getByRole("button", { name: "Show pickup code" }).click();
  await expect(page.getByTestId(`register-${username}`).getByTestId("action-value")).toHaveValue(code);
  await expect(page.getByTestId(`register-${username}`)).toContainText("Here since");
  await expect(page.getByTestId(`register-${username}`)).not.toContainText("New");
  await expect(page.getByTestId("here-now")).toContainText("2 here now");
  await signOut(page);

  await signIn(page, parent.email);
  await expect(page.getByTestId("pickup-Ada")).toHaveText(code);
  await signOut(page);

  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/checkin`);
  const r = page.getByTestId(`register-${username}`);
  await r.getByLabel("Pickup code", { exact: true }).fill(code === "0000" ? "1111" : "0000");
  await r.getByRole("button", { name: "Check out" }).click();
  await expect(r.getByRole("alert")).toContainText("does not match");
  await r.getByLabel("Pickup code", { exact: true }).fill(code);
  await r.getByRole("button", { name: "Check out" }).click();
  await expect(page.getByTestId(`register-${username}`)).toContainText("Gone home");
  // teachers cannot release without a code
  await expect(page.getByTestId(`register-${second.username}`).getByText("Release without the code")).toHaveCount(0);
  await signOut(page);

  await signIn(page, org.owner.email);
  await page.goto(`/o/${org.slug}/checkin`);
  const b = page.getByTestId(`register-${second.username}`);
  await b.getByText("Release without the code (Org Admin)").click();
  await b.getByLabel(/Why\?/).fill("Grandma collecting, ID checked");
  await b.getByRole("button", { name: "Release" }).click();
  await expect(page.getByTestId(`register-${second.username}`)).toContainText("Released without code: Grandma collecting");
  await expect(page.getByTestId("attendance-history")).toContainText("2");
  await signOut(page);

  await kidSignIn(page, org.slug, username, [0, 1, 2, 3]);
  await expect(page.getByTestId("kid-points")).toHaveText("15 Champ Points");
});

test("certificates, seasons, insights, search and CSV export", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  const { parent, username } = await newKid(page, org.slug, org.joinCode, "Chidi", [8, 9, 10, 11]);

  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/certificates`);
  await page.getByLabel("Kid").selectOption({ label: "Chidi T." });
  await page.getByLabel("Title").fill("Kindness Award");
  await page.getByLabel("Why (optional)").fill("Helped everyone tidy up");
  await page.getByRole("button", { name: "Issue certificate" }).click();
  await expect(page.getByRole("status")).toContainText("Certificate issued");
  await page.reload();
  await page.getByTestId("certificate-list").getByRole("link", { name: "Kindness Award" }).click();
  await expect(page.getByTestId("certificate-name")).toHaveText("Chidi T.");
  await expect(page.getByTestId("certificate-title")).toHaveText("Kindness Award");

  await page.goto(`/o/${org.slug}/search?q=chid`);
  await expect(page.getByTestId("search-results")).toContainText("Chidi T.");
  await page.goto(`/o/${org.slug}/insights`);
  await expect(page.getByTestId("stat-kids")).toHaveText("1");
  await expect(page.getByTestId("not-seen")).toBeVisible();
  // teachers cannot export or reach admin pages
  expect((await page.request.get(`/o/${org.slug}/export/kids`)).status()).toBe(404);
  expect((await page.goto(`/o/${org.slug}/settings`))?.status()).toBe(404);
  await page.goto(`/o/${org.slug}`);
  await signOut(page);

  await signIn(page, org.owner.email);
  await page.goto(`/o/${org.slug}/seasons`);
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  await page.getByLabel("Name").fill("Autumn term");
  await page.getByLabel("Starts").fill(iso(new Date(today.getTime() - 3 * 86_400_000)));
  await page.getByLabel("Ends").fill(iso(new Date(today.getTime() + 60 * 86_400_000)));
  await page.getByRole("button", { name: "Save season" }).click();
  await expect(page.getByTestId("season-list")).toContainText("Now");

  const csv = await page.request.get(`/o/${org.slug}/export/kids`);
  expect(csv.status()).toBe(200);
  expect(csv.headers()["content-type"]).toContain("text/csv");
  const text = await csv.text();
  expect(text).toContain("first_name,last_initial,username");
  expect(text).toContain(username);
  expect(text.toLowerCase()).not.toContain("pin");
  await signOut(page);

  await signIn(page, parent.email);
  await page.getByTestId("parent-certificates").getByRole("link", { name: "Kindness Award" }).click();
  await expect(page.getByTestId("certificate-name")).toHaveText("Chidi T.");
  await signOut(page);

  await kidSignIn(page, org.slug, username, [8, 9, 10, 11]);
  await page.goto(`/k/${org.slug}/trophies`);
  await expect(page.getByTestId("kid-certificates")).toContainText("Kindness Award");
  await page.goto(`/k/${org.slug}/hall`);
  await expect(page.getByRole("tab", { name: "Autumn term" })).toBeVisible();
});

test("club settings: motto, colour, faith mode and a checked logo upload", async ({ page }) => {
  const org = await createActiveOrg();
  await signIn(page, org.owner.email);
  await page.goto(`/o/${org.slug}/settings`);
  await page.getByLabel("Tagline (shown on your Clubhouse page)").fill("Where every kid is a champ");
  await page.getByLabel(/Club motto or song/).fill("Brave hearts, kind hands");
  await page.getByLabel("Use a club colour").check();
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status")).toContainText("Club settings saved.");

  // a file pretending to be a PNG is refused by its bytes
  await page.getByLabel(/PNG, JPG or WebP/).setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: Buffer.from("<svg onload=alert(1)></svg>") });
  await page.getByRole("button", { name: "Upload logo" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Use a PNG, JPG or WebP image." })).toBeVisible();
  await page.getByLabel(/PNG, JPG or WebP/).setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: PNG_1PX });
  await page.getByRole("button", { name: "Upload logo" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Logo updated." })).toBeVisible();
  await page.reload();
  const src = await page.getByTestId("club-logo").getAttribute("src");
  expect(src).toContain("/storage/v1/object/public/branding/");
  expect((await page.request.get(src!)).status()).toBe(200);
  await signOut(page);

  await page.goto(`/c/${org.slug}`);
  await expect(page.getByTestId("clubhouse-motto")).toContainText("Brave hearts, kind hands");
  await expect(page.getByText("Where every kid is a champ")).toBeVisible();
  await expect(page.getByRole("img", { name: /logo/ })).toBeVisible();
});

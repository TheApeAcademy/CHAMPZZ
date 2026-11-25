import { expect, test } from "@playwright/test";
import { FEATURES } from "../../src/content/features";

const PAGES = ["/", "/features", "/safety", "/pricing", "/privacy", "/terms"];

for (const path of PAGES) {
  test(`public page ${path}: loads, no MFM, no dashes, fits a phone, images load, credit last`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();

    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/\bMFM\b|Wuye|Mountain of Fire/i);
    expect(text).not.toMatch(/[—–]/);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    // scroll through so lazy images load, then check none are broken
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    });
    await page.waitForLoadState("networkidle");
    const broken = await page.evaluate(() => Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
    expect(broken).toEqual([]);

    const credit = page.getByTestId("zebraish-credit");
    await expect(credit).toHaveText("Built by Zebraish");
    const isLast = await credit.evaluate((el) => {
      const all = Array.from(document.body.querySelectorAll("*")).filter((e) => (e as HTMLElement).innerText?.trim() && !e.closest("script"));
      const lastText = all.filter((e) => e.children.length === 0).pop();
      return lastText === el;
    });
    expect(isLast).toBe(true);
  });
}

test("pricing comes from the database: Starter, Basic, Pro and Network", async ({ page }) => {
  await page.goto("/pricing");
  const cards = page.getByTestId("pricing-cards");
  await expect(cards).toContainText("Starter");
  await expect(cards).toContainText("₦20,000");
  await expect(cards).toContainText("Basic");
  await expect(cards).toContainText("₦45,000");
  await expect(cards).toContainText("Pro");
  await expect(cards).toContainText("₦85,000");
  await expect(cards).toContainText("Network");
});

test("features page tags exactly the unfinished features as Coming soon", async ({ page }) => {
  await page.goto("/features");
  const soon = FEATURES.filter((f) => f.status === "soon").length;
  await expect(page.locator('[data-status="soon"]')).toHaveCount(soon);
  await expect(page.locator('[data-status="live"]')).toHaveCount(FEATURES.length - soon);
  await expect(page.locator('[data-status="live"]').getByText("Coming soon")).toHaveCount(0);
});

test("landing navigation reaches every public page and sign up", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  for (const [name, path] of [["Features", "/features"], ["Safety", "/safety"], ["Pricing", "/pricing"]] as const) {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await page.goto("/");
  }
  await page.getByRole("link", { name: "Start your club" }).first().click();
  await expect(page).toHaveURL(/\/signup$/);
});

test("phone header keeps sign in and start, section links live in the footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Features", exact: true })).toBeHidden();
  await page.getByRole("navigation", { name: "Product" }).getByRole("link", { name: "Features" }).click();
  await expect(page).toHaveURL(/\/features$/);
});

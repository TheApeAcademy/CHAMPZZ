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
    expect(text).not.toMatch(/[\u2014\u2013]/);

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

// The landing (v2) is one long page: its header links scroll to sections, and
// its footer links reach the other public pages.
test("landing footer reaches every public page, and the landing reaches sign up and sign in", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  for (const [name, path] of [["Features", "/features"], ["Safety", "/safety"], ["Pricing", "/pricing"], ["Privacy", "/privacy"], ["Terms", "/terms"]] as const) {
    await page.getByRole("navigation", { name: "Product" }).getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await page.goto("/");
  }
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Start your club" }).click();
  await expect(page).toHaveURL(/#start$/);
  await page.locator("#start").getByRole("link", { name: "Start your club" }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("phone header keeps sign in and start on screen", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");
  const main = page.getByRole("navigation", { name: "Main" });
  for (const name of ["Sign in", "Start your club"]) {
    const box = await main.getByRole("link", { name }).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(360);
  }
});

test("landing shows the live NGN prices from the plans table", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#pricing")).toContainText("₦45,000");
});

test("the logo reads CHAMPZZ, never just CHAMP", async ({ page }) => {
  // The v2 landing uses the "Champions" signature in its header; every other public page keeps the CHAMPZZ logo.
  await page.goto("/features");
  const logos = page.getByRole("img", { name: "Champzz" });
  await expect(logos.first()).toBeVisible();
  for (const text of await logos.allInnerTexts()) expect(text.replace(/\s/g, "")).toBe("CHAMPZZ");
});

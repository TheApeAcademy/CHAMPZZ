import { defineConfig, devices } from "@playwright/test";

// One worker: the lifecycle test moves time forward for every org in the
// local database, so specs run in a fixed order against one stack.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: { baseURL: "http://localhost:3000", trace: "off", ...devices["Pixel 7"] },
  globalSetup: "./tests/e2e/global-setup.ts",
  webServer: [
    {
      command: "node tests/e2e/fake-flutterwave.mjs",
      url: "http://localhost:3999/health",
      reuseExistingServer: true,
    },
    {
      command: "npm run start -- -p 3000",
      url: "http://localhost:3000",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});

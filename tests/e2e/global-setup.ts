import { execSync } from "node:child_process";

// Fresh database for every run, so results never depend on leftovers.
export default async function globalSetup() {
  execSync("npx supabase db reset --no-seed", { stdio: "ignore", timeout: 300_000 });
}

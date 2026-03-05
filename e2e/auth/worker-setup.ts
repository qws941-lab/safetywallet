import { test as setup, expect } from "@playwright/test";
import path from "node:path";

const authFile = path.join(__dirname, "../.auth/worker.json");

setup("authenticate as worker", async ({ page }) => {
  await page.goto("/login");

  await page.locator("#name").fill(process.env.E2E_WORKER_NAME!);
  await page.locator("#phone").fill(process.env.E2E_WORKER_PHONE!);
  await page.locator("#dob").fill(process.env.E2E_WORKER_DOB!);
  await page.getByRole("button", { name: /로그인|sign in/i }).click();

  await page.waitForURL("**/home/**", { timeout: 15_000 });
  await expect(page.locator("body")).toBeVisible();

  await page.context().storageState({ path: authFile });
});

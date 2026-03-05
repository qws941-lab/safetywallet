import { test as setup, expect } from "@playwright/test";
import path from "node:path";

const authFile = path.join(__dirname, "../.auth/admin.json");

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/login");

  await page.locator("#admin-username").fill(process.env.ADMIN_USERNAME!);
  await page.locator("#admin-password").fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "로그인" }).click();

  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
  await expect(page.locator("body")).toBeVisible();

  await page.context().storageState({ path: authFile });
});

import { test, expect } from "@playwright/test";

test.describe("Worker Home", () => {
  test("should access home after login", async ({ page }) => {
    await page.goto("/home/");
    await page.waitForLoadState("networkidle");

    // Should stay on home (not redirected to login)
    await expect(page).toHaveURL(/.*home/);
  });

  test("should display navigation", async ({ page }) => {
    await page.goto("/home/");
    await page.waitForLoadState("networkidle");

    // Home should render navigation
    await expect(page.locator("nav")).toBeVisible();
  });
});

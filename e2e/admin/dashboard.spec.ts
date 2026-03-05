import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard", () => {
  test("should access dashboard after login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Should stay on dashboard (not redirected to login)
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should display sidebar navigation", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Dashboard should render navigation sidebar
    await expect(page.locator("nav")).toBeVisible();
  });
});

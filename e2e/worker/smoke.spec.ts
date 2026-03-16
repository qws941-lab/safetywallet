import { test, expect } from "@playwright/test";

test.describe("Worker App Smoke Tests", () => {
  test("should load the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
  });

  test("should have no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !msg.text().includes("ERR_CONNECTION")) {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("load");

    expect(errors).toHaveLength(0);
  });
});

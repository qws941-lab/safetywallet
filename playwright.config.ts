import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const ADMIN_AUTH = path.join(__dirname, "e2e/.auth/admin.json");
const WORKER_AUTH = path.join(__dirname, "e2e/.auth/worker.json");

const WORKER_URL = process.env.E2E_WORKER_URL || "http://localhost:3000";
const ADMIN_URL = process.env.E2E_ADMIN_URL || "http://localhost:3001";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  outputDir: "test-results",

  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    /* ── Auth setup (runs first, no dependencies) ── */
    {
      name: "admin-setup",
      testDir: "./e2e/auth",
      testMatch: "admin-setup.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: ADMIN_URL,
      },
    },
    {
      name: "worker-setup",
      testDir: "./e2e/auth",
      testMatch: "worker-setup.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: WORKER_URL,
      },
    },

    /* ── Smoke (no auth required) ── */
    {
      name: "worker-smoke",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: WORKER_URL,
      },
      testDir: "./e2e/worker",
      testMatch: "smoke.spec.ts",
    },
    {
      name: "admin-smoke",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: ADMIN_URL,
      },
      testDir: "./e2e/admin",
      testMatch: "smoke.spec.ts",
    },

    /* ── Authenticated tests ── */
    {
      name: "worker",
      dependencies: ["worker-setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: WORKER_URL,
        storageState: WORKER_AUTH,
      },
      testDir: "./e2e/worker",
      testIgnore: "smoke.spec.ts",
    },
    {
      name: "admin",
      dependencies: ["admin-setup"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: ADMIN_URL,
        storageState: ADMIN_AUTH,
      },
      testDir: "./e2e/admin",
      testIgnore: "smoke.spec.ts",
    },
  ],

  /* webServer only needed for local dev — E2E defaults to production URLs */
  ...(WORKER_URL.includes("localhost")
    ? {
        webServer: [
          {
            command: "npm run dev --workspace=apps/worker",
            url: WORKER_URL,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
          },
          {
            command: "npm run dev --workspace=apps/admin",
            url: ADMIN_URL,
            reuseExistingServer: !process.env.CI,
            timeout: 120_000,
          },
        ],
      }
    : {}),
});

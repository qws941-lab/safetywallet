import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { buildApiCsp } from "../../lib/csp";
import { securityHeaders } from "../security-headers";

describe("securityHeaders middleware", () => {
  it("adds the API CSP and all expected security headers to non-HTML responses", async () => {
    const app = new Hono();
    app.use("*", securityHeaders);
    app.get("/ping", (c) => c.json({ ok: true }));

    const res = await app.request("http://localhost/ping");

    expect(res.headers.get("Content-Security-Policy")).toBe(buildApiCsp());
    expect(res.headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains",
    );
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(res.headers.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=()",
    );
  });

  it("skips the API CSP for HTML responses", async () => {
    const app = new Hono();
    app.use("*", securityHeaders);
    app.get("/page", () => {
      return new Response("<html><body>ok</body></html>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    });

    const res = await app.request("http://localhost/page");

    expect(res.headers.get("Content-Security-Policy")).toBeNull();
    expect(res.headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains",
    );
  });
});

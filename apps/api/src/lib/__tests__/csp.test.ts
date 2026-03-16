import { describe, expect, it } from "vitest";
import { buildApiCsp, buildHtmlCsp, generateNonce } from "../csp";

describe("csp helpers", () => {
  it("generates base64 nonces", () => {
    const nonce = generateNonce();

    expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(nonce.length).toBeGreaterThan(10);
  });

  it("builds HTML CSP with nonce-based inline allowances", () => {
    const csp = buildHtmlCsp("test-nonce");

    expect(csp).toContain(
      "script-src 'self' 'nonce-test-nonce' https://static.cloudflareinsights.com",
    );
    expect(csp).toContain("style-src 'self' 'nonce-test-nonce'");
    expect(csp).not.toContain("'unsafe-inline'");
  });

  it("builds strict API CSP without nonce or unsafe-inline", () => {
    expect(buildApiCsp()).toBe(
      "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self'; img-src 'self' blob: data: https:; connect-src 'self' https:; frame-src https://www.youtube.com https://www.youtube-nocookie.com; frame-ancestors 'none'",
    );
  });
});

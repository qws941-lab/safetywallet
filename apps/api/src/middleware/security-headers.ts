import { createMiddleware } from "hono/factory";
import { buildApiCsp } from "../lib/csp";
import type { Env } from "../types";

export const securityHeaders = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    await next();

    if (!c.res.headers.get("content-type")?.includes("text/html")) {
      c.header("Content-Security-Policy", buildApiCsp());
    }
    c.header(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  },
);

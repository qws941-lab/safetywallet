import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useEducationCompletions } from "@/hooks/use-education-completions";
import { createWrapper } from "@/hooks/__tests__/test-utils";

const mockApiFetch = vi.fn();

vi.mock("@/lib/api", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: (
    selector: (state: { currentSiteId: string | null }) => unknown,
  ) => selector({ currentSiteId: "site-123" }),
}));

describe("useEducationCompletions", () => {
  it("fetches completions with params", async () => {
    mockApiFetch.mockResolvedValue({
      items: [],
      pagination: { page: 1, total: 0, limit: 20, totalPages: 0 },
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () =>
        useEducationCompletions("content-1", "2026-03-01", "2026-03-31", 2, 10),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const url = mockApiFetch.mock.calls[0][0] as string;
    expect(url).toContain("siteId=site-123");
    expect(url).toContain("contentId=content-1");
    expect(url).toContain("startDate=2026-03-01");
    expect(url).toContain("endDate=2026-03-31");
    expect(url).toContain("page=2");
    expect(url).toContain("limit=10");
  });
});

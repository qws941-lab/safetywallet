import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";
import { useDashboardStats } from "@/hooks/use-api";

vi.mock("@/hooks/use-api", () => ({
  useDashboardStats: vi.fn(),
}));

const mockUseDashboardStats = vi.mocked(useDashboardStats);

const toDashboardStatsResult = (
  value: unknown,
): ReturnType<typeof useDashboardStats> => value as never;

function createMockQueryResult<T>(
  data: T,
  isLoading = false,
  isSuccess = true,
): {
  data: T;
  isLoading: boolean;
  isSuccess: boolean;
} {
  return {
    data,
    isLoading,
    isSuccess,
  };
}

describe("DashboardPage", () => {
  beforeEach(() => {
    mockUseDashboardStats.mockReturnValue(
      toDashboardStatsResult({
        ...createMockQueryResult({
          todayPostsCount: 7,
          pendingCount: 3,
          urgentCount: 1,
          avgProcessingHours: 52,
          totalUsers: 30,
          totalPosts: 120,
          activeUsersToday: 12,
          totalSites: 4,
        }),
      }),
    );
  });

  it("shows loading state while dashboard stats are loading", () => {
    mockUseDashboardStats.mockReturnValue(
      toDashboardStatsResult(createMockQueryResult(undefined, true, false)),
    );

    render(<DashboardPage />);

    expect(screen.getByText("대시보드")).toBeInTheDocument();
    expect(screen.queryByText("오늘 접수된 제보")).not.toBeInTheDocument();
  });

  it("renders key metrics only", () => {
    render(<DashboardPage />);

    expect(screen.getByText("오늘의 출근 인원")).toBeInTheDocument();
    expect(screen.getByText("오늘 접수된 제보")).toBeInTheDocument();
    expect(screen.getByText("미확인 제보")).toBeInTheDocument();
  });
});

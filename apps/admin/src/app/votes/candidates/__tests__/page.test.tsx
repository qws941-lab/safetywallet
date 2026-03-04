import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VoteCandidatesPage from "../page";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <a href="/votes">{children}</a>
  ),
}));

describe("vote candidates page", () => {
  it("shows removal message and link", () => {
    render(<VoteCandidatesPage />);
    expect(screen.getByText("투표 후보 관리")).toBeInTheDocument();
    expect(
      screen.getByText(/프로젝트 범위에서 제외되었습니다/),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "투표 관리로 이동" });
    expect(link).toHaveAttribute("href", "/votes");
  });
});

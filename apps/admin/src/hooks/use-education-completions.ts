"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

interface EducationCompletion {
  id: string;
  contentId: string;
  contentTitle: string | null;
  userName: string | null;
  userCompany: string | null;
  signedAt: string | number | Date;
  signatureData?: string | null;
}

interface EducationCompletionResponse {
  items: EducationCompletion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useEducationCompletions(
  contentId?: string,
  startDate?: string,
  endDate?: string,
  page = 1,
  limit = 20,
) {
  const siteId = useAuthStore((s) => s.currentSiteId);

  return useQuery({
    queryKey: [
      "admin",
      "education-completions",
      siteId,
      contentId,
      startDate,
      endDate,
      page,
      limit,
    ],
    enabled: !!siteId && !!contentId,
    queryFn: () => {
      const params = new URLSearchParams();
      if (siteId) params.set("siteId", siteId);
      if (contentId) params.set("contentId", contentId);
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      return apiFetch<EducationCompletionResponse>(
        `/admin/education/completions?${params.toString()}`,
      );
    },
  });
}

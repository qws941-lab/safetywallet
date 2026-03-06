import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

interface BeforeAfterComparisonResult {
  overallImprovement:
    | "SIGNIFICANT"
    | "MODERATE"
    | "MINIMAL"
    | "NONE"
    | "WORSENED";
  improvementScore: number;
  beforeCondition: string;
  afterCondition: string;
  changesIdentified: string[];
  remainingIssues: string[];
  complianceImprovement: boolean;
  safetyRating: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  recommendation: string;
  confidence: number;
  modelVersion: string;
}

interface BeforeAfterComparisonDto {
  comparison: BeforeAfterComparisonResult | null;
  comparedAt: string | null;
}

export function useBeforeAfterComparison(actionId: string | null) {
  const currentSiteId = useAuthStore((state) => state.currentSiteId);

  return useQuery({
    queryKey: ["admin", "actions", actionId, "comparison"],
    queryFn: () =>
      apiFetch<BeforeAfterComparisonDto>(`/actions/${actionId}/comparison`),
    enabled: !!actionId && !!currentSiteId,
  });
}

export function useTriggerBeforeAfterComparison() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (actionId: string) =>
      apiFetch<{ comparison: BeforeAfterComparisonResult; comparedAt: string }>(
        `/actions/${actionId}/compare-images`,
        {
          method: "POST",
        },
      ),
    onSuccess: (_data, actionId) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "actions", actionId, "comparison"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "actions", actionId, "images"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "actions"] });
    },
  });
}

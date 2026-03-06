import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TbmMeetingMinutesDto,
  TbmMeetingMinutesResult,
} from "@/hooks/use-education-api-types";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

export function useTbmMeetingMinutes(tbmId: string | null) {
  const currentSiteId = useAuthStore((state) => state.currentSiteId);

  return useQuery({
    queryKey: ["admin", "education", "tbm", tbmId, "meeting-minutes"],
    queryFn: () =>
      apiFetch<TbmMeetingMinutesDto>(`/education/tbm/${tbmId}/meeting-minutes`),
    enabled: !!tbmId && !!currentSiteId,
  });
}

export function useTriggerTbmMeetingMinutes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tbmId: string) =>
      apiFetch<{ success: true; minutes: TbmMeetingMinutesResult }>(
        `/education/tbm/${tbmId}/generate-minutes`,
        {
          method: "POST",
        },
      ),
    onSuccess: (_data, tbmId) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "education", "tbm", tbmId, "meeting-minutes"],
      });
    },
  });
}

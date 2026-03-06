import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface GenerateQuizResponse {
  id: string;
  title: string;
  status: string;
  questions: Array<{
    id: string;
    question: string;
    options: string;
    correctAnswer: number;
    explanation: string | null;
    questionType: string;
    orderIndex: number;
  }>;
}

export function useGenerateQuizFromContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) =>
      apiFetch<GenerateQuizResponse>(
        `/education/contents/${contentId}/generate-quiz`,
        { method: "POST" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "education", "quizzes"],
      });
    },
  });
}

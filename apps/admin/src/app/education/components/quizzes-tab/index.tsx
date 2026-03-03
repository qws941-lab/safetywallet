"use client";

import { useState } from "react";
import { Button } from "@safetywallet/ui";
import { Plus, ChevronUp } from "lucide-react";
import { useQuizzes, useQuiz, useDeleteQuiz } from "@/hooks/use-api";
import { useToast } from "@safetywallet/ui";
import type { QuizDetail, QuizItem } from "../education-types";
import { QuizRegistration } from "./quiz-registration";
import { QuizList } from "./quiz-list";
import { QuestionManagement } from "./question-management";

export function QuizzesTab() {
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<QuizItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const deleteQuizMutation = useDeleteQuiz();

  const handleEditQuiz = (quiz: QuizItem) => {
    setEditingQuiz(quiz);
    setShowForm(true);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await deleteQuizMutation.mutateAsync(quizId);
      toast({ description: "퀴즈가 삭제되었습니다." });
      if (expandedQuizId === quizId) {
        setExpandedQuizId(null);
      }
      if (editingQuiz?.id === quizId) {
        setEditingQuiz(null);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "퀴즈 삭제에 실패했습니다.",
      });
    }
  };

  const { data: quizzesData, isLoading } = useQuizzes();
  const { data: quizDetail } = useQuiz(expandedQuizId || "");

  const quizzes: QuizItem[] = quizzesData?.quizzes ?? [];
  const typedQuizDetail: QuizDetail | undefined = quizDetail;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          variant={showForm ? "outline" : "default"}
          size="sm"
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) setEditingQuiz(null);
          }}
        >
          {showForm ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              접기
            </>
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" />
              퀴즈 등록
            </>
          )}
        </Button>
      </div>
      {showForm && (
        <QuizRegistration
          editingQuiz={editingQuiz}
          onCancelEdit={() => {
            setEditingQuiz(null);
            setShowForm(false);
          }}
        />
      )}
      <QuizList
        isLoading={isLoading}
        quizzes={quizzes}
        expandedQuizId={expandedQuizId}
        onToggleExpand={setExpandedQuizId}
        onEditQuiz={handleEditQuiz}
        onDeleteQuiz={handleDeleteQuiz}
      />
      {expandedQuizId && typedQuizDetail && (
        <QuestionManagement
          key={expandedQuizId}
          expandedQuizId={expandedQuizId}
          typedQuizDetail={typedQuizDetail}
        />
      )}
    </div>
  );
}

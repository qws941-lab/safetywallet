"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
} from "@safetywallet/ui";
import { DataTable, type Column } from "@/components/data-table";
import { getQuizStatusLabel } from "../../education-helpers";
import type { QuizItem } from "../education-types";

interface Props {
  isLoading: boolean;
  quizzes: QuizItem[];
  expandedQuizId: string | null;
  onToggleExpand: (id: string | null) => void;
  onEditQuiz: (quiz: QuizItem) => void;
  onDeleteQuiz: (quizId: string) => void;
}

export function QuizList({
  isLoading,
  quizzes,
  expandedQuizId,
  onToggleExpand,
  onEditQuiz,
  onDeleteQuiz,
}: Props) {
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);

  const columns: Column<QuizItem>[] = [
    {
      key: "title",
      header: "제목",
      sortable: true,
      render: (item) => (
        <span className="font-medium break-words">{item.title}</span>
      ),
    },
    {
      key: "status",
      header: "상태",
      sortable: true,
      render: (item) => (
        <Badge variant="secondary">
          {getQuizStatusLabel(item.status ?? "DRAFT")}
        </Badge>
      ),
    },
    {
      key: "passingScore",
      header: "통과점수",
      sortable: true,
    },
    {
      key: "timeLimitMinutes",
      header: "제한시간",
      render: (item) =>
        item.timeLimitMinutes ? `${item.timeLimitMinutes}분` : "-",
    },
    {
      key: "createdAt",
      header: "등록일",
      sortable: true,
      render: (item) => (
        <span className="text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString("ko-KR")}
        </span>
      ),
    },
    {
      key: "_actions",
      header: "관리",
      className: "text-right",
      render: (item) => {
        const isExpanded = expandedQuizId === item.id;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEditQuiz(item);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteQuizId(item.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(isExpanded ? null : item.id);
              }}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-1 h-4 w-4" />
                  접기
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-4 w-4" />
                  문항 관리
                </>
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">로딩 중...</p>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={quizzes}
        searchable
        searchPlaceholder="퀴즈 검색..."
        emptyMessage="등록된 퀴즈가 없습니다."
      />
      <AlertDialog
        open={!!deleteQuizId}
        onOpenChange={(open) => !open && setDeleteQuizId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>퀴즈 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              퀴즈를 삭제하시겠습니까? 관련 문항도 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteQuizId) {
                  onDeleteQuiz(deleteQuizId);
                  setDeleteQuizId(null);
                }
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

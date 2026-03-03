"use client";

import { Trash2 } from "lucide-react";
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
import type { TrainingItem } from "../education-types";
import {
  formatUnixDate,
  getTrainingStatusLabel,
  getTrainingTypeLabel,
} from "../../education-helpers";

interface TrainingListProps {
  isLoading: boolean;
  trainings: TrainingItem[];
  deleteMutation: { isPending: boolean };
  onEditTraining: (item: TrainingItem) => void;
  onDeleteTraining: (id: string) => void;
  deleteTrainingId: string | null;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export function TrainingList({
  isLoading,
  trainings,
  deleteMutation,
  onEditTraining,
  onDeleteTraining,
  deleteTrainingId,
  onDeleteConfirm,
  onDeleteCancel,
}: TrainingListProps) {
  const columns: Column<TrainingItem>[] = [
    {
      key: "training.trainingName",
      header: "교육명",
      sortable: true,
      render: (item) => (
        <span className="font-medium">{item.training.trainingName}</span>
      ),
    },
    {
      key: "training.trainingType",
      header: "교육유형",
      sortable: true,
      render: (item) => (
        <Badge variant="outline">
          {getTrainingTypeLabel(item.training.trainingType)}
        </Badge>
      ),
    },
    {
      key: "userName",
      header: "대상자",
      sortable: true,
      render: (item) => <span>{item.userName || "-"}</span>,
    },
    {
      key: "training.trainingDate",
      header: "교육일",
      sortable: true,
      render: (item) => (
        <span>{formatUnixDate(item.training.trainingDate)}</span>
      ),
    },
    {
      key: "training.status",
      header: "상태",
      sortable: true,
      render: (item) => (
        <Badge variant="secondary">
          {getTrainingStatusLabel(item.training.status ?? "SCHEDULED")}
        </Badge>
      ),
    },
    {
      key: "training.expirationDate",
      header: "유효기간",
      sortable: true,
      render: (item) => (
        <span>{formatUnixDate(item.training.expirationDate)}</span>
      ),
    },
    {
      key: "_actions",
      header: "관리",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEditTraining(item);
            }}
          >
            수정
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTraining(item.training.id);
            }}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">로딩 중...</p>;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={trainings}
        searchable
        searchPlaceholder="법정교육 검색..."
        emptyMessage="등록된 법정교육이 없습니다."
      />

      <AlertDialog
        open={!!deleteTrainingId}
        onOpenChange={(open) => !open && onDeleteCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>법정교육 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              법정교육 기록을 삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={onDeleteConfirm}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

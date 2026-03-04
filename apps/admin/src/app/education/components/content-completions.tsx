"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
  Badge,
} from "@safetywallet/ui";
import { useEducationCompletions } from "@/hooks/use-education-completions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EducationContentItem } from "./education-types";

interface Props {
  contents: EducationContentItem[];
}

export function ContentCompletions({ contents }: Props) {
  const [selectedContentId, setSelectedContentId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!selectedContentId && contents.length > 0) {
      setSelectedContentId(contents[0].id);
    }
  }, [contents, selectedContentId]);

  const { data, isLoading } = useEducationCompletions(
    selectedContentId,
    startDate || undefined,
    endDate || undefined,
    1,
    50,
  );

  const currentContentTitle = useMemo(() => {
    return (
      contents.find((c) => c.id === selectedContentId)?.title ?? "교육 자료"
    );
  }, [contents, selectedContentId]);

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>수료 내역</CardTitle>
        <CardDescription>
          교육 자료별 수료자와 서명 시간을 확인할 수 있습니다.
        </CardDescription>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">교육 자료</span>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[200px]"
              value={selectedContentId}
              onChange={(e) => setSelectedContentId(e.target.value)}
            >
              {contents.map((content) => (
                <option key={content.id} value={content.id}>
                  {content.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">시작일</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">종료일</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !data?.items.length ? (
          <p className="text-sm text-muted-foreground">수료 기록이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">총 {data.pagination.total}건</Badge>
                <span className="text-muted-foreground">
                  {currentContentTitle}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>소속</TableHead>
                    <TableHead>수료 시각</TableHead>
                    <TableHead>서명</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.userName ?? "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.userCompany ?? "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.signedAt
                          ? new Date(item.signedAt).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.signatureData ? (
                          <img
                            src={item.signatureData}
                            alt="서명"
                            className="max-h-16 max-w-[180px] object-contain border rounded-md bg-white"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

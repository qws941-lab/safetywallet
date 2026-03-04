"use client";

import { useState } from "react";
import {
  useRecommendations,
  useExportRecommendations,
} from "@/hooks/use-recommendations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Skeleton,
} from "@safetywallet/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award, Download, ChevronLeft, ChevronRight } from "lucide-react";

export default function RecommendationsPage() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sort, setSort] = useState<"CREATED_DESC" | "RECOMMENDED_NAME_ASC">(
    "RECOMMENDED_NAME_ASC",
  );
  const { data, isLoading } = useRecommendations(
    page,
    20,
    startDate || undefined,
    endDate || undefined,
    sort,
  );
  const exportCsv = useExportRecommendations();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6" />
            우수근로자 추천 내역
          </h1>
          <p className="text-muted-foreground mt-1">
            현장 근로자들의 추천 내역을 조회합니다
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            exportCsv(startDate || undefined, endDate || undefined)
          }
        >
          <Download className="h-4 w-4 mr-2" />
          CSV 내보내기
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기간 필터</CardTitle>
          <CardDescription>조회할 기간을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              시작일
            </span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              종료일
            </span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              정렬
            </span>
            <select
              className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={sort}
              onChange={(e) => {
                const value = e.target.value as
                  | "CREATED_DESC"
                  | "RECOMMENDED_NAME_ASC";
                setSort(value);
                setPage(1);
              }}
            >
              <option value="RECOMMENDED_NAME_ASC">추천된 이름 가나다순</option>
              <option value="CREATED_DESC">최신 추천 순</option>
            </select>
          </div>
          {(startDate || endDate) && (
            <Button
              variant="ghost"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
            >
              초기화
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2">
          <CardTitle>추천 목록</CardTitle>
          {data && (
            <p className="text-sm text-muted-foreground">
              총{" "}
              <span className="font-semibold text-foreground">
                {data.pagination.total}
              </span>
              건
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.items.length ? (
            <p className="text-center text-muted-foreground py-8">
              추천 내역이 없습니다
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>추천된 사람</TableHead>
                      <TableHead>공종</TableHead>
                      <TableHead>추천한 사람</TableHead>
                      <TableHead>추천일</TableHead>
                      <TableHead className="max-w-[240px]">추천 사유</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {r.recommendedName}
                        </TableCell>
                        <TableCell>{r.tradeType}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{r.recommenderName ?? "-"}</span>
                            <span className="text-xs text-muted-foreground">
                              {r.recommenderCompany ?? "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {r.recommendationDate}
                        </TableCell>
                        <TableCell className="max-w-[240px] truncate">
                          {r.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

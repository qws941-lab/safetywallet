"use client";

import { Bot, RefreshCw, Sparkles } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@safetywallet/ui";
import {
  useBeforeAfterComparison,
  useTriggerBeforeAfterComparison,
} from "@/hooks/use-before-after-comparison";

interface Props {
  actionId: string;
}

type ImprovementLevel =
  | "SIGNIFICANT"
  | "MODERATE"
  | "MINIMAL"
  | "NONE"
  | "WORSENED";

type SafetyRating = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

const IMPROVEMENT_STYLES: Record<
  ImprovementLevel,
  { label: string; className: string }
> = {
  SIGNIFICANT: {
    label: "큰 폭 개선",
    className: "bg-green-100 text-green-700",
  },
  MODERATE: { label: "중간 개선", className: "bg-blue-100 text-blue-700" },
  MINIMAL: { label: "미미한 개선", className: "bg-yellow-100 text-yellow-700" },
  NONE: { label: "개선 없음", className: "bg-red-100 text-red-700" },
  WORSENED: { label: "악화", className: "bg-red-100 text-red-700" },
};

const SAFETY_RATING_STYLES: Record<
  SafetyRating,
  { label: string; className: string }
> = {
  EXCELLENT: { label: "우수", className: "bg-green-100 text-green-700" },
  GOOD: { label: "양호", className: "bg-blue-100 text-blue-700" },
  FAIR: { label: "보통", className: "bg-yellow-100 text-yellow-700" },
  POOR: { label: "미흡", className: "bg-red-100 text-red-700" },
};

export function BeforeAfterComparisonCard({ actionId }: Props) {
  const { data, isLoading, isError } = useBeforeAfterComparison(actionId);
  const triggerMutation = useTriggerBeforeAfterComparison();

  const comparison = data?.comparison ?? null;
  const comparedAt = data?.comparedAt ?? null;

  const handleAnalyze = () => {
    triggerMutation.mutate(actionId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4" />
            개선 전후 AI 비교 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">분석 결과 로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4" />
            개선 전후 AI 비교 분석
          </CardTitle>
          <CardDescription>
            비교 분석 정보를 불러오지 못했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={triggerMutation.isPending}
          >
            {triggerMutation.isPending ? (
              <>
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-1 h-3 w-3" />
                재분석
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!comparison) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-4 w-4" />
              개선 전후 AI 비교 분석
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={triggerMutation.isPending}
            >
              {triggerMutation.isPending ? (
                <>
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1 h-3 w-3" />
                  비교 분석 시작
                </>
              )}
            </Button>
          </div>
          <CardDescription>
            BEFORE와 AFTER 이미지가 모두 있을 때 효과 분석이 가능합니다.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const improvementStyle = IMPROVEMENT_STYLES[comparison.overallImprovement];
  const safetyStyle = SAFETY_RATING_STYLES[comparison.safetyRating];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4" />
            개선 전후 AI 비교 분석
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={triggerMutation.isPending}
          >
            {triggerMutation.isPending ? (
              <>
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <RefreshCw className="mr-1 h-3 w-3" />
                재분석
              </>
            )}
          </Button>
        </div>
        {comparedAt && (
          <CardDescription>
            비교일시: {new Date(comparedAt).toLocaleString("ko-KR")}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={improvementStyle.className}>
            {improvementStyle.label}
          </Badge>
          <Badge className={safetyStyle.className}>{safetyStyle.label}</Badge>
          <span className="ml-auto text-xs text-muted-foreground">
            개선 점수: {comparison.improvementScore}%
          </span>
        </div>

        <div>
          <h4 className="mb-1 text-sm font-medium">개선 전 상태</h4>
          <p className="text-sm text-muted-foreground">
            {comparison.beforeCondition}
          </p>
        </div>

        <div>
          <h4 className="mb-1 text-sm font-medium">개선 후 상태</h4>
          <p className="text-sm text-muted-foreground">
            {comparison.afterCondition}
          </p>
        </div>

        <div>
          <h4 className="mb-1 text-sm font-medium">확인된 변화</h4>
          {comparison.changesIdentified.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              확인된 변화가 없습니다.
            </p>
          ) : (
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
              {comparison.changesIdentified.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>

        {comparison.remainingIssues.length > 0 && (
          <div>
            <h4 className="mb-1 text-sm font-medium text-red-700">
              남은 안전 이슈
            </h4>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-0.5">
              {comparison.remainingIssues.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="mb-1 text-sm font-medium">권고사항</h4>
          <p className="text-sm text-muted-foreground">
            {comparison.recommendation}
          </p>
        </div>

        <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
          <span>
            준수 수준 개선: {comparison.complianceImprovement ? "예" : "아니오"}
          </span>
          <span>신뢰도: {comparison.confidence}%</span>
          <span>{comparison.modelVersion}</span>
        </div>
      </CardContent>
    </Card>
  );
}

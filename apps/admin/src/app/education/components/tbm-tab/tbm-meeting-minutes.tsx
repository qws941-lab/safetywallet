"use client";

import { FileText, RefreshCw } from "lucide-react";
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
  useTbmMeetingMinutes,
  useTriggerTbmMeetingMinutes,
} from "@/hooks/use-tbm-meeting-minutes";
import type { TbmMeetingMinutesResult } from "@/hooks/use-education-api-types";

interface Props {
  tbmId: string;
}

const RISK_LEVEL_STYLES: Record<string, { label: string; className: string }> =
  {
    high: { label: "고위험", className: "bg-red-100 text-red-700" },
    medium: { label: "중위험", className: "bg-yellow-100 text-yellow-700" },
    low: { label: "저위험", className: "bg-green-100 text-green-700" },
  };

export function TbmMeetingMinutes({ tbmId }: Props) {
  const { data, isLoading } = useTbmMeetingMinutes(tbmId);
  const triggerMutation = useTriggerTbmMeetingMinutes();

  const minutes: TbmMeetingMinutesResult | null = data?.minutes ?? null;
  const generatedAt = data?.generatedAt;

  const handleGenerate = () => {
    triggerMutation.mutate(tbmId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            TBM 회의록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">회의록 로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (!minutes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            TBM 회의록
          </CardTitle>
          <CardDescription>
            아직 AI 회의록이 생성되지 않았습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={triggerMutation.isPending}
          >
            {triggerMutation.isPending ? (
              <>
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <FileText className="mr-1 h-3 w-3" />
                회의록 생성
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const riskLevel = RISK_LEVEL_STYLES[minutes.riskAssessment.level] ?? {
    label: minutes.riskAssessment.level,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            TBM 회의록
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={triggerMutation.isPending}
          >
            {triggerMutation.isPending ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>
        {generatedAt && (
          <CardDescription>
            생성일시: {new Date(generatedAt).toLocaleString("ko-KR")}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <p>
            <span className="font-medium">회의 제목:</span> {minutes.title}
          </p>
          <p>
            <span className="font-medium">일시:</span> {minutes.date}
          </p>
          <p>
            <span className="font-medium">장소:</span> {minutes.location}
          </p>
          <p>
            <span className="font-medium">인솔자:</span> {minutes.leader}
          </p>
          <p>
            <span className="font-medium">참석 인원:</span>{" "}
            {minutes.attendeeCount}명
          </p>
          <p>
            <span className="font-medium">날씨:</span>{" "}
            {minutes.weatherCondition}
          </p>
        </div>

        <div className="border-t" />

        {minutes.agenda.length > 0 && (
          <div>
            <h4 className="mb-1 text-sm font-medium">회의 안건</h4>
            <ol className="list-decimal list-inside space-y-0.5 text-sm text-muted-foreground">
              {minutes.agenda.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        )}

        {minutes.discussionPoints.length > 0 && (
          <div>
            <h4 className="mb-1 text-sm font-medium">주요 논의 사항</h4>
            <ul className="list-disc list-inside space-y-0.5 text-sm text-muted-foreground">
              {minutes.discussionPoints.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {minutes.safetyInstructions.length > 0 && (
          <div>
            <h4 className="mb-1 text-sm font-medium">안전 지시사항</h4>
            <ul className="list-disc list-inside space-y-0.5 text-sm text-muted-foreground">
              {minutes.safetyInstructions.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="mb-1 text-sm font-medium">위험성 평가</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <Badge className={riskLevel.className}>{riskLevel.label}</Badge>
            {minutes.riskAssessment.keyRisks.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5">
                {minutes.riskAssessment.keyRisks.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {minutes.actionItems.length > 0 && (
          <div>
            <h4 className="mb-1 text-sm font-medium">조치 사항</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {minutes.actionItems.map((item: string) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-0.5">
                    □
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="mb-1 text-sm font-medium">결론</h4>
          <p className="text-sm text-muted-foreground">{minutes.conclusion}</p>
        </div>

        <div className="border-t pt-2 text-xs text-muted-foreground">
          AI 모델: {minutes.modelVersion}
        </div>
      </CardContent>
    </Card>
  );
}

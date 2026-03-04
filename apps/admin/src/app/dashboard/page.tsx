"use client";

import { FileText, Users, Clock } from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { useDashboardStats } from "@/hooks/use-api";
import { Skeleton } from "@safetywallet/ui";

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, idx) => `dash-skel-${idx + 1}`).map(
            (key) => (
              <Skeleton key={key} className="h-32" />
            ),
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="오늘의 출근 인원"
          value={stats?.activeUsersToday ?? 0}
          icon={Users}
          description="금일 출근 인증 완료"
        />
        <StatsCard
          title="오늘 접수된 제보"
          value={stats?.todayPostsCount ?? 0}
          icon={FileText}
          description="금일 신규 접수 건수"
        />
        <StatsCard
          title="미확인 제보"
          value={stats?.pendingCount ?? 0}
          icon={Clock}
          description="관리자 검토 대기"
        />
      </div>
    </div>
  );
}

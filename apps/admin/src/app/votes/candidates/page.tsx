"use client";

import Link from "next/link";
import { Button } from "@safetywallet/ui";

export default function VoteCandidatesPage() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">투표 후보 관리</h1>
      <p className="text-sm text-muted-foreground">
        투표 후보 관리는 현재 프로젝트 범위에서 제외되었습니다. 아래 버튼을 눌러
        투표 현황 페이지로 이동해주세요.
      </p>
      <Button asChild>
        <Link href="/votes">투표 관리로 이동</Link>
      </Button>
    </div>
  );
}

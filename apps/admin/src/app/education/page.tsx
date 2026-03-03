"use client";

import { useState } from "react";
import { Button } from "@safetywallet/ui";
import { cn } from "@/lib/utils";
import { ContentsTab } from "./components/contents-tab";
import { QuizzesTab } from "./components/quizzes-tab";
import { StatutoryTab } from "./components/statutory-tab";
import { TbmTab } from "./components/tbm-tab";
import { tabItems, type TabId } from "./education-helpers";

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState<TabId>("contents");

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold">교육 관리</h1>
        <p className="text-sm text-muted-foreground">
          교육자료, 퀴즈, 법정교육, TBM을 한 곳에서 관리합니다.
        </p>
      </div>
      <div className="border-b">
        <div className="flex gap-0">
          {tabItems.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant="ghost"
              className={cn(
                "rounded-none border-b-2 px-4 py-2",
                activeTab === tab.id
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
      {activeTab === "contents" && <ContentsTab />}
      {activeTab === "quizzes" && <QuizzesTab />}
      {activeTab === "statutory" && <StatutoryTab />}
      {activeTab === "tbm" && <TbmTab />}
    </div>
  );
}

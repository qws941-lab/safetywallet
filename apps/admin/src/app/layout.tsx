import type { Metadata, Viewport } from "next";
import { AdminShell } from "@/components/admin-shell";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@safetywallet/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "송도세브란스 관리자",
  description: "송도세브란스 안전 제보 관리 시스템",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
        >
          메인 콘텐츠로 건너뛰기
        </a>
        <ErrorBoundary>
          <Providers>
            <AdminShell>{children}</AdminShell>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

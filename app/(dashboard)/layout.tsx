// Layer: UI
// Type: Server Component — layout shell; nav is client for pathname
// RLS: pages fetch via lib/supabase; auth is optional (未ログインでも表示可)

import {
  AppHeaderFixed,
  AppHeaderTitleRow,
  NAV_BAR_HEIGHT,
  ROW1_HEIGHT,
} from '@/components/dashboard/AppHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerHeight = `calc(${ROW1_HEIGHT} + ${NAV_BAR_HEIGHT})`;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-base)]">
      <AppHeaderTitleRow />
      <AppHeaderFixed />
      {/* 固定ヘッダー高さ分のスペーサー（フロー上で確保）＋スクロール領域 */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className="shrink-0"
          style={{ height: headerHeight, minHeight: headerHeight }}
          aria-hidden
        />
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <main className="pt-[6rem]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

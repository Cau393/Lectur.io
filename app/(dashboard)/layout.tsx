// Layer: UI
// Type: Server Component — layout shell; nav is client for pathname
// RLS: pages fetch via lib/supabase; auth is optional (未ログインでも表示可)

import { Sidebar } from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="shrink-0 border-b border-[var(--bg-border)] bg-[var(--bg-surface)] px-6 py-3" />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

// Layer: UI
// Type: Server Component — auth check and layout shell; nav is client for pathname
// RLS: layout only checks auth; pages fetch via lib/supabase
// TODO: Re-enable auth redirect when done with temporary unauthenticated access

import Link from 'next/link';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporarily allow unauthenticated access to dashboard
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <aside
        className="sticky top-0 h-screen w-60 shrink-0 border-r border-[var(--bg-border)] bg-[var(--bg-surface)] py-6 px-3 flex flex-col gap-6"
        aria-label="Main navigation"
      >
        <Link
          href="/dashboard"
          className="px-3 text-lg font-semibold tracking-tight text-[var(--text-primary)] no-underline"
        >
          Lectur.io
        </Link>
        <DashboardSidebar />
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

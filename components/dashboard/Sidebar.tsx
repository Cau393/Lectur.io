// Layer: UI
// Type: Server Component — static navigation
// RLS: N/A — navigation only

import Link from 'next/link';

export function Sidebar() {
  return (
    <aside
      className="sticky top-0 h-screen w-60 shrink-0 flex flex-col gap-6 border-r border-[var(--bg-border)] bg-[var(--bg-surface)] py-6 px-3"
      aria-label="Main navigation"
    >
      <Link
        href="/dashboard"
        className="px-3 text-lg font-semibold tracking-tight text-[var(--text-primary)] no-underline"
      >
        Lectur.io
      </Link>
      <nav className="flex flex-col gap-1" aria-label="Primary">
        <Link
          href="/dashboard"
          className="rounded-md px-3 py-1.5 text-sm text-[var(--text-muted)] transition-all duration-150 hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
        >
          Dashboard
        </Link>
        <Link
          href="/classroom"
          className="rounded-md px-3 py-1.5 text-sm text-[var(--text-muted)] transition-all duration-150 hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
        >
          Classroom Hub
        </Link>
        <Link
          href="/social"
          className="rounded-md px-3 py-1.5 text-sm text-[var(--text-muted)] transition-all duration-150 hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
        >
          Social Hub
        </Link>
      </nav>
      <div className="mt-auto pt-6 border-t border-[var(--bg-border)]">
        <p className="px-3 text-sm text-[var(--text-muted)]" aria-hidden>
          User
        </p>
      </div>
    </aside>
  );
}

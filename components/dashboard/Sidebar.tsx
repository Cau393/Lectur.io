// Layer: UI
// Type: Client Component — pathname for active nav style
// RLS: N/A — navigation only

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinkBase =
  'rounded-md px-3 py-1.5 text-sm transition-all duration-150';
const navLinkInactive =
  'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]';
const navLinkActive =
  'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium';

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 h-screen w-60 shrink-0 flex flex-col gap-6 border-r border-[var(--border-card)] bg-[var(--bg-surface)] py-6 px-3"
      aria-label="Main navigation"
    >
      <Link
        href="/dashboard"
        className="px-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)] no-underline"
      >
        Lectur.io
      </Link>
      <nav className="flex flex-col gap-1" aria-label="Primary">
        <Link
          href="/dashboard"
          className={`${navLinkBase} ${isActive(pathname ?? '', '/dashboard') ? navLinkActive : navLinkInactive}`}
          aria-current={isActive(pathname ?? '', '/dashboard') ? 'page' : undefined}
        >
          Dashboard
        </Link>
        <Link
          href="/classroom"
          className={`${navLinkBase} ${isActive(pathname ?? '', '/classroom') ? navLinkActive : navLinkInactive}`}
          aria-current={isActive(pathname ?? '', '/classroom') ? 'page' : undefined}
        >
          Classroom Hub
        </Link>
        <Link
          href="/social"
          className={`${navLinkBase} ${isActive(pathname ?? '', '/social') ? navLinkActive : navLinkInactive}`}
          aria-current={isActive(pathname ?? '', '/social') ? 'page' : undefined}
        >
          Social Hub
        </Link>
      </nav>
      <div className="mt-auto pt-6 border-t border-[var(--border-card)]">
        <p className="px-3 text-sm text-[var(--text-muted)]" aria-hidden>
          User
        </p>
      </div>
    </aside>
  );
}

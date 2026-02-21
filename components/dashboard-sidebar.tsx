'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem =
  | { href: '/dashboard'; label: string }
  | { href: '/classroom'; label: string }
  | { href: '#'; label: string; mock: true };

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/classroom', label: 'Classroom Hub' },
  { href: '#', label: 'Social Hub', mock: true },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const mock = 'mock' in item && item.mock;
        const { href, label } = item;
        const isActive =
          !mock &&
          (href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith('/classroom'));
        const baseClass =
          'block w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-all duration-150';
        const activeClass =
          'bg-[var(--accent-subtle)] text-[var(--accent)]';
        const inactiveClass =
          'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]';

        if (mock) {
          return (
            <span
              key={label}
              className={`${baseClass} cursor-not-allowed text-[var(--text-muted)] opacity-60`}
              aria-disabled
            >
              {label}
            </span>
          );
        }

        return (
          <Link
            key={label}
            href={href}
            className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

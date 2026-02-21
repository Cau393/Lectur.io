'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: '/dashboard' | '/classroom' | '/social';
  label: string;
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/classroom', label: 'Classroom Hub' },
  { href: '/social', label: 'Social Hub' },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const { href, label } = item;
        const isActive =
          href === '/dashboard'
            ? pathname === '/dashboard'
            : href === '/social'
              ? pathname.startsWith('/social')
              : pathname.startsWith('/classroom');
        const baseClass =
          'block w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-all duration-150';
        const activeClass =
          'bg-[var(--accent-subtle)] text-[hsl(var(--accent))]';
        const inactiveClass =
          'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]';

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

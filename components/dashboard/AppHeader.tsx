// Layer: UI
// Type: Client Component — pathname for active nav style
// Two-row header: app title + user icon (row 1), horizontal nav tabs (row 2)

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
}

export const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/classroom', label: 'Classroom Hub' },
  { href: '/social', label: 'Social Hub' },
] as const;

/** 1段目（タイトル行）の高さ */
export const ROW1_HEIGHT = '3.5rem';
/** 2段目ナビの高さ（スペーサーと一致させる） */
export const NAV_BAR_HEIGHT = '2.5rem';

/** 2段目: 横並びナビ（1段目の直下に fixed、スクロールで画面上部に張り付く） */
export function AppHeaderFixed() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed left-0 right-0 z-10 flex min-h-[2.5rem] items-center gap-8 border-b border-[var(--bg-border)] bg-[var(--bg-surface)] px-8"
      style={{ top: ROW1_HEIGHT }}
      aria-label="Primary"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-8">
        {navItems.map(({ href, label }) => {
          const active = isActive(pathname ?? '', href);
          return (
            <Link
              key={href}
              href={href}
              className={`
                relative pt-2 pb-3 text-sm font-medium transition-colors duration-150
                ${active
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}
              `}
              aria-current={active ? 'page' : undefined}
            >
              {label}
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)]"
                  aria-hidden
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** 1段目（タイトル行）。2段目と同様に画面上部に fixed 固定。2段目と同じ px-8 + max-w-7xl で揃える。 */
export function AppHeaderTitleRow() {
  return (
    <div
      className="fixed left-0 right-0 top-0 z-20 shrink-0 bg-[var(--bg-surface)] px-8"
      role="banner"
      style={{ minHeight: ROW1_HEIGHT }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between py-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] no-underline"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white"
              aria-hidden
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="m4.93 4.93 2.83 2.83" />
                <path d="m16.24 16.24 2.83 2.83" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="m4.93 19.07 2.83-2.83" />
                <path d="m16.24 7.76 2.83-2.83" />
              </svg>
            </span>
            Lectur.io
          </Link>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
            aria-label="ユーザー"
          >
            <User className="h-5 w-5" strokeWidth={2} />
          </span>
      </div>
    </div>
  );
}

/** 1段目（タイトル行）。スクロール領域内なのでスクロールで隠れる。 */
function HeaderRow1() {
  return (
    <>
      <div style={{ height: NAV_BAR_HEIGHT }} aria-hidden />
      <AppHeaderTitleRow />
    </>
  );
}

/** ヘッダー全体（1段目＋固定ナビ）。レイアウトでナビをスクロール外に出す場合は AppHeaderScrollPart + AppHeaderFixed を使用。 */
export function AppHeader() {
  return (
    <>
      <HeaderRow1 />
      <AppHeaderFixed />
    </>
  );
}

/** スクロール領域内に置くヘッダー（1段目のみ）。レイアウトで固定ナビを外に出すときに使用。 */
export function AppHeaderScrollPart() {
  return <HeaderRow1 />;
}

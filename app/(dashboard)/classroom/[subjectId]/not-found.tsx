// Layer: UI
// Type: Server Component — static 404 content
// RLS: N/A — no data

import Link from 'next/link';

export default function SubjectNotFound() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-8 text-center shadow-[var(--shadow-card)]">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] mb-2">
          Subject not found
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          The subject does not exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/classroom"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-[hsl(var(--accent))] px-4 text-sm font-medium text-white no-underline transition-colors duration-150 hover:bg-[hsl(var(--accent-hover))]"
        >
          Back to Classroom Hub
        </Link>
      </div>
    </div>
  );
}

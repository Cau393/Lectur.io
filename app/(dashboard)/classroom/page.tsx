// Layer: UI
// Type: Server Component — will fetch data
// RLS: Will fetch subjects via RLS

import Link from 'next/link';
import { getSubjects } from '@/lib/supabase/subjects';

export default async function ClassroomPage() {
  const subjects = await getSubjects();

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] mb-8">
        Classroom Hub
      </h1>

      {subjects.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-12 text-center shadow-[var(--shadow-card)]">
          <p className="text-[var(--text-secondary)] mb-4">No subjects yet</p>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-medium text-white no-underline transition-colors duration-150 hover:bg-[hsl(var(--accent-hover))]"
          >
            Add your first subject
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/classroom/${subject.id}`}
              className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:border-[hsl(var(--accent)/0.3)] hover:bg-[var(--bg-hover)] cursor-pointer no-underline"
            >
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                {subject.name}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                View classes and roadmap
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Layer: UI
// Type: Server Component — data fetch; client used for Play placeholder if needed
// RLS: getSubjectById / getClassesBySubjectId enforce user ownership

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSubjectById, getClassesBySubjectId, type Class } from '@/lib/supabase/subjects';
import { ActiveClassView } from '@/components/active-class-view';

type ActiveClassPageProps = {
  params: Promise<{ subjectId: string; classId: string }>;
};

export default async function ActiveClassPage({ params }: ActiveClassPageProps) {
  const { subjectId, classId } = await params;
  const [subject, classes] = await Promise.all([
    getSubjectById(subjectId),
    getClassesBySubjectId(subjectId),
  ]);

  if (!subject) {
    notFound();
  }

  const cls = classes.find((c) => c.id === classId);
  if (!cls) {
    notFound();
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-base)]">
      <header className="shrink-0 border-b border-[var(--bg-border)] bg-[var(--bg-surface)] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href={`/classroom/${subjectId}`}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] no-underline transition-colors"
          >
            ← Back to {subject.name}
          </Link>
          <span className="text-[11px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
            Class {cls.order_index}
          </span>
        </div>
      </header>
      <ActiveClassView cls={cls} />
    </div>
  );
}

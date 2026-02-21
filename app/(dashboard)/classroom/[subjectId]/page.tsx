// Layer: UI
// Type: Server Component — data fetching; client used for Generate Homework action
// RLS: getSubjectById / getClassesBySubjectId enforce user ownership

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSubjectById, getClassesBySubjectId, type Class } from '@/lib/supabase/subjects';
import { getCurrentUser } from '@/lib/supabase/auth';
import { ClassCardHomeworkSection } from '@/components/ClassCardHomeworkSection';

type SubjectDetailPageProps = {
  params: Promise<{ subjectId: string }>;
};

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { subjectId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [subject, classes] = await Promise.all([
    getSubjectById(subjectId),
    getClassesBySubjectId(subjectId),
  ]);

  if (!subject) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] mb-8">
        {subject.name}
      </h1>

      <div className="relative border-l-2 border-[var(--bg-border)] ml-4 pl-8 space-y-8">
        {classes.map((cls) => (
          <ClassCard key={cls.id} cls={cls} subjectId={subjectId} />
        ))}
      </div>
    </div>
  );
}

function ClassCard({ cls, subjectId }: { cls: Class; subjectId: string }) {
  const hasHomework = Boolean(cls.homework_markdown?.trim());

  return (
    <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-hover)]">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-2xl font-extrabold text-[var(--color-primary)]">
          Class {cls.order_index}
        </span>
        <span className="inline-flex items-center rounded-full bg-[var(--bg-overlay)] px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-[var(--text-muted)] shrink-0">
          {cls.duration_minutes} min
        </span>
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] mb-3">
        {cls.title}
      </h2>
      {cls.topics.length > 0 && (
        <ul className="list-disc list-inside text-sm text-[var(--text-secondary)] mb-4 space-y-1">
          {cls.topics.map((topic, i) => (
            <li key={i}>{topic}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/classroom/${subjectId}/${cls.id}`}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-white no-underline transition-colors duration-150 hover:bg-[var(--color-primary-hover)]"
        >
          Start Class
        </Link>
        <ClassCardHomeworkSection
          classId={cls.id}
          hasHomework={hasHomework}
          homeworkMarkdown={cls.homework_markdown}
        />
      </div>
    </div>
  );
}

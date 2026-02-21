// Layer: UI
// Type: Server Component — data fetching; client used for Generate Homework action
// RLS: getSubjectById / getClassesBySubjectId enforce user ownership

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSubjectById, getClassesBySubjectId, type Class } from '@/lib/supabase/subjects';
import { getCurrentUser } from '@/lib/supabase/auth';
import { GenerateHomeworkButton } from '@/components/generate-homework-button';

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
    <div className="max-w-6xl mx-auto px-8 py-12">
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
  const homeworkPreview = hasHomework
    ? cls.homework_markdown!.split('\n').slice(0, 4).join('\n')
    : null;

  return (
    <div className="rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)] p-6 transition-all duration-200 ease-out hover:border-[var(--accent)]/30 hover:bg-[var(--bg-overlay)]">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="inline-flex items-center text-[11px] font-medium uppercase tracking-widest text-[var(--text-muted)] border border-[var(--bg-border)] rounded-md px-2 py-0.5">
          Class {cls.order_index}
        </span>
        <span className="inline-flex items-center text-[11px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
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
      <div className="mb-4">
        <p className="text-[11px] font-medium uppercase tracking-widest text-[var(--text-muted)] mb-2">
          Homework
        </p>
        {homeworkPreview ? (
          <pre className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap font-sans bg-[var(--bg-overlay)] rounded-lg p-4 border border-[var(--bg-border)]">
            {homeworkPreview}
            {cls.homework_markdown!.includes('\n') && '…'}
          </pre>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Homework not generated</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/classroom/${subjectId}/${cls.id}`}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white no-underline transition-colors duration-150 hover:bg-[var(--accent-hover)]"
        >
          Start Class
        </Link>
        <GenerateHomeworkButton classId={cls.id} hasHomework={hasHomework} />
      </div>
    </div>
  );
}

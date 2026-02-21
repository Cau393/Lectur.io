// Layer: UI
// Type: Server Component — fetches user + subjects; AddSubjectForm is client
// RLS: not applicable; API route enforces auth

import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AddSubjectForm } from '@/components/dashboard/AddSubjectForm';
import {
  getCurrentUser,
  getSubjects,
  getClassesBySubjectId,
  type Class,
} from '@/lib/supabase';

const RECENT_SUBJECTS_LIMIT = 5;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const subjects = await getSubjects();
  const classesPerSubject = await Promise.all(
    subjects.map((s) => getClassesBySubjectId(s.id))
  );
  const recentSubjects = subjects.slice(0, RECENT_SUBJECTS_LIMIT);
  const recentClassCounts = classesPerSubject
    .slice(0, RECENT_SUBJECTS_LIMIT)
    .map((classes: Class[]) => classes.length);

  const greeting = 'Welcome back';

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-[hsl(var(--accent))] mb-2">
        {greeting}
      </h1>

      {subjects.length > 0 && (
        <p className="text-base text-[var(--text-muted)] mb-8">
          AI creates classes tailored to what you want to learn.
        </p>
      )}

      {subjects.length === 0 ? (
        <div className="space-y-8">
          <p className="text-[var(--text-secondary)]">
            You don&apos;t have any subjects yet. Add your first subject to get
            a syllabus and start learning.
          </p>
          <Card className="max-w-xl rounded-xl border-[var(--border-card)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] transition-all duration-200 ease-out">
            <CardHeader className="space-y-2 p-0 pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                Add Subject
              </CardTitle>
              <CardDescription className="text-base text-[var(--text-secondary)]">
                Enter a subject name and AI will generate an 80-minute class
                syllabus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-0">
              <AddSubjectForm />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-xl border-[var(--border-card)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] transition-all duration-200 ease-out">
            <CardHeader className="space-y-2 p-0 pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                Add Subject
              </CardTitle>
              <CardDescription className="text-base text-[var(--text-secondary)]">
                Enter a subject name and AI will generate an 80-minute class
                syllabus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-0">
              <AddSubjectForm />
            </CardContent>
          </Card>

          <div className="flex flex-col rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] mb-4 shrink-0">
              Recent subjects
            </h2>
            <ul className="min-h-0 flex-1 space-y-3">
              {recentSubjects.map((subject, i) => (
                <li key={subject.id}>
                  <Link
                    href={`/classroom/${subject.id}`}
                    className="flex items-center justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-surface)] p-4 text-[var(--text-primary)] transition-all duration-200 ease-out hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-hover)] no-underline"
                  >
                    <span className="font-medium">
                      {subject.name}
                    </span>
                    {recentClassCounts[i] !== undefined && (
                      <span className="text-sm text-[var(--text-muted)]">
                        {recentClassCounts[i]} classes
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/classroom"
              className="mt-4 flex h-11 w-full shrink-0 items-center justify-center rounded-lg border border-[var(--border-card)] bg-[var(--bg-surface)] text-sm font-medium text-[var(--text-primary)] no-underline transition-all duration-200 ease-out hover:border-[var(--color-primary)]/30 hover:bg-[var(--bg-hover)]"
            >
              Classroom Hub
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

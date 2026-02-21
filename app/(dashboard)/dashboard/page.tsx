// Layer: UI
// Type: Server Component — page structure, data fetching
// RLS: getSubjects / getClassesBySubjectId / getCurrentUserProfile enforce user ownership

import { redirect } from 'next/navigation';
import Link from 'next/link';
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
  getCurrentUserProfile,
  getSubjects,
  getClassesBySubjectId,
  type Class,
} from '@/lib/supabase';

const RECENT_SUBJECTS_LIMIT = 5;

function formatTotalDuration(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [profile, subjects] = await Promise.all([
    getCurrentUserProfile(),
    getSubjects(),
  ]);

  const classesPerSubject: Class[][] = await Promise.all(
    subjects.map((s) => getClassesBySubjectId(s.id))
  );

  const totalClasses = classesPerSubject.reduce((sum, classes) => sum + classes.length, 0);
  const totalMinutes = classesPerSubject.reduce(
    (sum, classes) => sum + classes.reduce((s, c) => s + c.duration_minutes, 0),
    0
  );
  const withHomework = classesPerSubject.reduce(
    (sum, classes) =>
      sum + classes.filter((c) => Boolean(c.homework_markdown?.trim())).length,
    0
  );

  const recentSubjects = subjects.slice(0, RECENT_SUBJECTS_LIMIT);
  const recentClassCounts = classesPerSubject.slice(0, RECENT_SUBJECTS_LIMIT).map(
    (classes) => classes.length
  );

  const greeting = profile?.full_name?.trim()
    ? `Welcome back, ${profile.full_name}`
    : 'Welcome back';

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] mb-2">
        {greeting}
      </h1>

      {subjects.length > 0 && (
        <p className="text-sm text-[var(--text-muted)] mb-8">
          {subjects.length} subject{subjects.length !== 1 ? 's' : ''} · {totalClasses} classes
          · {formatTotalDuration(totalMinutes)} total
          {withHomework > 0 && ` · ${withHomework} with homework`}
        </p>
      )}

      {subjects.length === 0 ? (
        <div className="space-y-8">
          <p className="text-[var(--text-secondary)]">
            You don&apos;t have any subjects yet. Add your first subject to get a syllabus and start learning.
          </p>
          <Card className="max-w-xl rounded-xl border-[var(--border-card)] bg-[var(--bg-surface)] p-6 shadow-none transition-all duration-200 ease-out">
            <CardHeader className="space-y-2 p-0 pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                Add Subject
              </CardTitle>
              <CardDescription className="text-base text-[var(--text-secondary)]">
                Enter a subject name and AI will generate an 80-minute class syllabus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-0">
              <AddSubjectForm />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-xl border-[var(--border-card)] bg-[var(--bg-surface)] p-6 shadow-none transition-all duration-200 ease-out">
            <CardHeader className="space-y-2 p-0 pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                Add Subject
              </CardTitle>
              <CardDescription className="text-base text-[var(--text-secondary)]">
                Enter a subject name and AI will generate an 80-minute class syllabus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-0">
              <AddSubjectForm />
            </CardContent>
          </Card>

          <div className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-surface)] p-6">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] mb-4">
              Recent subjects
            </h2>
            <ul className="space-y-3">
              {recentSubjects.map((subject, i) => (
                <li key={subject.id}>
                  <Link
                    href={`/classroom/${subject.id}`}
                    className="flex items-center justify-between rounded-lg border border-[var(--border-card)] bg-[var(--bg-surface)] p-4 transition-all duration-200 ease-out hover:border-[var(--accent)]/30 hover:bg-[var(--bg-hover)] no-underline"
                  >
                    <span className="font-medium text-[var(--text-primary)]">
                      {subject.name}
                    </span>
                    <span className="inline-flex items-center text-[11px] font-medium uppercase tracking-widest text-[var(--text-muted)] border border-[var(--border-card)] rounded-md px-2 py-0.5">
                      {recentClassCounts[i]} classes
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/classroom"
              className="mt-4 inline-flex items-center text-sm font-medium text-[var(--accent)] no-underline transition-colors duration-150 hover:text-[var(--accent-hover)]"
            >
              View all → Classroom Hub
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

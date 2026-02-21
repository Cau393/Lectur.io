// Layer: UI
// Type: Server Component — data fetch; client used for Play placeholder if needed
// RLS: Fetches class via RLS

import { ActiveClassView } from '@/components/active-class-view';
import {
  getSubjectById,
  getClassesBySubjectId,
} from '@/lib/supabase/subjects';
import { notFound } from 'next/navigation';

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
    <div className="fixed inset-0 flex flex-col bg-[var(--bg-base)] pt-[6rem]">
      <ActiveClassView cls={cls} />
    </div>
  );
}

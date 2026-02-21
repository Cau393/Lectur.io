'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GenerateHomeworkButton } from '@/components/generate-homework-button';
import { HomeworkViewModal } from '@/components/HomeworkViewModal';

type ClassCardHomeworkSectionProps = {
  classId: string;
  hasHomework: boolean;
  homeworkMarkdown: string | null;
};

export function ClassCardHomeworkSection({
  classId,
  hasHomework,
  homeworkMarkdown,
}: ClassCardHomeworkSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!hasHomework) {
    return <GenerateHomeworkButton classId={classId} hasHomework={false} />;
  }

  const markdown = homeworkMarkdown?.trim() ?? '';

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setModalOpen(true)}
        className="border-[var(--bg-border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] text-sm"
      >
        View homework
      </Button>
      <HomeworkViewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        markdown={markdown}
      />
    </div>
  );
}

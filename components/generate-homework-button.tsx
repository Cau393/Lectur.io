'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type GenerateHomeworkButtonProps = {
  classId: string;
  hasHomework: boolean;
};

export function GenerateHomeworkButton({
  classId,
  hasHomework,
}: GenerateHomeworkButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId }),
        credentials: 'include',
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(
          data.error ??
            (res.status === 404 || res.status === 501
              ? 'Homework generation is not available yet'
              : 'Failed to generate homework')
        );
        setIsLoading(false);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isLoading || hasHomework}
        className="border-[var(--bg-border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] text-sm"
      >
        {isLoading
          ? 'Generating...'
          : hasHomework
            ? 'Homework generated'
            : 'Generate Homework'}
      </Button>
      {error && (
        <p className="text-xs text-[var(--error)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

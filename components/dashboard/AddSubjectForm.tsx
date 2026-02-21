'use client';

// Layer: UI
// Type: Client Component — form state, loading, API call
// RLS: not applicable; API route enforces auth

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const addSubjectSchema = z.object({
  subjectName: z
    .string()
    .min(1, 'Subject name is required')
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, 'Subject name is required'),
});

type AddSubjectFormValues = z.infer<typeof addSubjectSchema>;

export function AddSubjectForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddSubjectFormValues>({
    resolver: zodResolver(addSubjectSchema),
    defaultValues: { subjectName: '' },
  });

  const onSubmit = async (values: AddSubjectFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName: values.subjectName.trim() }),
      });

      const data = (await res.json()) as { subjectId?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Failed to create syllabus');
        setIsLoading(false);
        return;
      }

      if (data.subjectId) {
        router.push(`/classroom/${data.subjectId}`);
        router.refresh();
      } else {
        setError('Invalid response from server');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <Alert
            variant="destructive"
            className="rounded-lg border-[var(--error)]/50 bg-[var(--error)]/10 text-[var(--error)] [&>svg]:text-[var(--error)]"
          >
            <AlertTitle className="font-medium">Error</AlertTitle>
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="subjectName"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-medium text-[var(--text-primary)]">
                Subject name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Introduction to Economics"
                  className="h-11 rounded-lg border-[var(--bg-border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:border-[var(--accent)] focus-visible:ring-[var(--accent)]/30"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[var(--error)] text-sm" />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--color-primary-hover)] disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                Generating syllabus...
              </span>
            ) : (
              'Generate Syllabus'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

'use client';

import { useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';

type HomeworkViewModalProps = {
  open: boolean;
  onClose: () => void;
  markdown: string;
  title?: string;
};

export function HomeworkViewModal({
  open,
  onClose,
  markdown,
  title,
}: HomeworkViewModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-base)]"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Homework'}
    >
      <header className="shrink-0 flex items-center justify-between border-b border-[var(--bg-border)] bg-[var(--bg-surface)] px-6 py-3">
        {title && (
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>
        )}
        <div className={title ? '' : 'ml-auto'}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-[var(--bg-border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
          >
            Close
          </Button>
        </div>
      </header>
      <div
        className="flex-1 overflow-auto px-6 py-6"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="mx-auto max-w-3xl">
          <article
            className="homework-markdown rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)] p-6 text-[var(--text-primary)]"
            onClick={(e) => e.stopPropagation()}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-4 mt-6 text-xl font-semibold tracking-tight first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-3 mt-5 text-lg font-semibold tracking-tight">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-2 mt-4 text-base font-semibold">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-3 leading-[1.7] last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 list-disc list-inside space-y-1 pl-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-3 list-decimal list-inside space-y-1 pl-2">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-[var(--text-secondary)]">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-[var(--text-primary)]">
                    {children}
                  </strong>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-[var(--bg-overlay)] px-1.5 py-0.5 font-mono text-sm text-[var(--text-secondary)]">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="mb-3 overflow-x-auto rounded-lg border border-[var(--bg-border)] bg-[var(--bg-overlay)] p-4 font-mono text-sm text-[var(--text-secondary)] last:mb-0">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[var(--accent)] pl-4 italic text-[var(--text-secondary)]">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] underline hover:text-[var(--accent-hover)]"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}

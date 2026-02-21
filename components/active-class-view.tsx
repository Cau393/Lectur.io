'use client';

import { useMemo } from 'react';
import { useRealtimeSession } from '@/hooks/use-realtime-session';
import type { Class } from '@/lib/supabase/subjects';

type ActiveClassViewProps = {
  cls: Class;
};

export function ActiveClassView({ cls }: ActiveClassViewProps) {
  const initialPrompt = useMemo(
    () =>
      `You are teaching a class. Class title: "${cls.title}". Topics to cover: ${cls.topics.join(', ')}. Deliver the lesson from the beginning in a clear, engaging way. This is an 80-minute class; start with a brief intro and the first few minutes of content.`,
    [cls.title, cls.topics]
  );

  const {
    status,
    errorMessage,
    startSession,
    disconnect,
  } = useRealtimeSession({ initialPrompt });

  return (
    <>
      <main className="flex-1 overflow-auto flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[900px]">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] mb-8">
            {cls.title}
          </h1>
          <ul className="space-y-3 text-[var(--text-secondary)] text-lg">
            {cls.topics.map((topic, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[var(--accent)] font-medium shrink-0">
                  {i + 1}.
                </span>
                <span>{topic}</span>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-col items-center gap-3">
            {status === 'idle' && (
              <button
                type="button"
                onClick={startSession}
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--accent)] px-8 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--accent-hover)]"
              >
                Play
              </button>
            )}
            {(status === 'connecting' || status === 'connected') && (
              <button
                type="button"
                onClick={disconnect}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--bg-border)] bg-[var(--bg-surface)] px-8 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-base)]"
              >
                End voice
              </button>
            )}
            {status === 'connecting' && (
              <p className="text-center text-sm text-[var(--text-muted)]">
                Connecting… allow microphone when prompted.
              </p>
            )}
            {status === 'connected' && (
              <p className="text-center text-sm text-[var(--text-muted)]">
                Voice class is live. Listen through your speakers.
              </p>
            )}
            {status === 'error' && errorMessage && (
              <p className="text-center text-sm text-red-600 max-w-md">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </main>
      <footer className="shrink-0 border-t border-[var(--bg-border)] bg-[var(--bg-surface)]/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
          <span className="text-sm text-[var(--text-muted)]">
            {status === 'idle' && 'Click Play to start the voice class'}
            {status === 'connecting' && 'Connecting…'}
            {status === 'connected' && 'Voice active'}
            {status === 'error' && 'Connection failed'}
          </span>
        </div>
      </footer>
    </>
  );
}

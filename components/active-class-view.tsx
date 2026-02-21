'use client';

import { useState } from 'react';
import type { Class } from '@/lib/supabase/subjects';

type ActiveClassViewProps = {
  cls: Class;
};

export function ActiveClassView({ cls }: ActiveClassViewProps) {
  const [playStarted, setPlayStarted] = useState(false);

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
            <button
              type="button"
              onClick={() => setPlayStarted(true)}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--accent)] px-8 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--accent-hover)]"
            >
              Play
            </button>
            {playStarted && (
              <p className="text-center text-sm text-[var(--text-muted)]">
                Voice will start here (WebRTC coming soon)
              </p>
            )}
          </div>
        </div>
      </main>
      <footer className="shrink-0 border-t border-[var(--bg-border)] bg-[var(--bg-surface)]/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <span className="text-sm text-[var(--text-muted)]">
            Voice controls (placeholder)
          </span>
        </div>
      </footer>
    </>
  );
}

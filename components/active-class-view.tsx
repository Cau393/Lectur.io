'use client';

import { useState } from 'react';
import type { Class, Slide } from '@/lib/supabase/subjects';

type ActiveClassViewProps = {
  cls: Class;
};

function SlideCard({ slide }: { slide: Slide }) {
  return (
    <div className="rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)] p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] mb-4">
        {slide.title}
      </h2>
      {slide.bullet_points.length > 0 && (
        <ul className="space-y-2 text-[var(--text-secondary)]">
          {slide.bullet_points.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="text-[var(--accent)] shrink-0">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
      {slide.real_world_example && (
        <div className="mt-4 pt-4 border-t border-[var(--bg-border)]">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[var(--text-muted)] mb-2">
            Real-world example
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            {slide.real_world_example}
          </p>
        </div>
      )}
    </div>
  );
}

export function ActiveClassView({ cls }: ActiveClassViewProps) {
  const [playStarted, setPlayStarted] = useState(false);
  const slides = cls.slides ?? [];
  const hasSlides = slides.length > 0;

  return (
    <>
      <main className="flex-1 overflow-auto flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-[900px]">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {cls.title}
            </h1>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setPlayStarted(true)}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--accent)] px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--accent-hover)]"
              >
                Play
              </button>
            </div>
          </div>

          {hasSlides ? (
            <div className="space-y-6">
              {[...slides]
                .sort((a, b) => a.slide_index - b.slide_index)
                .map((slide) => (
                  <SlideCard
                    key={`${slide.slide_index}-${slide.title}`}
                    slide={slide}
                  />
                ))}
            </div>
          ) : (
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
          )}

          {playStarted && (
            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              Voice will start here (WebRTC coming soon)
            </p>
          )}
        </div>
      </main>
      <footer className="shrink-0 border-t border-[var(--bg-border)] bg-[var(--bg-surface)]/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
          <span className="text-sm text-[var(--text-muted)]">
            {hasSlides
              ? `${slides.length} lecture slides`
              : 'Voice controls (placeholder)'}
          </span>
        </div>
      </footer>
    </>
  );
}

'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRealtimeSession } from '@/hooks/use-realtime-session';
import type { Class, Slide } from '@/lib/supabase/subjects';

type ActiveClassViewProps = {
  cls: Class;
};

function buildSlidePrompt(slide: Slide, isNewSlide = false): string {
  const intro = isNewSlide
    ? 'We have moved to a new slide. Start teaching this slide now. '
    : '';
  const parts = [
    `${intro}Teach this slide in depth. Spend 5 to 10 minutes on this slide — do not just read the bullet points.`,
    `Slide title: "${slide.title}".`,
  ];
  if (slide.bullet_points.length > 0) {
    parts.push(
      `Expand on each of these points with explanations, examples, and context: ${slide.bullet_points.join(' ')}. Elaborate so a student really understands; aim for 5-10 minutes of teaching for this slide.`
    );
  }
  if (slide.real_world_example) {
    parts.push(
      `Weave in this real-world example and discuss it: ${slide.real_world_example}.`
    );
  }
  parts.push(
    'At the end of this slide (after your 5-10 minute teaching), ask the student: "Do you have any questions before we move on?" and pause to allow them to respond.'
  );
  return parts.join(' ');
}

function buildClassFallbackPrompt(cls: Class): string {
  return `You are teaching a class. Class title: "${cls.title}". Topics to cover: ${cls.topics.join(', ')}. Deliver the lesson from the beginning in a clear, engaging way. This is an 40-minute class; start with a brief intro and the first few minutes of content.`;
}

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
              <span className="text-[hsl(var(--accent))] shrink-0">•</span>
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
  const sortedSlides = useMemo(() => {
    const s = cls.slides ?? [];
    return [...s].sort((a, b) => a.slide_index - b.slide_index);
  }, [cls.slides]);
  const hasSlides = sortedSlides.length > 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = hasSlides ? sortedSlides[currentIndex] : null;
  const prevIndexRef = useRef(0);

  // Use the currently visible slide when Play is pressed so audio starts for that slide.
  const initialPrompt = useMemo(() => {
    if (hasSlides && sortedSlides[currentIndex])
      return buildSlidePrompt(sortedSlides[currentIndex], false);
    return buildClassFallbackPrompt(cls);
  }, [hasSlides, sortedSlides, currentIndex, cls]);

  const {
    status,
    errorMessage,
    startSession,
    disconnect,
    sendPrompt,
  } = useRealtimeSession({ initialPrompt });

  // When we first connect, sync so we don't re-send the same slide (initialPrompt already sent it).
  useEffect(() => {
    if (status === 'connected') prevIndexRef.current = currentIndex;
  }, [status, currentIndex]);

  // When user reaches a new slide and voice is connected, auto-start audio for that slide.
  useEffect(() => {
    if (status !== 'connected' || !hasSlides || !currentSlide) return;
    if (prevIndexRef.current === currentIndex) return;
    prevIndexRef.current = currentIndex;
    sendPrompt(buildSlidePrompt(currentSlide, true));
  }, [currentIndex, status, hasSlides, currentSlide, sendPrompt]);

  const goPrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };
  const goNext = () => {
    setCurrentIndex((i) => Math.min(sortedSlides.length - 1, i + 1));
  };

  // Reset to first slide when voice session ends so next Play starts in sync.
  useEffect(() => {
    if (status === 'idle') {
      setCurrentIndex(0);
      prevIndexRef.current = 0;
    }
  }, [status]);

  return (
    <>
      <main className="flex-1 overflow-auto flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-[900px] flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {cls.title}
            </h1>
            <div className="flex items-center gap-3">
              {status === 'idle' && (
                <button
                  type="button"
                  onClick={startSession}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-[hsl(var(--accent))] px-6 text-sm font-medium text-white transition-colors duration-150 hover:bg-[hsl(var(--accent-hover))]"
                >
                  Play
                </button>
              )}
              {(status === 'connecting' || status === 'connected') && (
                <button
                  type="button"
                  onClick={disconnect}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--bg-border)] bg-[var(--bg-surface)] px-6 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-base)]"
                >
                  End voice
                </button>
              )}
            </div>
          </div>

          {hasSlides ? (
            <>
              <div className="w-full mb-8">
                <SlideCard slide={currentSlide!} />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--bg-border)] bg-[var(--bg-surface)] px-4 text-sm font-medium text-[var(--text-primary)] disabled:opacity-50 disabled:pointer-events-none hover:bg-[var(--bg-base)]"
                >
                  ← Previous
                </button>
                <span className="text-sm text-[var(--text-muted)]">
                  Slide {currentIndex + 1} of {sortedSlides.length}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={currentIndex === sortedSlides.length - 1}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--bg-border)] bg-[var(--bg-surface)] px-4 text-sm font-medium text-[var(--text-primary)] disabled:opacity-50 disabled:pointer-events-none hover:bg-[var(--bg-base)]"
                >
                  Next →
                </button>
              </div>
            </>
          ) : (
            <ul className="space-y-3 text-[var(--text-secondary)] text-lg w-full">
              {cls.topics.map((topic, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[hsl(var(--accent))] font-medium shrink-0">
                    {i + 1}.
                  </span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          )}

          {status === 'connecting' && (
            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              Connecting… allow microphone when prompted.
            </p>
          )}
          {status === 'connected' && (
            <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
              Voice is live. Change slides to have the AI teach each one.
            </p>
          )}
          {status === 'error' && errorMessage && (
            <p className="mt-6 text-center text-sm text-red-600 max-w-md">
              {errorMessage}
            </p>
          )}
        </div>
      </main>
      <footer className="shrink-0 border-t border-[var(--bg-border)] bg-[var(--bg-surface)]/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap">
          <span className="text-sm text-[var(--text-muted)]">
            {status === 'idle' && 'Click Play to start the voice class'}
            {status === 'connecting' && 'Connecting…'}
            {status === 'connected' && 'Voice active — use Previous/Next to move slides'}
            {status === 'error' && 'Connection failed'}
          </span>
        </div>
      </footer>
    </>
  );
}

'use client';

import { useRealtimeSession } from '@/hooks/use-realtime-session';

export default function RealtimeTestPage() {
  const {
    status,
    errorMessage,
    startSession,
    disconnect,
    sendPrompt,
  } = useRealtimeSession();

  const handleAskLesson = () => {
    sendPrompt(
      'Give a very short 20-second lesson on what a variable is in programming. Speak clearly and then stop.'
    );
  };

  return (
    <div className="min-h-screen p-8 font-sans">
      <div className="mx-auto max-w-lg space-y-6">
        <p className="text-sm">
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to home
          </a>
        </p>
        <h1 className="text-2xl font-bold">Realtime WebRTC test</h1>
        <p className="text-sm text-neutral-600">
          Test the OpenAI Realtime API (voice) without the full app. You need a
          microphone and{' '}
          <code className="rounded bg-neutral-100 px-1">OPENAI_API_KEY</code> in
          .env.local.
        </p>

        <div className="flex flex-wrap gap-3">
          {status === 'idle' && (
            <button
              type="button"
              onClick={startSession}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Start voice session
            </button>
          )}
          {(status === 'connecting' || status === 'connected') && (
            <button
              type="button"
              onClick={disconnect}
              className="rounded bg-neutral-200 px-4 py-2 hover:bg-neutral-300"
            >
              Disconnect
            </button>
          )}
          {status === 'connected' && (
            <button
              type="button"
              onClick={handleAskLesson}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Ask for short lesson (speaks back)
            </button>
          )}
        </div>

        <p className="text-sm">
          Status: <strong>{status}</strong>
        </p>
        {errorMessage && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-800">
            {errorMessage}
          </p>
        )}

        <p className="text-xs text-neutral-500">
          When connected, allow microphone when prompted. Click &quot;Ask for
          short lesson&quot; to have the model respond with voice. This page is
          for dev testing only.
        </p>
      </div>
    </div>
  );
}

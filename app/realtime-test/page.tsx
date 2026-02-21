'use client';

import { useCallback, useRef, useState } from 'react';

type Status = 'idle' | 'connecting' | 'connected' | 'error';

export default function RealtimeTestPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const disconnect = useCallback(() => {
    const pc = pcRef.current;
    if (pc) {
      pc.getSenders().forEach((s) => s.track?.stop());
      pc.close();
      pcRef.current = null;
    }
    dataChannelRef.current = null;
    if (audioRef.current) audioRef.current.srcObject = null;
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const startSession = useCallback(async () => {
    setStatus('connecting');
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      const audio = document.createElement('audio');
      audio.autoplay = true;
      audioRef.current = audio;
      pc.ontrack = (e) => {
        if (audio.srcObject !== e.streams[0]) {
          audio.srcObject = e.streams[0];
        }
      };

      pc.addTrack(stream.getTracks()[0]);

      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;
      dc.addEventListener('open', () => {
        setStatus('connected');
      });
      dc.addEventListener('message', (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === 'error') {
            console.error('[realtime] server event', event);
          }
        } catch {
          // ignore non-JSON
        }
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch('/api/realtime/session', {
        method: 'POST',
        body: offer.sdp ?? '',
        headers: { 'Content-Type': 'application/sdp' },
      });

      if (!sdpResponse.ok) {
        const err = await sdpResponse.json().catch(() => ({ error: sdpResponse.statusText }));
        throw new Error(err.error ?? `Session failed: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to start session');
      setStatus('error');
      disconnect();
    }
  }, [disconnect]);

  const sendPrompt = useCallback(() => {
    const dc = dataChannelRef.current;
    if (!dc || dc.readyState !== 'open') return;

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Give a very short 20-second lesson on what a variable is in programming. Speak clearly and then stop.',
          },
        ],
      },
    };
    dc.send(JSON.stringify(event));
  }, []);

  return (
    <div className="min-h-screen p-8 font-sans">
      <div className="mx-auto max-w-lg space-y-6">
        <p className="text-sm">
          <a href="/" className="text-blue-600 hover:underline">← Back to home</a>
        </p>
        <h1 className="text-2xl font-bold">Realtime WebRTC test</h1>
        <p className="text-sm text-neutral-600">
          Test the OpenAI Realtime API (voice) without the full app. You need a microphone and{' '}
          <code className="rounded bg-neutral-100 px-1">OPENAI_API_KEY</code> in .env.local.
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
              onClick={sendPrompt}
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
          <p className="rounded bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>
        )}

        <p className="text-xs text-neutral-500">
          When connected, allow microphone when prompted. Click &quot;Ask for short lesson&quot; to
          have the model respond with voice. This page is for dev testing only.
        </p>
      </div>
    </div>
  );
}

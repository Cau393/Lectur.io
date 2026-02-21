'use client';

import { useCallback, useRef, useState } from 'react';

export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'error';

export type UseRealtimeSessionOptions = {
  /** If set, this prompt is sent as soon as the data channel opens (e.g. class context for teaching). */
  initialPrompt?: string;
};

export function useRealtimeSession(options: UseRealtimeSessionOptions = {}) {
  const { initialPrompt } = options;
  const [status, setStatus] = useState<RealtimeStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
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
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    setStatus('idle');
    setErrorMessage(null);
    setTranscript('');
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
        if (initialPrompt?.trim()) {
          dc.send(
            JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'message',
                role: 'user',
                content: [{ type: 'input_text', text: initialPrompt }],
              },
            })
          );
        }
      });
      dc.addEventListener('message', (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event.type === 'error') {
            console.error('[realtime] server event', event);
          }
          // Live transcript: accumulate AI speech from audio transcript deltas
          if (event.type === 'response.output_audio_transcript.delta') {
            const text =
              typeof event.delta === 'string'
                ? event.delta
                : typeof (event as { transcript?: string }).transcript === 'string'
                  ? (event as { transcript: string }).transcript
                  : '';
            if (text) setTranscript((prev) => prev + text);
          }
          // Optional: add newline when a response finishes for readability
          if (event.type === 'response.done') {
            setTranscript((prev) => (prev ? `${prev}\n\n` : prev));
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
        const err = await sdpResponse
          .json()
          .catch(() => ({ error: sdpResponse.statusText }));
        throw new Error(err.error ?? `Session failed: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to start session'
      );
      setStatus('error');
      disconnect();
    }
  }, [initialPrompt, disconnect]);

  const sendPrompt = useCallback((text: string) => {
    const dc = dataChannelRef.current;
    if (!dc || dc.readyState !== 'open') return;
    dc.send(
      JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text }],
        },
      })
    );
  }, []);

  return {
    status,
    errorMessage,
    transcript,
    startSession,
    disconnect,
    sendPrompt,
  };
}

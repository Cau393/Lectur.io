import { NextRequest } from 'next/server';

const REALTIME_URL = 'https://api.openai.com/v1/realtime/calls';

/**
 * Session config for OpenAI Realtime (WebRTC).
 * See https://platform.openai.com/docs/guides/realtime-webrtc
 */
const sessionConfig = JSON.stringify({
  type: 'realtime',
  model: 'gpt-realtime',
  audio: { output: { voice: 'alloy' } },
});

/**
 * POST body: raw SDP offer (text).
 * Returns: SDP answer (text) to set as remote description.
 * Uses unified interface: server holds API key and proxies to OpenAI.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'OPENAI_API_KEY not configured' },
      { status: 500 }
    );
  }

  let sdpOffer: string;
  try {
    sdpOffer = await request.text();
    if (!sdpOffer?.trim()) {
      return Response.json(
        { error: 'SDP offer body is required' },
        { status: 400 }
      );
    }
  } catch {
    return Response.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const form = new FormData();
  form.set('sdp', sdpOffer);
  form.set('session', sessionConfig);

  try {
    const res = await fetch(REALTIME_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[realtime/session] OpenAI error', res.status, err);
      return Response.json(
        { error: `Realtime API error: ${res.status}` },
        { status: res.status >= 500 ? 502 : 400 }
      );
    }

    const answerSdp = await res.text();
    return new Response(answerSdp, {
      headers: { 'Content-Type': 'application/sdp' },
    });
  } catch (err) {
    console.error('[realtime/session]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Failed to create session' },
      { status: 502 }
    );
  }
}

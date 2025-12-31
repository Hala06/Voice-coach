import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text : '';
    const voiceId = typeof body?.voiceId === 'string' ? body.voiceId : DEFAULT_VOICE_ID;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    if (!ELEVENLABS_API_KEY) {
      console.error('Missing ELEVENLABS_API_KEY');
      // Return empty audio (silent) instead of erroring
      return NextResponse.json({
        audio: '',
        mimeType: 'audio/mpeg',
        note: 'TTS temporarily unavailable - text response shown',
      });
    }

    // Call ElevenLabs Text-to-Speech API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS error:', response.status, errorText);
      // Return empty audio instead of erroring
      return NextResponse.json({
        audio: '',
        mimeType: 'audio/mpeg',
        note: 'TTS failed - text response shown',
      });
    }

    // Return audio as base64 for easy client-side playback
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      audio: base64Audio,
      mimeType: 'audio/mpeg',
    });
  } catch (error: any) {
    console.error('Text-to-speech error:', error?.message || error);
    // Return empty audio instead of 500 error
    return NextResponse.json({
      audio: '',
      mimeType: 'audio/mpeg',
      note: 'TTS error - text response shown',
    });
  }
}

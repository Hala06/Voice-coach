import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as (Blob & { name?: string; type?: string }) | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Forward the actual recorded file to ElevenLabs.
    // Ensure we send a real File with a filename + correct mime.
    const arrayBuffer = await audioFile.arrayBuffer();
    const fileName = audioFile.name || 'audio.webm';
    const mimeType = audioFile.type || 'audio/webm';

    const elevenLabsFormData = new FormData();
    const file = new File([arrayBuffer], fileName, { type: mimeType });
    elevenLabsFormData.append('audio', file);
    // ElevenLabs STT model (Scribe)
    elevenLabsFormData.append('model_id', 'scribe_v1');

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: elevenLabsFormData,
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();
      const details = rawText.slice(0, 4000);
      console.error('ElevenLabs STT error:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        details,
        input: { fileName, mimeType, bytes: arrayBuffer.byteLength },
      });
      return NextResponse.json(
        {
          error: 'Speech recognition failed',
          details,
          status: response.status,
          input: { fileName, mimeType, bytes: arrayBuffer.byteLength },
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text || '' });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return NextResponse.json(
      {
        error: 'Speech-to-text server error',
      },
      { status: 500 }
    );
  }
}

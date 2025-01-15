export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech } from '@/lib/youdao-tts';
import { TTSRequest } from '@/types/audio';

export async function POST(request: NextRequest) {
  try {
    console.log('TTS API: Received request');
    const body: TTSRequest = await request.json();
    console.log('TTS API: Request body:', body);

    if (!body.text) {
      console.log('TTS API: No text provided');
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    console.log('TTS API: Generating speech for text:', body.text);
    const audio = await generateSpeech(body);
    console.log('TTS API: Speech generated successfully');

    return NextResponse.json(audio);
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 
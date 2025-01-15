import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { TTSRequest, AudioResponse } from '@/types/audio';

const client = new TextToSpeechClient({
  credentials: {
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
  },
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

export async function generateSpeech(request: TTSRequest): Promise<AudioResponse> {
  try {
    const [response] = await client.synthesizeSpeech({
      input: { text: request.text },
      voice: {
        languageCode: request.language || 'cmn-CN',
        name: request.voice || 'cmn-CN-Standard-A',
      },
      audioConfig: { audioEncoding: 'MP3' },
    });

    if (!response.audioContent) {
      throw new Error('No audio content generated');
    }

    return {
      audioContent: Buffer.from(response.audioContent as Uint8Array).toString('base64'),
      mimeType: 'audio/mp3',
    };
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
} 
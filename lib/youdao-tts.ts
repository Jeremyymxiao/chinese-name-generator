import { TTSRequest, AudioResponse } from '@/types/audio';
import CryptoJS from 'crypto-js';

interface YoudaoConfig {
  appKey: string;
  appSecret: string;
  endpoint?: string;
}

const config: YoudaoConfig = {
  appKey: process.env.YOUDAO_APP_KEY || '',
  appSecret: process.env.YOUDAO_APP_SECRET || '',
  endpoint: process.env.YOUDAO_TTS_ENDPOINT || 'https://openapi.youdao.com/ttsapi',
};

function generateSign(text: string, salt: string, curtime: string): string {
  // Calculate input based on text length
  const input = text.length <= 20 ? text : `${text.substring(0, 10)}${text.length}${text.substring(text.length - 10)}`;
  
  // Sign = sha256(应用ID + input + salt + curtime + 应用密钥)
  // Do not URL encode any parameters when generating the signature
  const raw = config.appKey + input + salt + curtime + config.appSecret;
  
  console.log('YouDao TTS: Generating sign:', {
    text,
    textLength: text.length,
    input,
    salt,
    curtime,
    raw,
    appKey: config.appKey,
    appSecret: config.appSecret
  });
  
  return CryptoJS.SHA256(raw).toString(CryptoJS.enc.Hex);
}

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}...`);
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export async function generateSpeech(request: TTSRequest): Promise<AudioResponse> {
  try {
    console.log('YouDao TTS: Generating speech for request:', request);

    // Validate configuration
    if (!config.appKey || !config.appSecret) {
      throw new Error('YouDao TTS credentials are not configured');
    }
    if (!config.endpoint) {
      throw new Error('YouDao TTS endpoint is not configured');
    }

    const salt = Date.now().toString();
    const curtime = Math.floor(Date.now() / 1000).toString();
    
    // Generate sign before URL encoding
    const sign = generateSign(request.text, salt, curtime);
    
    // URL encode parameters after generating sign
    const params = new URLSearchParams();
    params.append('q', request.text);  // Do not URL encode here, URLSearchParams will do it
    params.append('appKey', config.appKey);
    params.append('salt', salt);
    params.append('sign', sign);
    params.append('signType', 'v3');
    params.append('curtime', curtime);
    params.append('langType', 'zh-CHS');
    params.append('voiceName', request.voice || 'youxiaoqin');
    params.append('format', 'mp3');
    params.append('volume', '1.0');
    params.append('speed', '1.0');

    // Make the API call
    const audioData = await retryOperation<Buffer>(async () => {
      console.log('YouDao TTS: Making API request:', {
        endpoint: config.endpoint,
        params: Object.fromEntries(params.entries()),
      });

      const response = await fetch(config.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      const contentType = response.headers.get('content-type');
      console.log('YouDao TTS: Response headers:', {
        contentType,
        status: response.status,
        statusText: response.statusText,
      });

      // First try to parse as JSON in case it's an error response
      const isJson = contentType?.includes('application/json');
      if (isJson) {
        const jsonResponse = await response.json();
        console.error('YouDao TTS: API error response:', jsonResponse);
        throw new Error(`YouDao TTS API error: ${JSON.stringify(jsonResponse)}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouDao TTS: Non-OK response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
        });
        throw new Error(`YouDao TTS API error: ${response.status} ${errorText}`);
      }

      // Check content type to ensure we got audio
      if (!contentType?.includes('audio/')) {
        const responseText = await response.text();
        console.error('YouDao TTS: Unexpected content type:', {
          contentType,
          responseText,
        });
        throw new Error(`Unexpected response type: ${contentType}. Response: ${responseText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Log the buffer size to help with debugging
      console.log('YouDao TTS: Received audio data:', {
        bufferSize: buffer.length,
        firstFewBytes: buffer.slice(0, 16).toString('hex')
      });

      return buffer;
    });

    const result = {
      audioContent: audioData.toString('base64'),
      mimeType: 'audio/mpeg',
    };

    // Log the final result size
    console.log('YouDao TTS: Generated result:', {
      audioContentLength: result.audioContent.length,
      mimeType: result.mimeType
    });

    return result;
  } catch (error: any) {
    console.error('YouDao TTS Error:', error);
    throw new Error(error.message || 'Failed to generate speech');
  }
} 
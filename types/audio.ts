export interface AudioResponse {
  audioContent: string;  // base64 encoded audio content
  mimeType: string;
}

export interface TTSRequest {
  text: string;
  language?: string;  // defaults to 'cmn-CN' for Mandarin Chinese
  voice?: string;     // defaults to 'cmn-CN-Standard-A'
}

export interface AudioPlayerProps {
  audioUrl?: string;
  base64Audio?: string;
  mimeType?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onPlay?: () => Promise<string | null>;  // Callback to generate audio if not already available
  isLoading?: boolean;  // Whether the audio is currently being generated/loaded
} 
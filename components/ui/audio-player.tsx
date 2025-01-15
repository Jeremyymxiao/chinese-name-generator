'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AudioPlayerProps } from '@/types/audio';

export function AudioPlayer({
  audioUrl,
  base64Audio,
  mimeType = 'audio/mpeg',
  size = 'md',
  className,
  onPlay,
  isLoading = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    
    const handleLoadStart = () => {
      console.log('Audio: Load started');
      setIsAudioLoading(true);
    };

    const handleCanPlay = () => {
      console.log('Audio: Can play');
      setIsAudioLoading(false);
    };

    const handlePlay = () => {
      console.log('Audio: Playing started');
      setIsPlaying(true);
    };

    const handleEnded = () => {
      console.log('Audio: Playback ended');
      setIsPlaying(false);
    };

    const handleError = () => {
      const audio = audioRef.current;
      if (!audio) return;
      
      console.error('Audio Error:', {
        error: audio.error?.message || 'Unknown error',
        code: audio.error?.code,
        networkState: audio.networkState,
        readyState: audio.readyState
      });
      
      setIsPlaying(false);
      setIsAudioLoading(false);
    };

    const handlePause = () => {
      console.log('Audio: Paused');
      setIsPlaying(false);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('pause', handlePause);
    
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // Update audio source when props change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const newSrc = audioUrl || (base64Audio ? `data:${mimeType};base64,${base64Audio}` : '');
    if (newSrc) {
      console.log('Audio: Setting source', { mimeType });
      
      // Check if the browser supports this audio format
      if (mimeType && audio.canPlayType(mimeType) === '') {
        console.warn('Browser may not support audio format:', mimeType);
      }
      
      audio.src = newSrc;
      audio.load();
    }
  }, [audioUrl, base64Audio, mimeType]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        console.log('Audio: Pausing playback');
        audio.pause();
      } else {
        if (!audio.src && onPlay) {
          console.log('Audio: Generating new audio');
          setIsAudioLoading(true);
          const newAudio = await onPlay();
          if (newAudio) {
            const newSrc = `data:${mimeType};base64,${newAudio}`;
            console.log('Audio: Setting new source', { mimeType });
            
            // Check if the browser supports this audio format
            if (mimeType && audio.canPlayType(mimeType) === '') {
              console.warn('Browser may not support audio format:', mimeType);
            }
            
            audio.src = newSrc;
            await audio.load();
          }
        }
        console.log('Audio: Starting playback');
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setIsAudioLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const isDisabled = isLoading || isAudioLoading || (!audioUrl && !base64Audio && !onPlay);

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(sizeClasses[size], className)}
      onClick={togglePlay}
      disabled={isDisabled}
    >
      {isLoading || isAudioLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      ) : isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
    </Button>
  );
} 
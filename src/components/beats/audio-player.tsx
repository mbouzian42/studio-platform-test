"use client";

import { useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { useAudioStore } from "@/stores/audio-store";

interface AudioPlayerProps {
  beatId: string;
  previewUrl: string | null;
  compact?: boolean;
}

const PREVIEW_DURATION = 30; // seconds — cap playback to 30s preview

export function AudioPlayer({ beatId, previewUrl, compact }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentBeatId,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    resume,
    setCurrentTime,
    setDuration,
  } = useAudioStore();

  const isActive = currentBeatId === beatId;

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (isActive && isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isActive, isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!previewUrl) return;

    if (isActive && isPlaying) {
      pause();
    } else if (isActive) {
      resume();
    } else {
      play(beatId, previewUrl);
    }
  }, [isActive, isPlaying, beatId, previewUrl, play, pause, resume]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && isActive) {
      // Cap playback at 30 seconds
      if (audioRef.current.currentTime >= PREVIEW_DURATION) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        pause();
        return;
      }
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [isActive, setCurrentTime, pause]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && isActive) {
      // Show 30s as max duration regardless of actual file length
      setDuration(Math.min(audioRef.current.duration, PREVIEW_DURATION));
    }
  }, [isActive, setDuration]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current || !isActive) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const cappedDuration = Math.min(audioRef.current.duration, PREVIEW_DURATION);
      audioRef.current.currentTime = ratio * cappedDuration;
    },
    [isActive],
  );

  const cappedDuration = isActive && duration > 0 ? Math.min(duration, PREVIEW_DURATION) : 0;
  const progress = cappedDuration > 0 ? (currentTime / cappedDuration) * 100 : 0;
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className={compact ? "" : "space-y-2"}>
      {/* Hidden audio element */}
      {previewUrl && (
        <audio
          ref={audioRef}
          src={isActive ? previewUrl : undefined}
          preload="none"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => pause()}
        />
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={!previewUrl}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          {isActive && isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" />
          )}
        </button>

        {!compact && (
          <>
            {/* Progress bar */}
            <div
              className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-bg-hover"
              onClick={handleSeek}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time */}
            <span className="flex-shrink-0 font-mono text-xs text-text-muted">
              {isActive ? formatTime(currentTime) : "0:00"} /{" "}
              {isActive && cappedDuration > 0 ? formatTime(cappedDuration) : "0:30"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

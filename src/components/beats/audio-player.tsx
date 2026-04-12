"use client";

import { useCallback, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { useAudioStore } from "@/stores/audio-store";

interface AudioPlayerProps {
  beatId: string;
  previewUrl: string | null;
  compact?: boolean;
}

export function AudioPlayer({ beatId, previewUrl, compact }: AudioPlayerProps) {
  const {
    currentBeatId,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    resume,
    seek,
    stop,
  } = useAudioStore();

  const isActive = currentBeatId === beatId;

  // Cleanup audio on unmount if this beat is the one playing
  useEffect(() => {
    return () => {
      // We only stop if THIS specific audio player was the one playing
      // This prevents multi-player pages from stopping other players' audio
      // though in this store design there's only one global playing beat.
      if (isActive) {
        stop();
      }
    };
  }, [isActive, stop]);

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

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isActive || duration === 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      seek(ratio * duration);
    },
    [isActive, duration, seek],
  );

  const progress = isActive && duration > 0 ? (currentTime / duration) * 100 : 0;
  
  const formatTime = (s: number) => {
    if (isNaN(s) || !isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className={compact ? "" : "space-y-2"}>
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
              {isActive && duration > 0 ? formatTime(duration) : "0:30"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { useAudioStore } from "@/stores/audio-store";

interface AudioPlayerProps {
  beatId: string;
  previewUrl: string | null;
  compact?: boolean;
  /** Optional pre-fetched duration hint (seconds) to avoid a placeholder flash. */
  durationHint?: number;
}

const PREVIEW_MAX_SECONDS = 30;

export function AudioPlayer({ beatId, previewUrl, compact, durationHint }: AudioPlayerProps) {
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
      audio.play().catch(() => {
        // Autoplay blocked (no user gesture yet) — reset store so UI shows paused.
        useAudioStore.getState().pause();
      });
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
    if (!audioRef.current || !isActive) return;
    const t = audioRef.current.currentTime;
    if (t >= PREVIEW_MAX_SECONDS) {
      audioRef.current.pause();
      audioRef.current.currentTime = PREVIEW_MAX_SECONDS;
      setCurrentTime(PREVIEW_MAX_SECONDS);
      pause();
      return;
    }
    setCurrentTime(t);
  }, [isActive, setCurrentTime, pause]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && isActive) {
      setDuration(audioRef.current.duration);
    }
  }, [isActive, setDuration]);

  // Effective cap: the shorter of the file's real duration and 30s.
  // Priority: live store duration (for the active beat) → pre-fetched hint
  // → 30s fallback. The hint prevents a "0:30 → 0:08" flash on shorter files.
  const bestDuration =
    isActive && duration > 0
      ? duration
      : durationHint && durationHint > 0
        ? durationHint
        : 0;
  const effectiveDuration =
    bestDuration > 0 ? Math.min(bestDuration, PREVIEW_MAX_SECONDS) : PREVIEW_MAX_SECONDS;

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current || !isActive) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = ratio * effectiveDuration;
    },
    [isActive, effectiveDuration],
  );

  const progress =
    isActive && effectiveDuration > 0
      ? Math.min(100, (currentTime / effectiveDuration) * 100)
      : 0;
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
              {isActive ? formatTime(Math.min(currentTime, effectiveDuration)) : "0:00"} /{" "}
              {formatTime(effectiveDuration)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

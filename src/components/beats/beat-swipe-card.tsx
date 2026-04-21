"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Play, Pause, Heart } from "lucide-react";
import { useAudioStore } from "@/stores/audio-store";
import type { Beat } from "@/types";

interface BeatSwipeCardProps {
  beat: Beat;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  exitDirection?: "left" | "right" | null;
  autoPlay?: boolean;
  isFavorited?: boolean;
}

const WAVEFORM_BARS = [
  20, 35, 50, 70, 45, 80, 60, 90, 70, 55, 80, 65, 45, 75, 55, 85, 40, 70, 50,
  30, 60, 45, 75, 35,
];

export function BeatSwipeCard({
  beat,
  onSwipeLeft,
  onSwipeRight,
  isTop,
  exitDirection,
  autoPlay = false,
  isFavorited = false,
}: BeatSwipeCardProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
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

  const isActive = currentBeatId === beat.id;
  const progress = isActive && duration > 0 ? (currentTime / duration) * 100 : 0;

  const SWIPE_THRESHOLD = 100;

  useEffect(() => {
    if (!audioRef.current || !beat.audio_preview_url) return;
    const audio = audioRef.current;

    if (isActive && isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isActive, isPlaying, beat.audio_preview_url]);

  useEffect(() => {
    if (isTop && autoPlay && beat.audio_preview_url && !isActive) {
      play(beat.id, beat.audio_preview_url);
    }
  }, [isTop, autoPlay, beat.id, beat.audio_preview_url, isActive, play]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && isActive) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [isActive, setCurrentTime]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && isActive) {
      setDuration(audioRef.current.duration);
    }
  }, [isActive, setDuration]);

  const handlePlayPause = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!beat.audio_preview_url) return;

      if (isActive && isPlaying) {
        pause();
      } else if (isActive) {
        resume();
      } else {
        play(beat.id, beat.audio_preview_url);
      }
    },
    [isActive, isPlaying, beat.id, beat.audio_preview_url, play, pause, resume],
  );

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isTop || exitDirection) return;
      setIsDragging(true);
      setStartX(e.clientX);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isTop, exitDirection],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      setDragX(e.clientX - startX);
    },
    [isDragging, startX],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > SWIPE_THRESHOLD) {
      onSwipeRight();
    } else if (dragX < -SWIPE_THRESHOLD) {
      onSwipeLeft();
    }
    setDragX(0);
  }, [isDragging, dragX, onSwipeLeft, onSwipeRight]);

  // Compute transform
  let translateX = dragX;
  let rotation = isDragging ? dragX * 0.05 : 0;
  let cardOpacity = 1;
  let transition = isDragging
    ? "none"
    : "transform 0.4s ease, opacity 0.4s ease";

  if (exitDirection === "left") {
    translateX = -500;
    rotation = -15;
    cardOpacity = 0;
    transition = "transform 0.4s ease, opacity 0.4s ease";
  } else if (exitDirection === "right") {
    translateX = 500;
    rotation = 15;
    cardOpacity = 0;
    transition = "transform 0.4s ease, opacity 0.4s ease";
  }

  return (
    <div
      className="absolute inset-0 touch-none select-none"
      style={{
        transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
        opacity: cardOpacity,
        transition,
        zIndex: 10,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {beat.audio_preview_url && (
        <audio
          ref={audioRef}
          src={isActive ? beat.audio_preview_url : undefined}
          preload="none"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => pause()}
        />
      )}

      <div
        className="relative h-full w-full overflow-hidden rounded-2xl"
        style={{
          animation:
            isTop && !isDragging && !exitDirection
              ? "cardWobble 3s ease-in-out infinite 1s"
              : "none",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #1a0a2e 0%, #4a1a8a 30%, rgba(217,70,239,0.13) 70%, #1a0a2e 100%)",
          }}
        />

        <div className="relative z-[1] flex h-full flex-col justify-end p-6">
          <div className="flex flex-1 items-center justify-center gap-[3px] py-8">
            {WAVEFORM_BARS.map((h, i) => (
              <div
                key={i}
                className="w-[3px] rounded-sm"
                style={{
                  height: h,
                  background: "var(--color-brand-gradient)",
                  opacity: isActive && isPlaying ? 0.9 : 0.6,
                  animation: isActive && isPlaying
                    ? `waveAnimate 1.2s ease-in-out infinite`
                    : "none",
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          <div className="mb-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePlayPause}
              disabled={!beat.audio_preview_url}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30 disabled:opacity-30"
            >
              {isActive && isPlaying ? (
                <Pause className="h-5 w-5 text-white" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 text-white" />
              )}
            </button>
            <span className="font-mono text-xs text-white/70">
              {isActive ? formatTime(currentTime) : "0:00"} / {isActive && duration > 0 ? formatTime(duration) : "0:30"}
            </span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2" style={{ marginBottom: 4 }}>
              <h3
                className="font-display font-bold text-white"
                style={{ fontSize: 22 }}
              >
                {beat.title}
              </h3>
              {isFavorited && (
                <Heart className="h-5 w-5 fill-pink-500 text-pink-500" />
              )}
            </div>
            <p
              className="text-text-secondary"
              style={{ fontSize: 14, marginBottom: 12 }}
            >
              Prod. by AquaBeat
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {beat.bpm && <span className="pill">{beat.bpm} BPM</span>}
              {beat.key && <span className="pill">{beat.key}</span>}
              {beat.genre && <span className="pill">{beat.genre}</span>}
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 3, background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-full rounded-sm transition-[width] duration-100"
            style={{ width: `${progress}%`, background: "var(--color-brand-gradient)" }}
          />
        </div>
      </div>
    </div>
  );
}

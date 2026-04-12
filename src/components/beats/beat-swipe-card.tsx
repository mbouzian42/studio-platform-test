"use client";

import { useState, useCallback, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { useAudioStore } from "@/stores/audio-store";
import type { Beat } from "@/types";

interface BeatSwipeCardProps {
  beat: Beat;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  exitDirection?: "left" | "right" | null;
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
}: BeatSwipeCardProps) {
  const {
    currentBeatId,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    resume,
  } = useAudioStore();

  const isCurrentBeat = currentBeatId === beat.id;
  const showPlaying = isCurrentBeat && isPlaying;

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const SWIPE_THRESHOLD = 100;

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

  const handlePlayPause = useCallback(
    (e: React.MouseEvent | React.PointerEvent) => {
      e.stopPropagation();
      if (isCurrentBeat && isPlaying) {
        pause();
      } else if (isCurrentBeat) {
        resume();
      } else if (beat.audio_preview_url) {
        play(beat.id, beat.audio_preview_url);
      }
    },
    [isCurrentBeat, isPlaying, beat, play, pause, resume],
  );

  const progress =
    isCurrentBeat && duration > 0 ? (currentTime / duration) * 100 : 0;

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
      {/* Beat card — matches prototype */}
      <div
        className="relative h-full w-full overflow-hidden rounded-2xl"
        style={{
          animation:
            isTop && !isDragging && !exitDirection
              ? "cardWobble 3s ease-in-out infinite 1s"
              : "none",
        }}
      >
        {/* Dark gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #1a0a2e 0%, #4a1a8a 30%, rgba(217,70,239,0.13) 70%, #1a0a2e 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-[1] flex h-full flex-col justify-end p-6">
          {/* Waveform */}
          <div className="flex flex-1 flex-col items-center justify-center py-8">
            <div className="flex items-center justify-center gap-[3px] mb-6">
              {WAVEFORM_BARS.map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-sm"
                  style={{
                    height: h,
                    background: "var(--color-brand-gradient)",
                    opacity: showPlaying ? 0.8 : 0.3,
                    animation: showPlaying
                      ? `waveAnimate 1.2s ease-in-out infinite ${i * 0.05}s`
                      : "none",
                    transition: "opacity 0.3s ease",
                  }}
                />
              ))}
            </div>

            {/* Play Button Overlay */}
            <button
              type="button"
              onClick={handlePlayPause}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
              aria-label={showPlaying ? "Pause" : "Play"}
            >
              {showPlaying ? (
                <Pause className="h-8 w-8 fill-current" />
              ) : (
                <Play className="ml-1 h-8 w-8 fill-current" />
              )}
            </button>
          </div>

          {/* Beat info */}
          <div className="text-center">
            <h3
              className="font-display font-bold text-white"
              style={{ fontSize: 22, marginBottom: 4 }}
            >
              {beat.title}
            </h3>
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
          style={{ height: 4, background: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="h-full transition-[width] duration-300 ease-linear"
            style={{
              width: `${progress}%`,
              background: "var(--color-brand-gradient)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

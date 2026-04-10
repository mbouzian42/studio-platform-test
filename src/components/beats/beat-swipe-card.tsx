"use client";

import { useState, useCallback, useRef } from "react";
import type { Beat } from "@/types";
import { AudioPlayer } from "@/components/beats/audio-player";

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
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  /** Ref avoids stale dragX in pointerup (React batching). */
  const dragXRef = useRef(0);

  const SWIPE_THRESHOLD = 100;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isTop || exitDirection) return;
      if ((e.target as HTMLElement).closest("button,a,input,textarea,[role='slider']")) {
        return;
      }
      setIsDragging(true);
      setStartX(e.clientX);
      dragXRef.current = 0;
      setDragX(0);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [isTop, exitDirection],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const next = e.clientX - startX;
      dragXRef.current = next;
      setDragX(next);
    },
    [isDragging, startX],
  );

  const endDrag = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const dx = dragXRef.current;
    dragXRef.current = 0;
    setDragX(0);
    if (dx > SWIPE_THRESHOLD) {
      onSwipeRight();
    } else if (dx < -SWIPE_THRESHOLD) {
      onSwipeLeft();
    }
  }, [isDragging, onSwipeLeft, onSwipeRight]);

  const handlePointerUp = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handlePointerCancel = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    dragXRef.current = 0;
    setDragX(0);
  }, [isDragging]);

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
      className="absolute inset-0 touch-none select-none active:cursor-grabbing"
      style={{
        transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
        opacity: cardOpacity,
        transition,
        zIndex: 10,
        cursor: isTop ? "grab" : "default",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
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
          <div className="flex flex-1 items-center justify-center gap-[3px] py-8">
            {WAVEFORM_BARS.map((h, i) => (
              <div
                key={i}
                className="w-[3px] rounded-sm"
                style={{
                  height: h,
                  background: "var(--color-brand-gradient)",
                  opacity: 0.6,
                  animation: `waveAnimate 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
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
            <div className="mt-4 px-1">
              <AudioPlayer
                beatId={beat.id}
                previewUrl={beat.audio_preview_url}
                compact={false}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

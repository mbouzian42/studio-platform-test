"use client";

import { useEffect, useRef } from "react";
import { useAudioStore } from "@/stores/audio-store";

const PREVIEW_LIMIT = 30;

export function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    audioUrl,
    isPlaying,
    volume,
    seekTo,
    isPreview,
    setCurrentTime,
    setDuration,
    clearSeek,
    pause,
  } = useAudioStore();

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Sync play/pause and URL
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audioUrl) {
      audio.pause();
      audio.src = "";
      return;
    }

    // Only update src if it changed
    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn("GlobalAudioPlayer play error:", err);
        // Sync store state if play fails (e.g. autoplay blocked)
        pause();
      });
    } else {
      audio.pause();
    }
  }, [audioUrl, isPlaying]);

  // Handle seeking from store
  useEffect(() => {
    if (audioRef.current && seekTo !== null) {
      audioRef.current.currentTime = seekTo;
      clearSeek();
    }
  }, [seekTo, clearSeek]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      if (isPreview && audioRef.current.currentTime >= PREVIEW_LIMIT) {
        audioRef.current.currentTime = PREVIEW_LIMIT;
        pause();
      }
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const d = audioRef.current.duration;
      setDuration(isPreview && d > PREVIEW_LIMIT ? PREVIEW_LIMIT : d);
    }
  };

  const handleEnded = () => {
    pause();
  };

  return (
    <audio
      ref={audioRef}
      style={{ display: "none" }}
      crossOrigin="anonymous"
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
    />
  );
}

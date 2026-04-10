"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Music } from "lucide-react";
import { getPublishedBeats, addBeatToFavorites } from "@/actions/beats";
import { BeatSwipeCard } from "@/components/beats/beat-swipe-card";
import { BeatsOnboarding } from "@/components/beats/beats-onboarding";
import { useAudioStore } from "@/stores/audio-store";
import { toast } from "@/components/ui/toaster";
import type { Beat } from "@/types";

export default function BeatsPage() {
  const play = useAudioStore((s) => s.play);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const animatingRef = useRef(false);
  const authFavoriteHintShown = useRef(false);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [playbackUnlocked, setPlaybackUnlocked] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("studio_beats_onboarded")) {
      setShowOnboarding(true);
    } else {
      setPlaybackUnlocked(true);
    }
  }, []);

  useEffect(() => {
    async function load() {
      const result = await getPublishedBeats();
      if (result.success) {
        setBeats(result.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem("studio_beats_onboarded", "true");
    setShowOnboarding(false);
    setPlaybackUnlocked(true);
  }, []);

  useEffect(() => {
    if (!playbackUnlocked || loading || showOnboarding) return;
    const beat = beats[currentIndex];
    if (!beat?.audio_preview_url) return;
    play(beat.id, beat.audio_preview_url);
  }, [playbackUnlocked, loading, showOnboarding, currentIndex, beats, play]);

  const animateAndAdvance = useCallback((direction: "left" | "right") => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setExitDirection(direction);

    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setExitDirection(null);
      animatingRef.current = false;
    }, 400);
  }, []);

  const handleSwipeLeft = useCallback(() => {
    animateAndAdvance("left");
  }, [animateAndAdvance]);

  const handleSwipeRight = useCallback(() => {
    const beat = beats[currentIndex];
    if (beat) {
      void addBeatToFavorites(beat.id).then((result) => {
        if (result.success) {
          toast({
            title: "Ajouté aux favoris",
            description: "Retrouve tes sélections dans Mon compte → Favoris.",
            variant: "success",
          });
          return;
        }
        if (result.error.includes("Connexion")) {
          if (!authFavoriteHintShown.current) {
            authFavoriteHintShown.current = true;
            toast({
              title: "Connexion requise",
              description: result.error,
              variant: "error",
            });
          }
          return;
        }
        toast({
          title: "Favoris",
          description: result.error,
          variant: "error",
        });
      });
    }
    animateAndAdvance("right");
  }, [animateAndAdvance, beats, currentIndex]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-64 w-64 animate-pulse rounded-2xl bg-bg-surface" />
      </div>
    );
  }

  if (beats.length === 0) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-bg-surface">
          <Music className="h-10 w-10 text-text-muted" />
        </div>
        <h1 className="font-display text-xl font-bold">
          Nouveaux beats bientôt disponibles !
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Notre catalogue est en cours de préparation. Reviens vite.
        </p>
        <a
          href="/booking"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Réserver une session
        </a>
      </div>
    );
  }

  if (currentIndex >= beats.length) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-bg-surface">
          <Music className="h-10 w-10 text-text-muted" />
        </div>
        <h1 className="font-display text-xl font-bold">
          Tu as tout écouté !
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Reviens bientôt pour découvrir de nouveaux beats.
        </p>
        <button
          type="button"
          onClick={() => setCurrentIndex(0)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border-default px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
        >
          Recommencer
        </button>
      </div>
    );
  }

  return (
    <>
      {showOnboarding && (
        <BeatsOnboarding onComplete={handleOnboardingComplete} />
      )}

      <div
        className="beat-swipe-screen"
        onPointerDownCapture={() => setPlaybackUnlocked(true)}
        role="presentation"
      >
        <div
          className="absolute left-0 right-0 top-0 z-10 flex items-center justify-end"
          style={{ padding: "var(--space-4, 16px)" }}
        >
          <span className="font-mono text-xs text-text-muted">
            {currentIndex + 1} / {beats.length}
          </span>
        </div>

        <div className="swipe-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Swipe pour découvrir
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        <div className="beat-card-container">
          <div className="relative" style={{ width: "100%", maxWidth: 340, height: 480 }}>
            <BeatSwipeCard
              key={beats[currentIndex].id}
              beat={beats[currentIndex]}
              isTop={true}
              exitDirection={exitDirection}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          </div>
        </div>

        <div className="swipe-actions">
          <button
            type="button"
            onClick={handleSwipeLeft}
            className="swipe-btn swipe-btn-skip"
            aria-label="Passer cette prod"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleSwipeRight}
            className="swipe-btn swipe-btn-like"
            aria-label="Ajouter aux favoris et suivant"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

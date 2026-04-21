"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Music, X, Heart } from "lucide-react";
import { BeatSwipeCard } from "@/components/beats/beat-swipe-card";
import { BeatsOnboarding } from "@/components/beats/beats-onboarding";

import { addToFavorites } from "@/actions/beats";
import { useAudioStore } from "@/stores/audio-store";
import type { Beat } from "@/types";

interface BeatsMarketplaceClientProps {
  initialBeats: Beat[];
}

export function BeatsMarketplaceClient({
  initialBeats,
}: BeatsMarketplaceClientProps) {
  const router = useRouter();
  const [beats, setBeats] = useState<Beat[]>(initialBeats);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null,
  );
  const animatingRef = useRef(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { play, stop, isPlaying } = useAudioStore();

  useEffect(() => {
    // Check localStorage after mount
    if (!localStorage.getItem("studio_beats_onboarded")) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem("studio_beats_onboarded", "true");
    setShowOnboarding(false);
    setHasInteracted(true);
    // Start playing the first beat
    if (beats[currentIndex]?.audio_preview_url) {
      play(beats[currentIndex].id, beats[currentIndex].audio_preview_url!);
    }
  }, [beats, currentIndex, play]);

  // Autoplay logic when currentIndex changes
  useEffect(() => {
    if (beats[currentIndex]?.audio_preview_url) {
      play(beats[currentIndex].id, beats[currentIndex].audio_preview_url!);
    }
  }, [currentIndex, beats, play, hasInteracted]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const animateAndAdvance = useCallback(
    async (direction: "left" | "right") => {
      if (animatingRef.current) return;
      animatingRef.current = true;
      setExitDirection(direction);
      if (!hasInteracted) setHasInteracted(true);

      // Stop current audio when swiping
      stop();

      if (direction === "right" && beats[currentIndex]) {
        // Add to favorites on swipe right
        await addToFavorites(beats[currentIndex].id);
      }

      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setExitDirection(null);
        animatingRef.current = false;
      }, 400);
    },
    [beats, currentIndex, stop],
  );

  const handleSwipeLeft = useCallback(() => {
    animateAndAdvance("left");
  }, [animateAndAdvance]);

  const handleSwipeRight = useCallback(() => {
    animateAndAdvance("right");
  }, [animateAndAdvance]);

  const handleManualPlay = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    if (beats[currentIndex]?.audio_preview_url) {
      play(beats[currentIndex].id, beats[currentIndex].audio_preview_url!);
    }
  }, [beats, currentIndex, hasInteracted, play]);

  // Empty state
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

  // All beats swiped
  if (currentIndex >= beats.length) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-bg-surface">
          <Music className="h-10 w-10 text-text-muted" />
        </div>
        <h1 className="font-display text-xl font-bold">Tu as tout écouté !</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Reviens bientôt pour découvrir de nouveaux beats.
        </p>
        <button
          type="button"
          onClick={() => {
            setCurrentIndex(0);
            setHasInteracted(true);
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border-default px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
        >
          Recommencer
        </button>
      </div>
    );
  }

  const currentBeat = beats[currentIndex];

  return (
    <>
      {showOnboarding && (
        <BeatsOnboarding onComplete={handleOnboardingComplete} />
      )}

      <div className="beat-swipe-screen">
        {/* Counter — top right */}
        <div
          className="absolute left-0 right-0 top-0 z-10 flex items-center justify-end"
          style={{ padding: "var(--space-4, 16px)" }}
        >
          <span className="font-mono text-xs text-text-muted">
            {currentIndex + 1} / {beats.length}
          </span>
        </div>

        {/* Swipe hint */}
        <div className="swipe-hint">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Swipe pour découvrir
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        {/* Card stack */}
        <div className="beat-card-container">
          <div
            className="relative"
            style={{ width: "100%", maxWidth: 340, height: 420 }}
          >
            <BeatSwipeCard
              key={currentBeat.id}
              beat={currentBeat}
              isTop={true}
              exitDirection={exitDirection}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />


          </div>
        </div>

        {/* Action buttons */}
        <div className="swipe-actions">
          {/* Skip */}
          <button
            type="button"
            onClick={handleSwipeLeft}
            className="swipe-btn swipe-btn-skip"
            aria-label="Passer cette prod"
          >
            <X className="h-7 w-7" strokeWidth={2.5} />
          </button>

          {/* Like */}
          <button
            type="button"
            onClick={handleSwipeRight}
            className="swipe-btn swipe-btn-like"
            aria-label="Ajouter aux favoris"
          >
            <Heart className="h-7 w-7" fill="currentColor" />
          </button>
        </div>

        {/* Info link for details (prototype behavior) */}
        <div className="mt-8 text-center">
            <button 
                onClick={() => router.push(`/beats/${currentBeat.slug}`)}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
                Voir les détails & licence
            </button>
        </div>
      </div>
    </>
  );
}

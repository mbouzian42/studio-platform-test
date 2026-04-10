"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Music } from "lucide-react";
import { addFavorite, getMyFavoriteIds, getPublishedBeats } from "@/actions/beats";
import { createClient } from "@/lib/supabase/client";
import { BeatSwipeCard } from "@/components/beats/beat-swipe-card";
import { BeatsOnboarding } from "@/components/beats/beats-onboarding";
import { AudioPlayer } from "@/components/beats/audio-player";
import { useAudioStore } from "@/stores/audio-store";
import { toast } from "@/components/ui/toaster";
import type { Beat } from "@/types";

export default function BeatsPage() {
  const router = useRouter();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const animatingRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [beatDurations, setBeatDurations] = useState<Record<string, number>>({});
  const [isAuthed, setIsAuthed] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const playAudio = useAudioStore((s) => s.play);
  const stopAudio = useAudioStore((s) => s.stop);
  const hasInteracted = useAudioStore((s) => s.hasInteracted);
  const setInteracted = useAudioStore((s) => s.setInteracted);

  useEffect(() => {
    // Check localStorage after mount (avoids SSR/hydration mismatch).
    // Returning users (already onboarded) get an implicit interaction flag
    // so autoplay is attempted immediately; the browser's autoplay policy
    // is the ultimate gate, and we catch any rejection gracefully.
    if (localStorage.getItem("studio_beats_onboarded")) {
      setInteracted();
    } else {
      setShowOnboarding(true);
    }

    async function load() {
      const supabase = createClient();
      const [{ data: { user } }, beatsResult, favIdsResult] = await Promise.all([
        supabase.auth.getUser(),
        getPublishedBeats(),
        getMyFavoriteIds(),
      ]);
      setIsAuthed(!!user);
      if (beatsResult.success) {
        setBeats(beatsResult.data);
      }
      if (favIdsResult.success) {
        setFavoriteIds(new Set(favIdsResult.data));
      }
      setLoading(false);
    }
    load();
  }, [setInteracted]);

  // Stop any audio when leaving the page.
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Prefetch metadata for each beat so durations are known before a card
  // becomes active. Prevents the time display from flashing "0:30" before
  // snapping to the real duration on shorter preview files.
  useEffect(() => {
    if (beats.length === 0) return;
    const audios: HTMLAudioElement[] = [];
    for (const beat of beats) {
      if (!beat.audio_preview_url) continue;
      const audio = new Audio();
      audio.preload = "metadata";
      audio.src = beat.audio_preview_url;
      const onLoaded = () => {
        setBeatDurations((prev) =>
          prev[beat.id] ? prev : { ...prev, [beat.id]: audio.duration },
        );
      };
      audio.addEventListener("loadedmetadata", onLoaded);
      audios.push(audio);
    }
    return () => {
      for (const a of audios) {
        a.src = "";
        a.load();
      }
    };
  }, [beats]);

  // Autoplay the active card's preview whenever it changes (and once the
  // user has interacted with the page, so browser autoplay policy allows it).
  useEffect(() => {
    if (!hasInteracted) return;
    if (beats.length === 0 || currentIndex >= beats.length) return;
    const current = beats[currentIndex];
    if (current?.audio_preview_url) {
      playAudio(current.id, current.audio_preview_url);
    }
  }, [beats, currentIndex, hasInteracted, playAudio]);

  const handleOnboardingComplete = useCallback(() => {
    localStorage.setItem("studio_beats_onboarded", "true");
    setShowOnboarding(false);
    setInteracted();
  }, [setInteracted]);

  const animateAndAdvance = useCallback(
    (direction: "left" | "right") => {
      if (animatingRef.current) return;
      animatingRef.current = true;
      setExitDirection(direction);
      stopAudio();

      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setExitDirection(null);
        animatingRef.current = false;
      }, 400);
    },
    [stopAudio],
  );

  const handleSwipeLeft = useCallback(() => {
    animateAndAdvance("left");
  }, [animateAndAdvance]);

  const handleSwipeRight = useCallback(() => {
    const beat = beats[currentIndex];
    if (!beat) return;

    // Anon users: prompt login and bail out (don't advance the deck).
    if (!isAuthed) {
      stopAudio();
      router.push("/login?redirect=/beats");
      return;
    }

    // Already favorited → just advance, don't re-insert or toast.
    if (favoriteIds.has(beat.id)) {
      animateAndAdvance("right");
      return;
    }

    // Optimistic update so the UI reflects the favorite immediately even if
    // the user swipes again before the server responds.
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      next.add(beat.id);
      return next;
    });
    animateAndAdvance("right");

    addFavorite(beat.id).then((result) => {
      if (!result.success) {
        // Rollback on failure.
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(beat.id);
          return next;
        });
        toast({
          title: "Erreur",
          description: result.error,
          variant: "error",
        });
        return;
      }
      toast({
        title: "Ajouté aux favoris",
        description: beat.title,
        variant: "success",
      });
    });
  }, [beats, currentIndex, isAuthed, favoriteIds, animateAndAdvance, stopAudio, router]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-64 w-64 animate-pulse rounded-2xl bg-bg-surface" />
      </div>
    );
  }

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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Swipe pour découvrir
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        {/* Card stack */}
        <div className="beat-card-container">
          <div className="relative" style={{ width: "100%", maxWidth: 340, height: 420 }}>
            <BeatSwipeCard
              key={beats[currentIndex].id}
              beat={beats[currentIndex]}
              isTop={true}
              exitDirection={exitDirection}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              durationHint={beatDurations[beats[currentIndex].id]}
            />
          </div>
        </div>

        {/* Audio controls for the active card */}
        <div className="mx-auto mt-4 w-full max-w-[340px] px-4">
          <AudioPlayer
            key={beats[currentIndex].id}
            beatId={beats[currentIndex].id}
            previewUrl={beats[currentIndex].audio_preview_url}
            durationHint={beatDurations[beats[currentIndex].id]}
          />
        </div>

        {/* Action buttons — prototype style */}
        <div className="swipe-actions">
          {/* Skip */}
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

          {/* Like */}
          <button
            type="button"
            onClick={handleSwipeRight}
            className="swipe-btn swipe-btn-like"
            aria-label="Voir les détails de la prod"
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

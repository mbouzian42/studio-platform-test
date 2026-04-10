"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Trash2, Play, Pause } from "lucide-react";
import { getFavorites, removeFromFavorites } from "@/actions/beats";
import { useAudioStore } from "@/stores/audio-store";
import { toast } from "@/components/ui/toaster";
import type { Beat } from "@/types";

export default function FavoritesPage() {
  const router = useRouter();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { currentBeatId, isPlaying, play, pause, resume, stop } = useAudioStore();

  useEffect(() => {
    async function load() {
      const result = await getFavorites();
      if (!result.success) {
        if (result.error === "Connexion requise") {
          router.push("/login?redirect=/account/favorites");
          return;
        }
        toast({ title: "Erreur", description: result.error, variant: "error" });
        setLoading(false);
        return;
      }
      setBeats(result.data);
      setLoading(false);
    }
    load();

    return () => {
      stop();
    };
  }, [router, stop]);

  async function handleRemove(beatId: string) {
    setRemovingId(beatId);
    const result = await removeFromFavorites(beatId);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      setRemovingId(null);
      return;
    }
    if (currentBeatId === beatId) {
      stop();
    }
    setBeats((prev) => prev.filter((b) => b.id !== beatId));
    toast({ title: "Retiré des favoris", variant: "success" });
    setRemovingId(null);
  }

  function handlePlayPause(beat: Beat) {
    if (!beat.audio_preview_url) return;

    if (currentBeatId === beat.id && isPlaying) {
      pause();
    } else if (currentBeatId === beat.id) {
      resume();
    } else {
      play(beat.id, beat.audio_preview_url);
    }
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[600px] md:px-6 md:pt-12">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Mon compte
      </Link>

      <h1 className="font-display text-[30px] font-bold leading-tight">
        Mes favoris
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {beats.length} beat{beats.length > 1 ? "s" : ""} sauvegardé{beats.length > 1 ? "s" : ""}
      </p>

      {beats.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-bg-surface">
            <Heart className="h-10 w-10 text-text-muted" />
          </div>
          <h2 className="font-display text-xl font-bold">Aucun favori</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Swipe vers la droite sur un beat pour l&apos;ajouter à tes favoris
          </p>
          <Link
            href="/beats"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Découvrir les beats
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {beats.map((beat) => {
            const isActive = currentBeatId === beat.id;
            const isCurrentlyPlaying = isActive && isPlaying;

            return (
              <div
                key={beat.id}
                className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-surface p-4"
              >
                <button
                  type="button"
                  onClick={() => handlePlayPause(beat)}
                  disabled={!beat.audio_preview_url}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  {isCurrentlyPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/beats/${beat.slug}`}
                    className="block truncate font-display font-semibold transition-colors hover:text-purple-400"
                  >
                    {beat.title}
                  </Link>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    {beat.bpm && <span>{beat.bpm} BPM</span>}
                    {beat.key && <span>{beat.key}</span>}
                    {beat.genre && <span>{beat.genre}</span>}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-purple-400">
                    {beat.price_simple}€
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(beat.id)}
                  disabled={removingId === beat.id}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border-subtle text-text-muted transition-colors hover:border-error/50 hover:text-error disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

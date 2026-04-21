"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Music, Trash2 } from "lucide-react";
import { getFavorites, removeFavorite } from "@/actions/favorites";
import { AudioPlayer } from "@/components/beats/audio-player";
import { toast } from "@/components/ui/toaster";
import type { Beat } from "@/types";

export default function FavoritesPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFavorites().then((result) => {
      if (result.success) setBeats(result.data);
      setLoading(false);
    });
  }, []);

  async function handleRemove(beatId: string) {
    const result = await removeFavorite(beatId);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    setBeats((prev) => prev.filter((b) => b.id !== beatId));
    toast({ title: "Retiré des favoris", variant: "success" });
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded-lg bg-bg-surface" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Mon compte
      </Link>

      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-brand-primary" />
        <h1 className="font-display text-[30px] font-bold leading-tight">
          Mes favoris
        </h1>
      </div>
      <p className="mt-1 text-sm text-text-secondary">
        {beats.length} beat{beats.length !== 1 ? "s" : ""} sauvegardé
        {beats.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-8 space-y-3">
        {beats.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
            <Music className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 font-display font-semibold">Aucun favori</p>
            <p className="mt-1 text-sm text-text-secondary">
              Swipe à droite sur la marketplace pour sauvegarder des beats.
            </p>
            <Link
              href="/beats"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Découvrir les beats
            </Link>
          </div>
        ) : (
          beats.map((beat) => (
            <div
              key={beat.id}
              className="rounded-xl border border-border-subtle bg-bg-surface p-4"
            >
              <div className="flex items-start gap-4">
                {/* Cover */}
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-bg-hover">
                  {beat.cover_image_url ? (
                    <img
                      src={beat.cover_image_url}
                      alt={beat.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-6 w-6 text-text-muted" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-semibold">
                    {beat.title}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-1.5 text-xs text-text-muted">
                    {beat.bpm && <span>{beat.bpm} BPM</span>}
                    {beat.key && <span>· {beat.key}</span>}
                    {beat.genre && <span>· {beat.genre}</span>}
                  </div>
                  <div className="mt-2">
                    <AudioPlayer
                      beatId={beat.id}
                      previewUrl={beat.audio_preview_url}
                    />
                  </div>
                </div>

                {/* Price + remove */}
                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                  <span className="font-display font-bold text-text-primary">
                    {beat.price_simple}€
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(beat.id)}
                    className="flex items-center gap-1 rounded-lg border border-error/30 px-2.5 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/10"
                  >
                    <Trash2 className="h-3 w-3" />
                    Retirer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
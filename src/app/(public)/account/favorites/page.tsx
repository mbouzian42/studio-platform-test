"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Trash2, Music } from "lucide-react";
import { getFavorites, removeFromFavorites } from "@/actions/beats";
import { AudioPlayer } from "@/components/beats/audio-player";
import { toast } from "@/components/ui/toaster";
import type { Beat } from "@/types";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getFavorites();
      if (result.success) {
        setFavorites(result.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleRemove(beatId: string) {
    setRemovingId(beatId);
    const result = await removeFromFavorites(beatId);
    if (result.success) {
      setFavorites((prev) => prev.filter((b) => b.id !== beatId));
      toast({ title: "Beat retiré des favoris", variant: "success" });
    } else {
      toast({ title: "Erreur", description: result.error, variant: "error" });
    }
    setRemovingId(null);
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[600px] md:px-6 md:pt-12">
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
      {/* Header */}
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Mon compte</span>
      </Link>

      <h1 className="font-display text-[30px] font-bold leading-tight mb-6">
        Mes favoris
      </h1>

      {/* Empty state */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-bg-surface">
            <Heart className="h-10 w-10 text-text-muted" />
          </div>
          <h2 className="font-display text-xl font-bold">
            Pas encore de favoris
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Explore les beats et ajoute tes prods préférées
          </p>
          <Link
            href="/beats"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90"
          >
            <Music className="h-4 w-4" />
            <span>Explorer les beats</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((beat) => (
            <div
              key={beat.id}
              className="rounded-lg border border-border-subtle bg-bg-surface p-4"
            >
              <div className="flex gap-3">
                {/* Cover */}
                {beat.cover_image_url ? (
                  <img
                    src={beat.cover_image_url}
                    alt={beat.title}
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/40 to-pink-500/40">
                    <Music className="h-6 w-6 text-white/60" />
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-semibold">
                    {beat.title}
                  </p>

                  {/* Metadata pills */}
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {beat.genre && (
                      <span className="rounded-full bg-bg-elevated px-2 py-0.5 text-xs text-text-muted">
                        {beat.genre}
                      </span>
                    )}
                    {beat.bpm && (
                      <span className="rounded-full bg-bg-elevated px-2 py-0.5 font-mono text-xs text-text-muted">
                        {beat.bpm} BPM
                      </span>
                    )}
                    {beat.key && (
                      <span className="rounded-full bg-bg-elevated px-2 py-0.5 font-mono text-xs text-text-muted">
                        {beat.key}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <p className="mt-1.5 font-display text-sm font-bold text-purple-400">
                    {beat.price_simple}€
                  </p>
                </div>

                {/* Actions: play + remove */}
                <div className="flex flex-col items-center gap-2">
                  <AudioPlayer
                    beatId={beat.id}
                    previewUrl={beat.audio_preview_url}
                    compact
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(beat.id)}
                    disabled={removingId === beat.id}
                    className="rounded-lg p-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50"
                    aria-label={`Retirer ${beat.title} des favoris`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

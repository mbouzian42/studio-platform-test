"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Trash2, Music } from "lucide-react";
import { getMyFavorites, removeBeatFromFavorites } from "@/actions/beats";
import { AudioPlayer } from "@/components/beats/audio-player";
import { toast } from "@/components/ui/toaster";
import type { Beat } from "@/types";

export default function FavoritesPage() {
  const router = useRouter();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getMyFavorites();
      if (!result.success) {
        router.push("/login?redirect=/account/favorites");
        return;
      }
      setBeats(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleRemove(beatId: string) {
    const result = await removeBeatFromFavorites(beatId);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    setBeats((prev) => prev.filter((b) => b.id !== beatId));
    toast({ title: "Retiré des favoris", variant: "success" });
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
        {beats.length} beat{beats.length !== 1 ? "s" : ""} sauvegardé{beats.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-6 space-y-3">
        {beats.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <Heart className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 font-display font-semibold">Aucun favori</p>
            <p className="mt-1 text-sm text-text-secondary">
              Swipe à droite sur un beat pour l&apos;ajouter à tes favoris.
            </p>
            <Link
              href="/beats"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Music className="h-4 w-4" />
              Découvrir des beats
            </Link>
          </div>
        ) : (
          beats.map((beat) => (
            <div
              key={beat.id}
              className="rounded-lg border border-border-subtle bg-bg-surface p-4"
            >
              <div className="flex items-start gap-4">
                {/* Cover image */}
                {beat.cover_image_url ? (
                  <img
                    src={beat.cover_image_url}
                    alt={beat.title}
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-bg-hover">
                    <Music className="h-6 w-6 text-text-muted" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/beats/${beat.slug}`}
                    className="font-display font-semibold hover:underline"
                  >
                    {beat.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    {beat.bpm && <span>{beat.bpm} BPM</span>}
                    {beat.key && <span>{beat.key}</span>}
                    {beat.genre && <span>{beat.genre}</span>}
                  </div>
                  <p className="mt-1 text-sm font-bold text-text-primary">
                    {beat.price_simple}€
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(beat.id)}
                  className="flex-shrink-0 rounded-lg border border-error/30 p-2 text-error transition-colors hover:bg-error/10"
                  aria-label="Retirer des favoris"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Audio player */}
              <div className="mt-3">
                <AudioPlayer
                  beatId={beat.id}
                  previewUrl={beat.audio_preview_url}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeft, Trash2, Music } from "lucide-react";
import Link from "next/link";
import { getFavorites, toggleFavorite } from "@/actions/favorites";
import { AudioPlayer } from "@/components/beats/audio-player";
import { toast } from "@/components/ui/toaster";
import type { Beat } from "@/types";

export default function FavoritesPage() {
  const router = useRouter();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getFavorites();
      if (!result.success) {
        if (result.error === "Non connecté") {
          router.push("/login?redirect=/account/favorites");
          return;
        }
        toast({ title: "Erreur", description: result.error, variant: "error" });
        return;
      }
      setBeats(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleRemove(beatId: string) {
    const result = await toggleFavorite(beatId);
    if (result.success) {
      setBeats((prev) => prev.filter((b) => b.id !== beatId));
      toast({ title: "Favori supprimé", variant: "success" });
    } else {
      toast({ title: "Erreur", description: result.error, variant: "error" });
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          <div className="h-64 rounded-lg bg-bg-surface" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au compte
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Mes Favoris</h1>
          <p className="mt-1 text-text-secondary">
            {beats.length} beat{beats.length > 1 ? "s" : ""} enregistré{beats.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-500/10 text-pink-500">
          <Heart className="h-6 w-6 fill-current" />
        </div>
      </div>

      {beats.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-bg-surface py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-primary">
            <Music className="h-8 w-8 text-text-muted" />
          </div>
          <h2 className="font-display text-xl font-semibold">Aucun favori pour le moment</h2>
          <p className="mt-2 text-text-secondary">
            Parcours la marketplace pour ajouter des beats à tes favoris.
          </p>
          <Link
            href="/beats"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Découvrir des beats
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {beats.map((beat) => (
            <div
              key={beat.id}
              className="group relative overflow-hidden rounded-xl border border-border-subtle bg-bg-surface transition-all hover:border-border-default hover:shadow-lg"
            >
              {/* Beat Info */}
              <div className="flex gap-4 p-4">
                {/* Cover Image */}
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-bg-primary">
                  {beat.cover_image_url ? (
                    <img
                      src={beat.cover_image_url}
                      alt={beat.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-8 w-8 text-text-muted" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display font-bold">{beat.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="text-xs text-text-secondary">{beat.bpm} BPM</span>
                    <span className="text-sm font-semibold text-brand-primary">
                      {beat.price_simple}€
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {beat.tags?.slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="rounded bg-bg-primary px-1.5 py-0.5 text-[10px] text-text-muted capitalize">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(beat.id);
                  }}
                  className="relative z-10 text-text-muted transition-colors hover:text-error"
                  title="Supprimer des favoris"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Bar (Mock visual) */}
              <div className="h-1 w-full bg-bg-primary">
                <div className="h-full w-0 bg-brand-gradient transition-all" />
              </div>

              {/* Player UI */}
              <div className="bg-bg-elevated/30 p-4 pt-2">
                <AudioPlayer
                  beatId={beat.id}
                  previewUrl={beat.audio_preview_url}
                  compact
                />
              </div>

              <Link
                href={`/beats/${beat.slug}`}
                className="absolute inset-x-0 bottom-0 top-0 z-[1] cursor-pointer"
                aria-hidden="true"
              />
              {/* Action area for buttons (above the link) */}
              <div className="absolute right-4 top-4 z-[2]">
                {/* Delete button already handled above */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

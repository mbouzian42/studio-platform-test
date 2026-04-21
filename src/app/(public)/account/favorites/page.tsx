"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Music, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getUserFavorites, removeFromFavorites } from "@/actions/beats";
import { toast } from "@/components/ui/toaster";
import { AudioPlayer } from "@/components/beats/audio-player";
import type { Favorite } from "@/types";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getUserFavorites();
      if (!result.success) {
        toast({ title: "Erreur", description: result.error, variant: "error" });
        // If not authenticated, the action might return error, but let's handle it
        if (result.error.toLowerCase().includes("connexion")) {
            router.push("/login?redirect=/account/favorites");
        }
        setLoading(false);
        return;
      }
      setFavorites(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleRemove(beatId: string) {
    const result = await removeFromFavorites(beatId);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    setFavorites((prev) => prev.filter((f) => f.beat_id !== beatId));
    toast({ title: "Retiré des coups de cœur", variant: "success" });
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[800px] md:px-6 md:pt-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-bg-surface" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[800px] md:px-6 md:pt-12">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Mon compte
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
        <h1 className="font-display text-[30px] font-bold leading-tight">
          Coups de cœur
        </h1>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border-subtle bg-bg-surface p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-primary">
            <Music className="h-8 w-8 text-text-muted" />
          </div>
          <h2 className="font-display text-xl font-bold">Aucun coup de cœur</h2>
          <p className="mt-2 text-sm text-text-secondary max-w-xs mx-auto">
            Explore la marketplace et swipe à droite pour ajouter des beats à tes favoris.
          </p>
          <Link
            href="/beats"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Découvrir des beats
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {favorites.map((fav) => {
            const beat = fav.beat;
            if (!beat) return null;

            return (
              <div
                key={fav.id}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-5 transition-all hover:border-purple-500/30 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display font-bold text-text-primary">
                      {beat.title}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {beat.bpm} BPM · {beat.key} · {beat.genre}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(beat.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-error/10 text-error opacity-0 transition-opacity hover:bg-error/20 group-hover:opacity-100"
                    title="Retirer des favoris"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto">
                  <AudioPlayer
                    beatId={beat.id}
                    previewUrl={beat.audio_preview_url}
                    compact
                  />
                </div>

                <Link
                  href={`/beats/${beat.slug}`}
                  className="mt-2 block text-center text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Voir les détails & licence
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

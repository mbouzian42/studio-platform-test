"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { getMyFavorites, removeFavorite } from "@/actions/beats";
import { toast } from "@/components/ui/toaster";
import type { Beat } from "@/types";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getMyFavorites();
      if (!result.success) {
        router.push("/login?redirect=/account/favorites");
        return;
      }
      setFavorites(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleRemove(beat: Beat) {
    setRemovingId(beat.id);
    // Optimistic remove.
    const previous = favorites;
    setFavorites((prev) => prev.filter((b) => b.id !== beat.id));

    const result = await removeFavorite(beat.id);
    if (!result.success) {
      setFavorites(previous);
      toast({ title: "Erreur", description: result.error, variant: "error" });
      setRemovingId(null);
      return;
    }
    toast({
      title: "Retiré des favoris",
      description: beat.title,
      variant: "success",
    });
    setRemovingId(null);
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[700px] md:px-6 md:pt-12">
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
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[700px] md:px-6 md:pt-12">
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
        {favorites.length} beat{favorites.length > 1 ? "s" : ""} sauvegardé
        {favorites.length > 1 ? "s" : ""}
      </p>

      <div className="mt-8">
        {favorites.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <Heart className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 font-display font-semibold">
              Aucun favori pour le moment
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Swipe à droite sur un beat pour l&apos;ajouter à tes favoris.
            </p>
            <Link
              href="/beats"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90"
            >
              Explorer les beats
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((beat) => (
              <div
                key={beat.id}
                className="flex items-center gap-4 rounded-lg border border-border-subtle bg-bg-surface p-4"
              >
                {/* Cover */}
                <Link
                  href={`/beats/${beat.slug}`}
                  className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-600/40 to-magenta-500/40"
                >
                  {beat.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={beat.cover_image_url}
                      alt={beat.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-2xl font-bold text-white/30">
                      ♫
                    </span>
                  )}
                </Link>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/beats/${beat.slug}`}
                    className="block truncate font-display font-semibold hover:text-purple-400"
                  >
                    {beat.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                    {beat.bpm && <span>{beat.bpm} BPM</span>}
                    {beat.key && <span>{beat.key}</span>}
                    {beat.genre && <span>{beat.genre}</span>}
                  </div>
                  <p className="mt-1 font-display text-sm font-bold text-text-primary">
                    {beat.price_simple}€
                    {beat.price_exclusive && (
                      <span className="ml-1 text-xs font-normal text-text-muted">
                        / {beat.price_exclusive}€ exclu.
                      </span>
                    )}
                  </p>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemove(beat)}
                  disabled={removingId === beat.id}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-error/30 text-error transition-colors hover:bg-error/10 disabled:opacity-50"
                  aria-label={`Retirer ${beat.title} des favoris`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

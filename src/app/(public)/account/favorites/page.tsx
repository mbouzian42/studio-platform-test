"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { getMyFavoriteBeats, removeBeatFromFavorites } from "@/actions/beats";
import { toast } from "@/components/ui/toaster";
import type { Beat } from "@/types";

export default function AccountFavoritesPage() {
  const router = useRouter();
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getMyFavoriteBeats();
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
      <div className="mx-auto max-w-[600px] px-4 py-12 md:px-6 md:py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-bg-surface" />
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

      <div className="mb-6 flex items-center gap-2">
        <Heart className="h-7 w-7 text-purple-500" />
        <h1 className="font-display text-[30px] font-bold leading-tight">
          Mes favoris
        </h1>
      </div>
      <p className="text-sm text-text-secondary">
        Beats enregistrés depuis la marketplace.
      </p>

      <div className="mt-8 space-y-3">
        {beats.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <p className="text-text-secondary">
              Aucun favori pour le moment. Explore{" "}
              <Link href="/beats" className="font-medium text-purple-400 underline">
                la marketplace
              </Link>
              .
            </p>
          </div>
        ) : (
          beats.map((beat) => (
            <div
              key={beat.id}
              className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface p-4"
            >
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-bg-hover">
                {beat.cover_image_url ? (
                  <img
                    src={beat.cover_image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-text-muted">
                    ♪
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/beats/${beat.slug}`}
                  className="font-display font-semibold text-text-primary hover:underline"
                >
                  {beat.title}
                </Link>
                <p className="truncate text-xs text-text-muted">
                  {[beat.bpm && `${beat.bpm} BPM`, beat.genre]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(beat.id)}
                className="flex-shrink-0 rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-hover hover:text-error"
                aria-label="Retirer des favoris"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

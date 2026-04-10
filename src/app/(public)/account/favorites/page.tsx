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
        if (result.error === "Non connecté") {
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
          {[1, 2].map((i) => (
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

      <h1 className="font-display text-[30px] font-bold leading-tight">
        Mes favoris
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Beats enregistrés depuis le swipe
      </p>

      <div className="mt-8 space-y-3">
        {beats.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <Heart className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 font-display font-semibold">Aucun favori</p>
            <p className="mt-1 text-sm text-text-secondary">
              Swipe vers la droite sur /beats pour ajouter des beats.
            </p>
            <Link
              href="/beats"
              className="mt-4 inline-block text-sm font-medium text-purple-400 hover:underline"
            >
              Découvrir les beats
            </Link>
          </div>
        ) : (
          beats.map((beat) => (
            <div
              key={beat.id}
              className="flex items-center gap-4 rounded-lg border border-border-subtle bg-bg-surface p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold">{beat.title}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {[beat.bpm && `${beat.bpm} BPM`, beat.genre].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(beat.id)}
                className="flex-shrink-0 rounded-lg border border-border-default p-2 text-text-muted transition-colors hover:border-error/40 hover:text-error"
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

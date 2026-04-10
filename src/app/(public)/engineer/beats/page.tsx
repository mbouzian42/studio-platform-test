"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, EyeOff, Music, TrendingUp } from "lucide-react";
import { getMyBeats, toggleBeatPublish } from "@/actions/beats";
import { toast } from "@/components/ui/toaster";
import type { Beat } from "@/types";

function getStatusLabel(beat: Beat): { label: string; color: string } {
  if (beat.is_exclusive_sold) return { label: "Vendu (exclusif)", color: "text-error" };
  if (beat.is_published) return { label: "Publié", color: "text-success" };
  return { label: "Brouillon", color: "text-warning" };
}

export default function BeatmakerBeatsPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getMyBeats();
      if (result.success) {
        setBeats(result.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleTogglePublish(beat: Beat) {
    const newState = !beat.is_published;
    const result = await toggleBeatPublish(beat.id, newState);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    setBeats((prev) =>
      prev.map((b) =>
        b.id === beat.id ? { ...b, is_published: newState } : b,
      ),
    );
    toast({
      title: newState ? "Beat publié" : "Beat dépublié",
      description: newState
        ? "Le beat est maintenant visible sur la marketplace"
        : "Le beat a été retiré de la marketplace",
      variant: "success",
    });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-12 md:px-6 md:py-20">
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
    <div className="mx-auto max-w-[800px] px-4 py-12 md:px-6 md:py-20">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold md:text-3xl">
          Mes beats
        </h1>
        <div className="flex gap-2">
          <Link
            href="/engineer/beats/sales"
            className="flex items-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
          >
            <TrendingUp className="h-4 w-4" />
            Ventes
          </Link>
          <Link
            href="/engineer/beats/upload"
            className="flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Upload
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="font-display text-2xl font-bold">{beats.length}</p>
          <p className="text-xs text-text-muted">Total beats</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="font-display text-2xl font-bold">
            {beats.filter((b) => b.is_published).length}
          </p>
          <p className="text-xs text-text-muted">Publiés</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="font-display text-2xl font-bold">
            {beats.filter((b) => b.is_exclusive_sold).length}
          </p>
          <p className="text-xs text-text-muted">Vendus</p>
        </div>
      </div>

      {/* Beat list */}
      <div className="mt-8 space-y-3">
        {beats.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <Music className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 font-display font-semibold">
              Aucun beat pour le moment
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Uploade ton premier beat pour commencer à vendre.
            </p>
          </div>
        ) : (
          beats.map((beat) => {
            const status = getStatusLabel(beat);
            return (
              <div
                key={beat.id}
                className="rounded-lg border border-border-subtle bg-bg-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-semibold">
                      {beat.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      {beat.bpm && <span>{beat.bpm} BPM</span>}
                      {beat.key && <span>{beat.key}</span>}
                      {beat.genre && <span>{beat.genre}</span>}
                      <span className="text-text-muted">·</span>
                      <span>Simple: {beat.price_simple}€</span>
                      {beat.price_exclusive && (
                        <span>Exclu: {beat.price_exclusive}€</span>
                      )}
                    </div>
                    <p className={`mt-1 text-xs font-medium ${status.color}`}>
                      {status.label}
                    </p>
                  </div>

                  {!beat.is_exclusive_sold && (
                    <div className="ml-4 flex gap-2">
                      <Link
                        href={`/engineer/beats/upload?edit=${beat.id}`}
                        className="rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-bg-hover"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(beat)}
                        className="flex items-center gap-1 rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-bg-hover"
                      >
                        {beat.is_published ? (
                          <>
                            <EyeOff className="h-3 w-3" />
                            Dépublier
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3" />
                            Publier
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

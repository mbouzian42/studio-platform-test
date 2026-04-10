"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Music,
  Headphones,
  Download,
  Play,
} from "lucide-react";
import { getUserHistory, type HistoryItem } from "@/actions/history";

const TYPE_ICONS = {
  booking: Calendar,
  beat_purchase: Music,
  mixing: Headphones,
};

const TYPE_LABELS = {
  booking: "Session",
  beat_purchase: "Beat",
  mixing: "Mixage",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "text-warning" },
  confirmed: { label: "Confirmée", color: "text-success" },
  cancelled: { label: "Annulée", color: "text-error" },
  completed: { label: "Terminée", color: "text-text-muted" },
  purchased: { label: "Acheté", color: "text-success" },
  in_progress: { label: "En cours", color: "text-info" },
  delivered: { label: "Livré", color: "text-success" },
  revision_requested: { label: "Retouche", color: "text-purple-400" },
};

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getUserHistory();
      if (!result.success) {
        router.push("/login?redirect=/account/history");
        return;
      }
      setItems(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[700px] md:px-6 md:pt-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          {[1, 2, 3, 4].map((i) => (
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
        Mon historique
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Toutes tes réservations, achats de beats et commandes de mixage.
      </p>

      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
          <Calendar className="mx-auto h-10 w-10 text-text-muted" />
          <p className="mt-3 font-display font-semibold">
            Aucun historique
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Tes réservations, achats et mixages apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {items.map((item) => {
            const Icon = TYPE_ICONS[item.type];
            const typeLabel = TYPE_LABELS[item.type];
            const status = STATUS_LABELS[item.status] ?? { label: item.status, color: "text-text-muted" };
            const date = new Date(item.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="rounded-lg border border-border-subtle bg-bg-surface p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
                    <Icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-display font-semibold">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-text-muted">
                          {typeLabel} &middot; {date}
                        </p>
                        <p className={`mt-1 text-xs font-medium ${status.color}`}>
                          {status.label}
                        </p>
                      </div>
                      <span className="font-display font-bold">
                        {item.amount}€
                      </span>
                    </div>

                    {/* Booking details */}
                    {item.type === "booking" && item.startTime && (
                      <p className="mt-2 text-xs text-text-muted">
                        {item.startTime.slice(0, 5)} — {item.endTime?.slice(0, 5)}
                      </p>
                    )}

                    {/* Beat purchase: license + re-download */}
                    {item.type === "beat_purchase" && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-full bg-bg-elevated px-2 py-0.5 text-xs text-text-muted">
                          Licence {item.licenseType === "exclusive" ? "Exclusive" : "Simple"}
                        </span>
                        {item.downloadUrl ? (
                          <a
                            href={item.downloadUrl}
                            download
                            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                          >
                            <Download className="h-3 w-3" />
                            Télécharger
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              alert("Téléchargement disponible lorsque le stockage est configuré");
                            }}
                            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                          >
                            <Download className="h-3 w-3" />
                            Télécharger
                          </button>
                        )}
                      </div>
                    )}

                    {/* Mixing: re-listen + re-download */}
                    {item.type === "mixing" && item.deliveredFileUrl && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setPlayingId(
                                playingId === item.id ? null : item.id,
                              )
                            }
                            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                          >
                            <Play className="h-3 w-3" />
                            {playingId === item.id ? "Masquer" : "Écouter"}
                          </button>
                          <a
                            href={item.deliveredFileUrl}
                            download
                            className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                          >
                            <Download className="h-3 w-3" />
                            Télécharger
                          </a>
                        </div>
                        {playingId === item.id && (
                          <audio
                            controls
                            className="w-full"
                            src={item.deliveredFileUrl}
                          >
                            Ton navigateur ne supporte pas la lecture audio.
                          </audio>
                        )}
                      </div>
                    )}

                    {/* Link to detail */}
                    {item.type === "mixing" && item.mixingOrderId && (
                      <Link
                        href={`/account/mixing/${item.mixingOrderId}`}
                        className="mt-2 inline-block text-xs text-purple-400 hover:text-purple-300"
                      >
                        Voir les détails &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

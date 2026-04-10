"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Headphones } from "lucide-react";
import { getEngineerMixingOrders } from "@/actions/mixing";
import type { MixingOrder } from "@/types";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "text-warning" },
  in_progress: { label: "En cours", color: "text-info" },
  delivered: { label: "Livré", color: "text-success" },
  revision_requested: { label: "Retouche demandée", color: "text-purple-400" },
  completed: { label: "Terminé", color: "text-text-muted" },
};

export default function EngineerMixingPage() {
  const [orders, setOrders] = useState<MixingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getEngineerMixingOrders();
      if (result.success) {
        setOrders(result.data);
      }
      setLoading(false);
    }
    load();
  }, []);

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

  // Sort: pending/revision_requested first, then in_progress, then delivered
  const priorityOrder: Record<string, number> = {
    revision_requested: 0,
    pending: 1,
    in_progress: 2,
    delivered: 3,
    completed: 4,
  };
  const sorted = [...orders].sort(
    (a, b) => (priorityOrder[a.mixing_status] ?? 5) - (priorityOrder[b.mixing_status] ?? 5),
  );

  return (
    <div className="mx-auto max-w-[800px] px-4 py-12 md:px-6 md:py-20">
      <h1 className="font-display text-2xl font-bold md:text-3xl">
        Mes demandes de mixage
      </h1>

      <div className="mt-8 space-y-3">
        {sorted.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <Headphones className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 font-display font-semibold">
              Aucune demande assignée
            </p>
          </div>
        ) : (
          sorted.map((order) => {
            const status = STATUS_LABELS[order.mixing_status] ?? STATUS_LABELS.pending;
            const formulaLabel = order.formula === "premium" ? "Premium" : "Standard";
            const date = new Date(order.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            });

            return (
              <Link
                key={order.id}
                href={`/engineer/mixing/${order.id}`}
                className="block rounded-lg border border-border-subtle bg-bg-surface p-4 transition-colors hover:border-purple-500/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display font-semibold">
                      Mix {formulaLabel}
                    </p>
                    <p className="mt-0.5 text-sm text-text-secondary">
                      {date} &middot; {order.price}€
                    </p>
                    <p className={`mt-1 text-xs font-medium ${status.color}`}>
                      {status.label}
                    </p>
                  </div>
                  <p className="text-xs text-text-muted">
                    Retouches : {order.revision_count}/{order.max_revisions}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

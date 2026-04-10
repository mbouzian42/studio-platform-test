"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Headphones } from "lucide-react";
import { getUserMixingOrders } from "@/actions/mixing";
import type { MixingOrder } from "@/types";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "text-warning" },
  in_progress: { label: "En cours", color: "text-info" },
  delivered: { label: "Livré", color: "text-success" },
  revision_requested: { label: "Retouche demandée", color: "text-purple-400" },
  completed: { label: "Terminé", color: "text-text-muted" },
};

export default function MixingOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<MixingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getUserMixingOrders();
      if (!result.success) {
        router.push("/login?redirect=/account/mixing");
        return;
      }
      setOrders(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

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
        Mes commandes de mixage
      </h1>

      <div className="mt-8 space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <Headphones className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 font-display font-semibold">
              Aucune commande de mixage
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Commande ton premier mix professionnel.
            </p>
            <Link
              href="/mixing"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90"
            >
              Commander un mix
            </Link>
          </div>
        ) : (
          orders.map((order) => {
            const status = STATUS_LABELS[order.mixing_status] ?? STATUS_LABELS.pending;
            const formulaLabel = order.formula === "premium" ? "Premium" : "Standard";
            const date = new Date(order.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <Link
                key={order.id}
                href={`/account/mixing/${order.id}`}
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
                  <div className="text-right">
                    <p className="text-xs text-text-muted">
                      Retouches : {order.revision_count}/{order.max_revisions}
                    </p>
                    {order.mixing_status === "pending" && (
                      <p className="mt-1 text-xs text-text-muted">
                        Livraison : 2-5 jours ouvrés
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

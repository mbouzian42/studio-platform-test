"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Headphones } from "lucide-react";
import { checkAdminAccess } from "@/actions/admin";
import { getAdminMixingOrders } from "@/actions/admin-mixing";
import type { MixingOrder } from "@/types";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "text-warning" },
  in_progress: { label: "En cours", color: "text-info" },
  delivered: { label: "Livré", color: "text-success" },
  revision_requested: { label: "Retouche", color: "text-purple-400" },
  completed: { label: "Terminé", color: "text-text-muted" },
};

export default function AdminMixingPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<MixingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const access = await checkAdminAccess();
      if (!access.success || !access.data.isAdmin) {
        router.push("/");
        return;
      }
      const result = await getAdminMixingOrders();
      if (result.success) setOrders(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
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
    <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <h1 className="font-display text-[30px] font-bold leading-tight">
        Gestion Mixage
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        {orders.length} commande{orders.length > 1 ? "s" : ""} au total
      </p>

      <div className="mt-8 space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <Headphones className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 font-display font-semibold">
              Aucune commande de mixage
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border-subtle">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface">
                  <th className="px-4 py-2.5 text-left font-medium text-text-muted">
                    Formule
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-text-muted">
                    Statut
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-text-muted">
                    Prix
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-text-muted md:table-cell">
                    Date
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-text-muted md:table-cell">
                    Retouches
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status =
                    STATUS_LABELS[order.mixing_status] ??
                    STATUS_LABELS.pending;
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-border-subtle last:border-0"
                    >
                      <td className="px-4 py-2.5 font-medium">
                        Mix{" "}
                        {order.formula === "premium"
                          ? "Premium"
                          : "Standard"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-display font-bold">
                        {order.price}€
                      </td>
                      <td className="hidden px-4 py-2.5 text-text-muted md:table-cell">
                        {new Date(order.created_at).toLocaleDateString(
                          "fr-FR",
                          { day: "numeric", month: "short" },
                        )}
                      </td>
                      <td className="hidden px-4 py-2.5 text-text-muted md:table-cell">
                        {order.revision_count}/{order.max_revisions}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

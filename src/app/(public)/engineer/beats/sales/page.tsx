"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { getBeatmakerSales, type BeatmakerSalesData } from "@/actions/beats";

export default function BeatmakerSalesPage() {
  const router = useRouter();
  const [data, setData] = useState<BeatmakerSalesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getBeatmakerSales();
      if (!result.success) {
        router.push("/login?redirect=/engineer/beats/sales");
        return;
      }
      setData(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-12 md:px-6 md:py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-bg-surface" />
            ))}
          </div>
          <div className="h-64 rounded-lg bg-bg-surface" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-12 md:px-6 md:py-20">
      <Link
        href="/engineer/beats"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Mes beats
      </Link>

      <h1 className="font-display text-2xl font-bold md:text-3xl">
        Suivi des ventes
      </h1>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="font-display text-2xl font-bold">{data.totalSold}</p>
          <p className="text-xs text-text-muted">Beats vendus</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="font-display text-2xl font-bold">{data.totalRevenue}€</p>
          <p className="text-xs text-text-muted">Revenus total</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 text-center col-span-2 md:col-span-1">
          <p className="font-display text-2xl font-bold">
            {data.salesByBeat.length}
          </p>
          <p className="text-xs text-text-muted">Beats avec ventes</p>
        </div>
      </div>

      {/* Sales by beat */}
      {data.salesByBeat.length > 0 && (
        <section className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Ventes par beat
          </p>
          <div className="space-y-2">
            {data.salesByBeat.map((beat) => (
              <div
                key={beat.title}
                className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-surface p-3"
              >
                <div>
                  <p className="font-display font-semibold">{beat.title}</p>
                  <p className="text-xs text-text-muted">
                    {beat.count} vente{beat.count > 1 ? "s" : ""}
                  </p>
                </div>
                <span className="font-display font-bold">{beat.revenue}€</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent sales */}
      <section className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Ventes récentes
        </p>
        {data.recentSales.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <TrendingUp className="mx-auto h-10 w-10 text-text-muted" />
            <p className="mt-3 font-display font-semibold">
              Aucune vente pour le moment
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Publie des beats pour commencer à vendre.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border-subtle">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface">
                  <th className="px-4 py-2.5 text-left font-medium text-text-muted">
                    Beat
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-text-muted">
                    Licence
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-text-muted">
                    Prix
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-text-muted md:table-cell">
                    Date
                  </th>
                  <th className="hidden px-4 py-2.5 text-left font-medium text-text-muted md:table-cell">
                    Acheteur
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-4 py-2.5 font-medium">
                      {sale.beat_title}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          sale.license_type === "exclusive"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-bg-elevated text-text-muted"
                        }`}
                      >
                        {sale.license_type === "exclusive"
                          ? "Exclusive"
                          : "Simple"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-display font-bold">
                      {sale.price_paid}€
                    </td>
                    <td className="hidden px-4 py-2.5 text-text-muted md:table-cell">
                      {new Date(sale.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="hidden px-4 py-2.5 text-text-muted md:table-cell">
                      {sale.buyer_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

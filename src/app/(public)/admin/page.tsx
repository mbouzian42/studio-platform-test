"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Calendar,
  Music,
  Headphones,
  TrendingUp,
  Clock,
} from "lucide-react";
import { checkAdminAccess, getAdminKPIs, type AdminKPIs } from "@/actions/admin";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Check admin access first
      const accessResult = await checkAdminAccess();
      if (!accessResult.success || !accessResult.data.isAdmin) {
        router.push("/");
        return;
      }

      const result = await getAdminKPIs();
      if (!result.success) {
        router.push("/");
        return;
      }

      setKpis(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6 md:py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-lg bg-bg-surface" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-lg bg-bg-surface" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!kpis) return null;

  return (
    <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
      <h1 className="font-display text-[30px] font-bold leading-tight">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Vue d&apos;ensemble de l&apos;activité du studio
      </p>

      {/* Main KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Revenu total</p>
              <p className="font-display text-xl font-bold">
                {kpis.totalRevenue}€
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Calendar className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Réservations</p>
              <p className="font-display text-xl font-bold">
                {kpis.totalBookings}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-magenta-500/20">
              <Music className="h-5 w-5 text-magenta-400" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Beats vendus</p>
              <p className="font-display text-xl font-bold">
                {kpis.totalBeatSales}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/20">
              <Headphones className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Mixages</p>
              <p className="font-display text-xl font-bold">
                {kpis.totalMixingOrders}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue breakdown */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Revenus Sessions
            </p>
          </div>
          <p className="mt-3 font-display text-2xl font-bold">
            {kpis.bookingRevenue}€
          </p>
          <div className="mt-2 flex gap-3 text-xs text-text-muted">
            <span className="text-success">
              {kpis.confirmedBookings} confirmées
            </span>
            <span className="text-warning">
              {kpis.pendingBookings} en attente
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-magenta-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Revenus Beats
            </p>
          </div>
          <p className="mt-3 font-display text-2xl font-bold">
            {kpis.beatRevenue}€
          </p>
          <p className="mt-2 text-xs text-text-muted">
            {kpis.totalBeatSales} vente{kpis.totalBeatSales > 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-lg border border-border-subtle bg-bg-surface p-5">
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-info" />
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Revenus Mixage
            </p>
          </div>
          <p className="mt-3 font-display text-2xl font-bold">
            {kpis.mixingRevenue}€
          </p>
          <p className="mt-2 text-xs text-text-muted">
            {kpis.totalMixingOrders} commande
            {kpis.totalMixingOrders > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Gestion rapide
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { href: "/admin/calendar", label: "Calendrier", icon: Calendar },
            { href: "/admin/pricing", label: "Tarifs", icon: TrendingUp },
            { href: "/admin/beats", label: "Catalogue beats", icon: Music },
            { href: "/admin/mixing", label: "Mixages", icon: Headphones },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface p-4 text-sm font-medium text-text-primary transition-colors hover:border-purple-500/50"
            >
              <link.icon className="h-5 w-5 text-purple-400" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Headphones, Music } from "lucide-react";
import { getEngineerSessions } from "@/actions/engineer";
import { getEngineerMixingOrders } from "@/actions/mixing";
import type { Booking, MixingOrder } from "@/types";

type SessionWithStudio = Booking & { studio_name: string };

export default function EngineerDashboardPage() {
  const [sessions, setSessions] = useState<SessionWithStudio[]>([]);
  const [mixingOrders, setMixingOrders] = useState<MixingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [sessionsResult, mixingResult] = await Promise.all([
        getEngineerSessions(),
        getEngineerMixingOrders(),
      ]);

      if (sessionsResult.success) setSessions(sessionsResult.data);
      if (mixingResult.success) setMixingOrders(mixingResult.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-12 md:px-6 md:py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-bg-surface" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingMixing = mixingOrders.filter(
    (o) => o.mixing_status === "pending" || o.mixing_status === "revision_requested",
  );
  const today = new Date().toISOString().split("T")[0];
  const upcomingSessions = sessions.filter((s) => s.booking_date >= today);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 md:px-6 md:py-20">
      <h1 className="font-display text-2xl font-bold md:text-3xl">
        Espace Ingénieur
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Tes sessions, mixages et beats
      </p>

      {/* Quick stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="font-display text-2xl font-bold">
            {upcomingSessions.length}
          </p>
          <p className="text-xs text-text-muted">Sessions à venir</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="font-display text-2xl font-bold">
            {pendingMixing.length}
          </p>
          <p className="text-xs text-text-muted">Mixages en attente</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="font-display text-2xl font-bold">
            {mixingOrders.length}
          </p>
          <p className="text-xs text-text-muted">Total mixages</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Link
          href="/engineer/mixing"
          className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface p-4 transition-colors hover:border-purple-500/50"
        >
          <Headphones className="h-6 w-6 text-purple-400" />
          <div>
            <p className="font-display font-semibold">Mes mixages</p>
            <p className="text-xs text-text-muted">
              {pendingMixing.length} en attente
            </p>
          </div>
        </Link>
        <Link
          href="/engineer/beats"
          className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface p-4 transition-colors hover:border-purple-500/50"
        >
          <Music className="h-6 w-6 text-purple-400" />
          <div>
            <p className="font-display font-semibold">Mes beats</p>
            <p className="text-xs text-text-muted">Upload et gestion</p>
          </div>
        </Link>
        <Link
          href="/engineer/beats/sales"
          className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-surface p-4 transition-colors hover:border-purple-500/50"
        >
          <Calendar className="h-6 w-6 text-purple-400" />
          <div>
            <p className="font-display font-semibold">Ventes</p>
            <p className="text-xs text-text-muted">Suivi des revenus</p>
          </div>
        </Link>
      </div>

      {/* Upcoming sessions */}
      <section className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Sessions à venir ({upcomingSessions.length})
        </p>
        {upcomingSessions.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-6 text-center text-sm text-text-muted">
            Aucune session assignée
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingSessions.slice(0, 5).map((session) => {
              const date = new Date(
                session.booking_date + "T00:00:00",
              ).toLocaleDateString("fr-FR", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-surface p-3"
                >
                  <div>
                    <p className="font-display font-semibold">
                      {session.studio_name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {date} &middot; {session.start_time.slice(0, 5)} —{" "}
                      {session.end_time.slice(0, 5)}
                    </p>
                  </div>
                  <span className="text-xs text-success font-medium">
                    {session.booking_status === "confirmed"
                      ? "Confirmée"
                      : "En attente"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Pending mixing requests */}
      {pendingMixing.length > 0 && (
        <section className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Mixages en attente ({pendingMixing.length})
          </p>
          <div className="space-y-2">
            {pendingMixing.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={`/engineer/mixing/${order.id}`}
                className="block rounded-lg border border-border-subtle bg-bg-surface p-3 transition-colors hover:border-purple-500/50"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display font-semibold">
                    Mix{" "}
                    {order.formula === "premium" ? "Premium" : "Standard"}
                  </p>
                  <span className="text-xs text-warning font-medium">
                    {order.mixing_status === "revision_requested"
                      ? "Retouche demandée"
                      : "En attente"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

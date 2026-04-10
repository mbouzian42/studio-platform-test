"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, X } from "lucide-react";
import { getUserBookings, cancelBooking } from "@/actions/booking";
import { toast } from "@/components/ui/toaster";
import type { Booking } from "@/types";

type BookingWithStudio = Booking & { studio_name: string };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "text-warning" },
  confirmed: { label: "Confirmée", color: "text-success" },
  cancelled: { label: "Annulée", color: "text-error" },
  completed: { label: "Terminée", color: "text-text-muted" },
};

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithStudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<BookingWithStudio | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getUserBookings();
      if (!result.success) {
        router.push("/login?redirect=/account/bookings");
        return;
      }
      setBookings(result.data);
      setLoading(false);
    }
    load();
  }, [router]);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = bookings.filter(
    (b) => b.booking_date >= today && b.booking_status !== "cancelled",
  );
  const past = bookings.filter(
    (b) => b.booking_date < today || b.booking_status === "cancelled",
  );

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);

    const result = await cancelBooking(cancelTarget.id);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      setCancelling(false);
      setCancelTarget(null);
      return;
    }

    // Update local state
    setBookings((prev) =>
      prev.map((b) =>
        b.id === cancelTarget.id
          ? { ...b, booking_status: "cancelled" as const, payment_status: "refunded" as const }
          : b,
      ),
    );

    toast({
      title: "Réservation annulée",
      description: "Le remboursement sera traité selon la politique d'annulation.",
      variant: "success",
    });
    setCancelling(false);
    setCancelTarget(null);
  }

  function formatDate(date: string) {
    return new Date(date + "T00:00:00").toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

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
        Mes réservations
      </h1>

      {/* Upcoming */}
      <section className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          À venir ({upcoming.length})
        </p>
        {upcoming.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-6 text-center">
            <Calendar className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-2 text-sm text-text-secondary">
              Aucune réservation à venir
            </p>
            <Link
              href="/booking"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90"
            >
              Réserver une session
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => {
              const status = STATUS_LABELS[b.booking_status] ?? STATUS_LABELS.pending;
              return (
                <div
                  key={b.id}
                  className="rounded-lg border border-border-subtle bg-bg-surface p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display font-semibold">
                        {b.studio_name}
                      </p>
                      <p className="mt-0.5 text-sm text-text-secondary">
                        {formatDate(b.booking_date)} &middot;{" "}
                        {b.start_time.slice(0, 5)} — {b.end_time.slice(0, 5)}{" "}
                        ({b.duration_hours}h)
                      </p>
                      <p className={`mt-1 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold">
                        {b.total_price}€
                      </span>
                    </div>
                  </div>
                  {(b.booking_status === "pending" ||
                    b.booking_status === "confirmed") && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(b)}
                      className="mt-3 text-xs font-medium text-error transition-colors hover:text-error/80"
                    >
                      Annuler cette réservation
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Historique ({past.length})
          </p>
          <div className="space-y-3">
            {past.map((b) => {
              const status = STATUS_LABELS[b.booking_status] ?? STATUS_LABELS.completed;
              return (
                <div
                  key={b.id}
                  className="rounded-lg border border-border-subtle bg-bg-surface p-4 opacity-60"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display font-semibold">
                        {b.studio_name}
                      </p>
                      <p className="mt-0.5 text-sm text-text-secondary">
                        {formatDate(b.booking_date)} &middot;{" "}
                        {b.start_time.slice(0, 5)} — {b.end_time.slice(0, 5)}
                      </p>
                      <p className={`mt-1 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </p>
                    </div>
                    <span className="font-display font-bold text-text-muted">
                      {b.total_price}€
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Cancel confirmation dialog */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !cancelling && setCancelTarget(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <button
              type="button"
              onClick={() => setCancelTarget(null)}
              disabled={cancelling}
              className="absolute right-4 top-4 rounded-lg p-1 text-text-muted hover:bg-bg-hover"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="font-display text-lg font-bold">
              Annuler cette réservation ?
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {cancelTarget.studio_name} — {formatDate(cancelTarget.booking_date)}{" "}
              {cancelTarget.start_time.slice(0, 5)} —{" "}
              {cancelTarget.end_time.slice(0, 5)}
            </p>

            {/* Cancellation policy */}
            <div className="mt-4 rounded-lg border border-border-subtle bg-bg-elevated p-3">
              <p className="text-xs font-semibold text-text-muted">
                Politique d&apos;annulation
              </p>
              <ul className="mt-1 space-y-1 text-xs text-text-muted">
                <li>
                  &bull; Plus de 48h avant : remboursement intégral
                </li>
                <li>
                  &bull; Entre 48h et 24h : remboursement de 50%
                </li>
                <li>
                  &bull; Moins de 24h : aucun remboursement
                </li>
              </ul>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="flex-1 rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover disabled:opacity-50"
              >
                Garder
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-lg bg-error px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {cancelling ? "Annulation..." : "Confirmer l'annulation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Music, Calendar } from "lucide-react";
import { getBookingById } from "@/actions/booking";
import type { Booking } from "@/types";

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  const [booking, setBooking] = useState<(Booking & { studio_name: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!bookingId) {
        setError("Aucune réservation trouvée");
        setLoading(false);
        return;
      }

      const result = await getBookingById(bookingId);
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setBooking(result.data);
      setLoading(false);
    }
    load();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[600px] md:px-6 md:pt-12">
        <div className="animate-pulse space-y-6">
          <div className="h-16 w-16 rounded-full bg-bg-surface mx-auto" />
          <div className="h-6 w-64 rounded-lg bg-bg-surface mx-auto" />
          <div className="h-48 rounded-lg bg-bg-surface" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="px-4 pt-6 pb-24 text-center md:mx-auto md:max-w-[600px] md:px-6 md:pt-12">
        <h1 className="font-display text-[30px] font-bold leading-tight">Réservation introuvable</h1>
        <p className="mt-2 text-text-secondary">{error}</p>
        <Link
          href="/booking"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90"
        >
          Réserver une session
        </Link>
      </div>
    );
  }

  const dateFormatted = new Date(booking.booking_date + "T00:00:00").toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  const pricePaid = booking.deposit_amount ?? booking.total_price;
  const remaining = booking.deposit_amount
    ? booking.total_price - booking.deposit_amount
    : 0;

  return (
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[600px] md:px-6 md:pt-12">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="font-display text-[30px] font-bold leading-tight">
          Réservation confirmée !
        </h1>
        <p className="mt-2 text-text-secondary">
          Ta session est bien enregistrée. Tu recevras un email de confirmation.
        </p>
      </div>

      {/* Booking details */}
      <div className="mt-8 rounded-lg border border-border-subtle bg-bg-surface p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Détails de la réservation
        </p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Studio</span>
            <span className="font-medium">{booking.studio_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Date</span>
            <span className="font-medium capitalize">{dateFormatted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Horaire</span>
            <span className="font-medium">
              {booking.start_time.slice(0, 5)} — {booking.end_time.slice(0, 5)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Durée</span>
            <span className="font-medium">{booking.duration_hours}h</span>
          </div>
          <div className="border-t border-border-subtle pt-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Montant payé</span>
              <span className="font-display font-bold">{pricePaid}€</span>
            </div>
            {remaining > 0 && (
              <div className="mt-2 flex justify-between">
                <span className="text-text-secondary">Reste à payer au studio</span>
                <span className="font-medium text-warning">{remaining}€</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upsell to beats */}
      <div className="mt-6 rounded-lg border border-purple-500/30 bg-purple-500/5 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500/20">
            <Music className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="font-display font-semibold">
              Préparez votre session : avez-vous déjà votre prod ?
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Explorez notre catalogue de beats exclusifs et trouvez
              l&apos;instru parfaite pour votre session.
            </p>
            <Link
              href="/beats"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90"
            >
              <Music className="h-4 w-4" />
              Explorer les beats
            </Link>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <Link
          href="/account"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
        >
          <Calendar className="h-4 w-4" />
          Mes réservations
        </Link>
        <Link
          href="/"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

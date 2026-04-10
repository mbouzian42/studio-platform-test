"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/actions/booking";

interface BookingRecapProps {
  studioId: string;
  studioName: string;
  date: string;
  startHour: number;
  endHour: number;
  total: number;
}

export function BookingRecap({
  studioId,
  studioName,
  date,
  startHour,
  endHour,
  total,
}: BookingRecapProps) {
  const router = useRouter();
  const [paymentType, setPaymentType] = useState<"full" | "deposit">("full");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deposit = Math.ceil(total * 0.2);
  const amountToPay = paymentType === "deposit" ? deposit : total;

  const dateFormatted = new Date(date + "T00:00:00").toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  async function handleSubmit() {
    setPending(true);
    setError(null);

    const result = await createBooking({
      studioId,
      bookingDate: date,
      startTime: `${String(startHour).padStart(2, "0")}:00`,
      endTime: `${String(endHour).padStart(2, "0")}:00`,
      paymentType,
    });

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    // Redirect to Stripe checkout (mock redirects directly to confirmation)
    window.location.href = result.data.checkoutUrl;
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4 md:p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Confirmer la réservation
      </p>

      {/* Summary */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Studio</span>
          <span className="font-medium">{studioName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Date</span>
          <span className="font-medium capitalize">{dateFormatted}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Horaire</span>
          <span className="font-medium">
            {String(startHour).padStart(2, "0")}:00 —{" "}
            {String(endHour).padStart(2, "0")}:00
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Durée</span>
          <span className="font-medium">{endHour - startHour}h</span>
        </div>
      </div>

      {/* Payment type */}
      <div className="mt-5 border-t border-border-subtle pt-5">
        <p className="mb-3 text-sm font-medium">Mode de paiement</p>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-subtle p-3 transition-colors has-[:checked]:border-purple-500 has-[:checked]:bg-purple-500/10">
            <input
              type="radio"
              name="paymentType"
              value="full"
              checked={paymentType === "full"}
              onChange={() => setPaymentType("full")}
              className="accent-purple-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium">Paiement intégral</span>
              <span className="ml-2 text-sm text-text-secondary">{total}€</span>
            </div>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-subtle p-3 transition-colors has-[:checked]:border-purple-500 has-[:checked]:bg-purple-500/10">
            <input
              type="radio"
              name="paymentType"
              value="deposit"
              checked={paymentType === "deposit"}
              onChange={() => setPaymentType("deposit")}
              className="accent-purple-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium">Acompte 20%</span>
              <span className="ml-2 text-sm text-text-secondary">
                {deposit}€ maintenant, {total - deposit}€ au studio
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Amount */}
      <div className="mt-5 border-t border-border-subtle pt-5">
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold">À payer</span>
          <span className="font-display text-xl font-bold">{amountToPay}€</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-error">{error}</p>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className="mt-5 w-full rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Réservation en cours..." : `Payer ${amountToPay}€`}
      </button>

      {/* Cancellation policy */}
      <div className="mt-4 rounded-lg border border-border-subtle bg-bg-elevated p-3">
        <p className="text-xs font-semibold text-text-muted">
          Politique d&apos;annulation
        </p>
        <p className="mt-1 text-xs text-text-muted leading-relaxed">
          Annulation gratuite jusqu&apos;à 48h avant la session. Remboursement
          de 50% entre 48h et 24h. Aucun remboursement dans les dernières 24h.
        </p>
      </div>
      <p className="mt-3 text-center text-xs text-text-muted">
        En confirmant, vous acceptez les{" "}
        <a href="/legal/terms" className="text-purple-400 hover:text-purple-300">
          conditions générales de vente
        </a>
        .
      </p>
    </div>
  );
}

"use client";

import { Info } from "lucide-react";

interface PricingBreakdown {
  hour: number;
  rate: number;
  isOffPeak: boolean;
}

interface PricingDisplayProps {
  breakdown: PricingBreakdown[];
  total: number;
  standardRate: number;
}

export function PricingDisplay({
  breakdown,
  total,
  standardRate,
}: PricingDisplayProps) {
  if (breakdown.length === 0) return null;

  const durationHours = breakdown.length;
  const hasOffPeak = breakdown.some((b) => b.isOffPeak);

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Récapitulatif du prix
      </p>

      <div className="space-y-2">
        {breakdown.map((b) => (
          <div
            key={b.hour}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-text-secondary">
              {String(b.hour).padStart(2, "0")}:00 —{" "}
              {String(b.hour + 1).padStart(2, "0")}:00
            </span>
            <span className="flex items-center gap-2">
              {b.isOffPeak && (
                <span className="text-text-muted line-through">
                  {standardRate}€
                </span>
              )}
              <span
                className={b.isOffPeak ? "font-medium text-success" : "text-text-primary"}
              >
                {b.rate}€
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-border-subtle pt-3">
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold">
            Total ({durationHours}h)
          </span>
          <span className="font-display text-lg font-bold">{total}€</span>
        </div>
      </div>

      {hasOffPeak && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-success">
          <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
          Tarif heures creuses appliqué (lun-ven, 8h-14h)
        </p>
      )}

      {durationHours === 2 && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-text-secondary">
          <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
          En moyenne, un titre prend 4h — tu veux ajouter du temps ?
        </p>
      )}
    </div>
  );
}

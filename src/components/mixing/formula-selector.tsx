"use client";

import { FileAudio, Layers } from "lucide-react";
import type { MixingFormula } from "@/types";

interface FormulaSelectorProps {
  selected: MixingFormula;
  onSelect: (formula: MixingFormula) => void;
  standardPrice: number;
  premiumPrice: number;
}

export function FormulaSelector({
  selected,
  onSelect,
  standardPrice,
  premiumPrice,
}: FormulaSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Choisis ta formule
      </p>

      {/* Mix Standard */}
      <button
        type="button"
        onClick={() => onSelect("standard")}
        className={`w-full rounded-lg border p-5 text-left transition-colors ${
          selected === "standard"
            ? "border-purple-500 bg-purple-500/10"
            : "border-border-subtle hover:border-border-default"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
            <FileAudio className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Mix Standard</h3>
              <span className="font-display text-lg font-bold">
                {standardPrice}€
              </span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              Envoie le fichier de ta voix et le fichier de l&apos;instru.
              L&apos;ingénieur s&apos;occupe du mix professionnel.
            </p>
            <ul className="mt-2 space-y-1 text-xs text-text-muted">
              <li>✓ 2 retouches incluses</li>
              <li>✓ Session visio incluse si besoin</li>
            </ul>
          </div>
        </div>
      </button>

      {/* Mix Premium */}
      <button
        type="button"
        onClick={() => onSelect("premium")}
        className={`w-full rounded-lg border p-5 text-left transition-colors ${
          selected === "premium"
            ? "border-purple-500 bg-purple-500/10"
            : "border-border-subtle hover:border-border-default"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-bg-elevated">
            <Layers className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold">Mix Premium</h3>
              <span className="font-display text-lg font-bold">
                {premiumPrice}€
              </span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              Envoie tes pistes séparées (stems). L&apos;ingénieur travaille
              chaque élément pour un mix sur mesure.
            </p>
            <ul className="mt-2 space-y-1 text-xs text-text-muted">
              <li>✓ 2 retouches incluses</li>
              <li>✓ Session visio incluse si besoin</li>
            </ul>
          </div>
        </div>
      </button>
    </div>
  );
}

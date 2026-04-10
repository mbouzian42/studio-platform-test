"use client";

interface LicenseSelectorProps {
  priceSimple: number;
  priceExclusive: number | null;
  selectedLicense: "simple" | "exclusive";
  onSelect: (license: "simple" | "exclusive") => void;
}

export function LicenseSelector({
  priceSimple,
  priceExclusive,
  selectedLicense,
  onSelect,
}: LicenseSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        Choisis ta licence
      </p>

      {/* Simple License */}
      <button
        type="button"
        onClick={() => onSelect("simple")}
        className={`w-full rounded-lg border p-4 text-left transition-colors ${
          selectedLicense === "simple"
            ? "border-purple-500 bg-purple-500/10"
            : "border-border-subtle hover:border-border-default"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-semibold">Licence Simple</p>
            <p className="mt-0.5 text-xs text-text-secondary">
              Non exclusive — d&apos;autres artistes peuvent aussi utiliser ce
              beat
            </p>
          </div>
          <span className="font-display text-lg font-bold">{priceSimple}€</span>
        </div>
      </button>

      {/* Exclusive License */}
      {priceExclusive !== null && (
        <button
          type="button"
          onClick={() => onSelect("exclusive")}
          className={`w-full rounded-lg border p-4 text-left transition-colors ${
            selectedLicense === "exclusive"
              ? "border-purple-500 bg-purple-500/10"
              : "border-border-subtle hover:border-border-default"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display font-semibold">Licence Exclusive</p>
              <p className="mt-0.5 text-xs text-text-secondary">
                Tu es le seul à pouvoir utiliser ce beat — il est retiré de la
                vente
              </p>
            </div>
            <span className="font-display text-lg font-bold">
              {priceExclusive}€
            </span>
          </div>
        </button>
      )}
    </div>
  );
}

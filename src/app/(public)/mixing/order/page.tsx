"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FormulaSelector } from "@/components/mixing/formula-selector";
import { StemUploader } from "@/components/mixing/stem-uploader";
import { BriefForm } from "@/components/mixing/brief-form";
import { submitMixingRequest } from "@/actions/mixing";
import { MIXING_STANDARD_PRICE, MIXING_PREMIUM_PRICE } from "@/config/site";
import type { MixingFormula } from "@/types";

export default function MixingOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"formula" | "upload" | "brief" | "recap">(
    "formula",
  );
  const [formula, setFormula] = useState<MixingFormula>("standard");

  useEffect(() => {
    const formulaParam = searchParams.get("formula");
    if (formulaParam === "standard" || formulaParam === "premium") {
      setFormula(formulaParam);
      setStep("upload");
    }
  }, [searchParams]);
  const [files, setFiles] = useState<File[]>([]);
  const [brief, setBrief] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = formula === "premium" ? MIXING_PREMIUM_PRICE : MIXING_STANDARD_PRICE;
  const isMultipleFiles = true; // Standard = voix + instru, Premium = stems

  async function handleSubmit() {
    setPending(true);
    setError(null);

    const result = await submitMixingRequest({ formula, brief });

    if (!result.success) {
      if (result.error === "Connexion requise") {
        router.push("/login?redirect=/mixing/order");
        return;
      }
      setError(result.error);
      setPending(false);
      return;
    }

    // TODO: Upload files to Supabase Storage (stems bucket)

    // Redirect to Stripe checkout (mock redirects to confirmation)
    window.location.href = result.data.checkoutUrl;
  }

  return (
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[600px] md:px-6 md:pt-12">
      {/* Back */}
      <Link
        href="/mixing"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <h1 className="font-display text-[30px] font-bold leading-tight">
        Commander un mix
      </h1>

      {/* Progress indicator */}
      <div className="mt-6 flex gap-1">
        {["formula", "upload", "brief", "recap"].map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              i <= ["formula", "upload", "brief", "recap"].indexOf(step)
                ? "bg-brand-gradient"
                : "bg-bg-surface"
            }`}
          />
        ))}
      </div>

      <div className="mt-8">
        {/* Step 1: Formula */}
        {step === "formula" && (
          <div className="space-y-6">
            <FormulaSelector
              selected={formula}
              onSelect={setFormula}
              standardPrice={MIXING_STANDARD_PRICE}
              premiumPrice={MIXING_PREMIUM_PRICE}
            />
            <button
              type="button"
              onClick={() => setStep("upload")}
              className="w-full rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Step 2: Upload */}
        {step === "upload" && (
          <div className="space-y-6">
            <StemUploader
              multiple={isMultipleFiles}
              files={files}
              onFilesChange={setFiles}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("formula")}
                className="flex-1 rounded-lg border border-border-default px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => setStep("brief")}
                disabled={files.length === 0}
                className="flex-1 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Brief */}
        {step === "brief" && (
          <div className="space-y-6">
            <BriefForm value={brief} onChange={setBrief} />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="flex-1 rounded-lg border border-border-default px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => setStep("recap")}
                disabled={brief.length < 10}
                className="flex-1 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Recap */}
        {step === "recap" && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border-subtle bg-bg-surface p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Récapitulatif
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Formule</span>
                  <span className="font-medium">
                    Mix {formula === "premium" ? "Premium" : "Standard"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Fichiers</span>
                  <span className="font-medium">
                    {files.length} fichier{files.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Brief</span>
                  <span className="font-medium text-text-secondary">
                    {brief.length} caractères
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Retouches incluses</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Délai estimé</span>
                  <span className="font-medium">2-5 jours ouvrés</span>
                </div>
              </div>
              <div className="mt-4 border-t border-border-subtle pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold">Total</span>
                  <span className="font-display text-xl font-bold">
                    {price}€
                  </span>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("brief")}
                className="flex-1 rounded-lg border border-border-default px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={pending}
                className="flex-1 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {pending ? "Commande en cours..." : `Payer ${price}€`}
              </button>
            </div>

            <p className="text-center text-xs text-text-muted">
              En confirmant, vous acceptez les{" "}
              <a
                href="/legal/terms"
                className="text-purple-400 hover:text-purple-300"
              >
                conditions générales de vente
              </a>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

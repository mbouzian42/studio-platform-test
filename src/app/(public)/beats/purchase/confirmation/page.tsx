"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Download, Music } from "lucide-react";
import { getPurchaseById, getBeatDownloadUrl } from "@/actions/beats";
import { toast } from "@/components/ui/toaster";
import type { BeatPurchase } from "@/types";

export default function BeatPurchaseConfirmationPage() {
  const searchParams = useSearchParams();
  const purchaseId = searchParams.get("purchase_id");

  const [purchase, setPurchase] = useState<
    (BeatPurchase & { beat_title: string; beat_slug: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!purchaseId) {
        setError("Aucun achat trouvé");
        setLoading(false);
        return;
      }
      const result = await getPurchaseById(purchaseId);
      if (!result.success) {
        setError(result.error);
      } else {
        setPurchase(result.data);
      }
      setLoading(false);
    }
    load();
  }, [purchaseId]);

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[600px] md:px-6 md:pt-12">
        <div className="animate-pulse space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-bg-surface" />
          <div className="mx-auto h-6 w-64 rounded-lg bg-bg-surface" />
          <div className="h-48 rounded-lg bg-bg-surface" />
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="px-4 pt-6 pb-24 text-center md:mx-auto md:max-w-[600px] md:px-6 md:pt-12">
        <h1 className="font-display text-[30px] font-bold leading-tight">Achat introuvable</h1>
        <p className="mt-2 text-text-secondary">{error}</p>
        <Link
          href="/beats"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90"
        >
          Explorer les beats
        </Link>
      </div>
    );
  }

  const licenseLabel =
    purchase.license_type === "exclusive" ? "Exclusive" : "Simple";

  return (
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[600px] md:px-6 md:pt-12">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="font-display text-[30px] font-bold leading-tight">
          Achat confirmé !
        </h1>
        <p className="mt-2 text-text-secondary">
          Ton beat est prêt à être téléchargé.
        </p>
      </div>

      {/* Purchase details */}
      <div className="mt-8 rounded-lg border border-border-subtle bg-bg-surface p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Détails de l&apos;achat
        </p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Beat</span>
            <span className="font-medium">{purchase.beat_title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Licence</span>
            <span className="font-medium">{licenseLabel}</span>
          </div>
          <div className="border-t border-border-subtle pt-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Montant payé</span>
              <span className="font-display font-bold">
                {purchase.price_paid}€
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="mt-6">
        <button
          type="button"
          disabled={downloading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90 disabled:opacity-50"
          onClick={async () => {
            setDownloading(true);
            const result = await getBeatDownloadUrl(purchase.beat_id);
            if (result.success) {
              window.open(result.data.url, "_blank");
            } else {
              toast({
                title: "Erreur",
                description: result.error,
                variant: "error",
              });
            }
            setDownloading(false);
          }}
        >
          <Download className="h-5 w-5" />
          {downloading ? "Préparation..." : "Télécharger le fichier audio"}
        </button>
        <p className="mt-2 text-center text-xs text-text-muted">
          Tu peux aussi retrouver ce beat dans ton historique à tout moment.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <Link
          href="/beats"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
        >
          <Music className="h-4 w-4" />
          Explorer d&apos;autres beats
        </Link>
        <Link
          href="/account"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
        >
          Mon compte
        </Link>
      </div>
    </div>
  );
}

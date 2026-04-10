"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Headphones } from "lucide-react";
import { getMixingOrder } from "@/actions/mixing";
import type { MixingOrder } from "@/types";

export default function MixingConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<MixingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!orderId) {
        setError("Aucune commande trouvée");
        setLoading(false);
        return;
      }
      const result = await getMixingOrder(orderId);
      if (!result.success) {
        setError(result.error);
      } else {
        setOrder(result.data);
      }
      setLoading(false);
    }
    load();
  }, [orderId]);

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

  if (error || !order) {
    return (
      <div className="px-4 pt-6 pb-24 text-center md:mx-auto md:max-w-[600px] md:px-6 md:pt-12">
        <h1 className="font-display text-[30px] font-bold leading-tight">Commande introuvable</h1>
        <p className="mt-2 text-text-secondary">{error}</p>
        <Link
          href="/mixing"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.3)] transition-opacity hover:opacity-90"
        >
          Commander un mix
        </Link>
      </div>
    );
  }

  const formulaLabel = order.formula === "premium" ? "Premium" : "Standard";

  return (
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[600px] md:px-6 md:pt-12">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="font-display text-[30px] font-bold leading-tight">
          Commande confirmée !
        </h1>
        <p className="mt-2 text-text-secondary">
          Ta demande de mixage a été envoyée. Un ingénieur va s&apos;en occuper.
        </p>
      </div>

      {/* Order details */}
      <div className="mt-8 rounded-lg border border-border-subtle bg-bg-surface p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Détails de la commande
        </p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Formule</span>
            <span className="font-medium">Mix {formulaLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Retouches incluses</span>
            <span className="font-medium">{order.max_revisions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Délai estimé</span>
            <span className="font-medium">2-5 jours ouvrés</span>
          </div>
          <div className="border-t border-border-subtle pt-3">
            <div className="flex justify-between">
              <span className="text-text-secondary">Montant payé</span>
              <span className="font-display font-bold">{order.price}€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Brief preview */}
      {order.brief && (
        <div className="mt-6 rounded-lg border border-border-subtle bg-bg-surface p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Ton brief
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            {order.brief}
          </p>
        </div>
      )}

      {/* Next steps */}
      <div className="mt-6 rounded-lg border border-purple-500/30 bg-purple-500/5 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-500/20">
            <Headphones className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="font-display font-semibold">Et maintenant ?</p>
            <p className="mt-1 text-sm text-text-secondary">
              Notre ingénieur va traiter ta demande. Tu recevras une
              notification par email à chaque étape (en cours → livré).
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <Link
          href="/account"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border-default px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover"
        >
          Mon compte
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

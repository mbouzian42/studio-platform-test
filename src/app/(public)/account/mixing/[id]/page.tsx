"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getMixingOrder } from "@/actions/mixing";
import { MixingStatusTracker } from "@/components/mixing/mixing-status-tracker";
import { RevisionRequest } from "@/components/mixing/revision-request";
import type { MixingOrder } from "@/types";

export default function MixingOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<MixingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadOrder() {
    const result = await getMixingOrder(params.id);
    if (!result.success) {
      if (result.error === "Connexion requise") {
        router.push(`/login?redirect=/account/mixing/${params.id}`);
        return;
      }
      setError(result.error);
    } else {
      setOrder(result.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-12 md:px-6 md:py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          <div className="h-32 rounded-lg bg-bg-surface" />
          <div className="h-48 rounded-lg bg-bg-surface" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-12 text-center md:px-6 md:py-20">
        <h1 className="font-display text-2xl font-bold">Commande introuvable</h1>
        <p className="mt-2 text-text-secondary">{error}</p>
        <Link
          href="/account/mixing"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Mes commandes
        </Link>
      </div>
    );
  }

  const formulaLabel = order.formula === "premium" ? "Premium" : "Standard";
  const date = new Date(order.created_at).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-[700px] px-4 py-12 md:px-6 md:py-20">
      <Link
        href="/account/mixing"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Mes commandes
      </Link>

      <h1 className="font-display text-2xl font-bold md:text-3xl">
        Mix {formulaLabel}
      </h1>
      <p className="mt-1 text-sm text-text-secondary capitalize">{date}</p>

      {/* Status tracker */}
      <div className="mt-8">
        <MixingStatusTracker
          status={order.mixing_status}
          revisionCount={order.revision_count}
          maxRevisions={order.max_revisions}
        />
      </div>

      {/* Order details */}
      <div className="mt-6 rounded-lg border border-border-subtle bg-bg-surface p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Détails de la commande
        </p>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Formule</span>
            <span className="font-medium">Mix {formulaLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Prix</span>
            <span className="font-display font-bold">{order.price}€</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Retouches</span>
            <span className="font-medium">
              {order.revision_count}/{order.max_revisions} utilisées
            </span>
          </div>
          {order.mixing_status === "pending" && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Délai estimé</span>
              <span className="font-medium">2-5 jours ouvrés</span>
            </div>
          )}
        </div>
      </div>

      {/* Brief */}
      {order.brief && (
        <div className="mt-6 rounded-lg border border-border-subtle bg-bg-surface p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Brief de mixage
          </p>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {order.brief}
          </p>
        </div>
      )}

      {/* Delivered file */}
      {order.delivered_file_url && (
        <div className="mt-6 rounded-lg border border-success/30 bg-success/5 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-success">
            Mix livré
          </p>
          <audio controls className="w-full" src={order.delivered_file_url}>
            Ton navigateur ne supporte pas la lecture audio.
          </audio>
          <a
            href={order.delivered_file_url}
            download
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Télécharger le mix
          </a>
        </div>
      )}

      {/* Google Meet link */}
      {order.meet_link && (
        <div className="mt-6 rounded-lg border border-border-subtle bg-bg-surface p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Session visio
          </p>
          <a
            href={order.meet_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Rejoindre la session Google Meet
          </a>
        </div>
      )}

      {/* Revision request form */}
      {(order.mixing_status === "delivered" || order.mixing_status === "completed") &&
        order.revision_count < order.max_revisions && (
          <div className="mt-6">
            <RevisionRequest
              mixingOrderId={order.id}
              revisionCount={order.revision_count}
              maxRevisions={order.max_revisions}
              onSuccess={() => loadOrder()}
            />
          </div>
        )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getEngineerMixingOrder,
  deliverMix,
  addMeetLink,
  updateMixingStatus,
} from "@/actions/mixing";
import { MixingStatusTracker } from "@/components/mixing/mixing-status-tracker";
import { toast } from "@/components/ui/toaster";
import type { MixingOrder, MixingRevision } from "@/types";

export default function EngineerMixingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<(MixingOrder & { revisions: MixingRevision[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  // Deliver form
  const [deliverUrl, setDeliverUrl] = useState("");
  const [delivering, setDelivering] = useState(false);

  // Meet link form
  const [meetUrl, setMeetUrl] = useState("");
  const [addingMeet, setAddingMeet] = useState(false);

  async function loadOrder() {
    const result = await getEngineerMixingOrder(params.id);
    if (!result.success) {
      router.push("/login?redirect=/engineer/mixing");
      return;
    }
    setOrder(result.data);
    setMeetUrl(result.data.meet_link ?? "");
    setLoading(false);
  }

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleDeliver() {
    if (!deliverUrl.trim()) return;
    setDelivering(true);
    const result = await deliverMix(params.id, deliverUrl.trim());
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
    } else {
      toast({ title: "Mix livré", description: "Le client a été notifié.", variant: "success" });
      await loadOrder();
    }
    setDelivering(false);
  }

  async function handleAddMeet() {
    if (!meetUrl.trim()) return;
    setAddingMeet(true);
    const result = await addMeetLink(params.id, meetUrl.trim());
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
    } else {
      toast({ title: "Lien ajouté", variant: "success" });
      await loadOrder();
    }
    setAddingMeet(false);
  }

  async function handleStatusChange(status: "pending" | "in_progress" | "delivered") {
    const result = await updateMixingStatus(params.id, status);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
    } else {
      toast({ title: "Statut mis à jour", variant: "success" });
      await loadOrder();
    }
  }

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

  if (!order) return null;

  const formulaLabel = order.formula === "premium" ? "Premium" : "Standard";

  return (
    <div className="mx-auto max-w-[700px] px-4 py-12 md:px-6 md:py-20">
      <Link
        href="/engineer/mixing"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Mes demandes
      </Link>

      <h1 className="font-display text-2xl font-bold md:text-3xl">
        Mix {formulaLabel}
      </h1>

      {/* Status tracker */}
      <div className="mt-6">
        <MixingStatusTracker
          status={order.mixing_status}
          revisionCount={order.revision_count}
          maxRevisions={order.max_revisions}
        />
      </div>

      {/* Status change buttons */}
      <div className="mt-4 flex gap-2">
        {order.mixing_status === "pending" && (
          <button
            type="button"
            onClick={() => handleStatusChange("in_progress")}
            className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Commencer le mix
          </button>
        )}
      </div>

      {/* Client brief */}
      {order.brief && (
        <div className="mt-6 rounded-lg border border-border-subtle bg-bg-surface p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Brief du client
          </p>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {order.brief}
          </p>
        </div>
      )}

      {/* Files (placeholder — would show stems from Storage) */}
      <div className="mt-6 rounded-lg border border-border-subtle bg-bg-surface p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Fichiers du client
        </p>
        <p className="text-sm text-text-muted">
          Les fichiers stems sont disponibles dans le bucket Supabase Storage
          (configuration requise).
        </p>
      </div>

      {/* Deliver mix */}
      {(order.mixing_status === "in_progress" || order.mixing_status === "revision_requested") && (
        <div className="mt-6 rounded-lg border border-success/30 bg-success/5 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-success">
            Livrer le mix
          </p>
          <input
            type="text"
            value={deliverUrl}
            onChange={(e) => setDeliverUrl(e.target.value)}
            placeholder="URL du fichier mixé (Supabase Storage)"
            className="w-full rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={handleDeliver}
            disabled={delivering || !deliverUrl.trim()}
            className="mt-3 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {delivering ? "Livraison..." : "Marquer comme livré"}
          </button>
        </div>
      )}

      {/* Google Meet link */}
      <div className="mt-6 rounded-lg border border-border-subtle bg-bg-surface p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Session Google Meet
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={meetUrl}
            onChange={(e) => setMeetUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="flex-1 rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={handleAddMeet}
            disabled={addingMeet || !meetUrl.trim()}
            className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {addingMeet ? "..." : "Sauver"}
          </button>
        </div>
      </div>

      {/* Revision history */}
      {order.revisions.length > 0 && (
        <div className="mt-6 rounded-lg border border-border-subtle bg-bg-surface p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Historique des retouches
          </p>
          <div className="space-y-3">
            {order.revisions.map((rev) => (
              <div
                key={rev.id}
                className="rounded-lg border border-border-subtle bg-bg-elevated p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-purple-400">
                    Retouche {rev.revision_number}
                  </p>
                  <p className="text-xs text-text-muted capitalize">
                    {rev.revision_status.replace("_", " ")}
                  </p>
                </div>
                <p className="mt-2 text-sm text-text-secondary whitespace-pre-wrap">
                  {rev.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { checkAdminAccess } from "@/actions/admin";
import {
  getAdminPricingData,
  updatePricingRule,
  createPricingRule,
} from "@/actions/admin-pricing";
import { toast } from "@/components/ui/toaster";
import type { Studio, StudioPricing } from "@/types";

interface StudioWithPricing {
  studio: Studio;
  pricing: StudioPricing[];
}

const DAY_LABELS = { weekday: "Semaine (lun-ven)", weekend: "Week-end (sam-dim)" };
const TIME_LABELS = { peak: "Heures pleines", off_peak: "Heures creuses (8h-14h)" };

export default function AdminPricingPage() {
  const router = useRouter();
  const [data, setData] = useState<StudioWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const access = await checkAdminAccess();
      if (!access.success || !access.data.isAdmin) {
        router.push("/");
        return;
      }
      const result = await getAdminPricingData();
      if (!result.success) {
        router.push("/");
        return;
      }
      setData(result.data);

      // Initialize edit values
      const values: Record<string, number> = {};
      for (const s of result.data) {
        for (const p of s.pricing) {
          values[p.id] = p.hourly_rate;
        }
      }
      setEditValues(values);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSave(pricingId: string) {
    const rate = editValues[pricingId];
    if (rate === undefined || rate < 0) return;

    setSaving(pricingId);
    const result = await updatePricingRule(pricingId, rate);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
    } else {
      toast({ title: "Tarif mis à jour", variant: "success" });
    }
    setSaving(null);
  }

  async function handleCreateRule(
    studioId: string,
    dayCategory: "weekday" | "weekend",
    timeCategory: "peak" | "off_peak",
  ) {
    const result = await createPricingRule(studioId, dayCategory, timeCategory, 35);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    toast({ title: "Règle créée", variant: "success" });
    // Reload
    const reload = await getAdminPricingData();
    if (reload.success) {
      setData(reload.data);
      const values: Record<string, number> = {};
      for (const s of reload.data) {
        for (const p of s.pricing) {
          values[p.id] = p.hourly_rate;
        }
      }
      setEditValues(values);
    }
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          <div className="h-64 rounded-lg bg-bg-surface" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <h1 className="font-display text-[30px] font-bold leading-tight">
        Configuration des Tarifs
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Modifie les tarifs par studio, par jour et par créneau horaire.
        Les changements sont appliqués immédiatement.
      </p>

      <div className="mt-8 space-y-8">
        {data.map(({ studio, pricing }) => {
          // Expected combinations
          const combinations: {
            day: "weekday" | "weekend";
            time: "peak" | "off_peak";
          }[] = [
            { day: "weekday", time: "peak" },
            { day: "weekday", time: "off_peak" },
            { day: "weekend", time: "peak" },
          ];

          return (
            <div
              key={studio.id}
              className="rounded-lg border border-border-subtle bg-bg-surface p-5"
            >
              <h2 className="font-display text-lg font-semibold">
                {studio.name}
              </h2>

              <div className="mt-4 space-y-3">
                {combinations.map(({ day, time }) => {
                  const rule = pricing.find(
                    (p) =>
                      p.day_category === day && p.time_category === time,
                  );

                  if (!rule) {
                    return (
                      <div
                        key={`${day}-${time}`}
                        className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {DAY_LABELS[day]} — {TIME_LABELS[time]}
                          </p>
                          <p className="text-xs text-text-muted">
                            Non configuré
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCreateRule(studio.id, day, time)
                          }
                          className="rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          Créer
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-elevated p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {DAY_LABELS[day]} — {TIME_LABELS[time]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={editValues[rule.id] ?? rule.hourly_rate}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              [rule.id]:
                                parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-20 rounded-lg border border-border-subtle bg-bg-primary px-3 py-1.5 text-right text-sm font-display font-bold text-text-primary transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <span className="text-sm text-text-muted">€/h</span>
                        <button
                          type="button"
                          onClick={() => handleSave(rule.id)}
                          disabled={
                            saving === rule.id ||
                            editValues[rule.id] === rule.hourly_rate
                          }
                          className="flex items-center gap-1 rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-30"
                        >
                          <Save className="h-3 w-3" />
                          {saving === rule.id ? "..." : "Sauver"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-6 rounded-lg border border-border-subtle bg-bg-elevated p-4">
        <p className="text-xs text-text-muted leading-relaxed">
          <strong>Heures creuses</strong> : lun-ven 8h-14h. Le tarif heures
          creuses s&apos;affiche barré avec le tarif standard pour les clients.
          Les modifications sont appliquées immédiatement sur la page de
          réservation.
        </p>
      </div>
    </div>
  );
}

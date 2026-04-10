"use client";

import { Clock, Settings, CheckCircle } from "lucide-react";
import type { MixingStatus } from "@/types";

interface MixingStatusTrackerProps {
  status: MixingStatus;
  revisionCount: number;
  maxRevisions: number;
}

const STEPS = [
  { key: "pending" as const, label: "En attente", icon: Clock },
  { key: "in_progress" as const, label: "En cours", icon: Settings },
  { key: "delivered" as const, label: "Livré", icon: CheckCircle },
];

function getStepIndex(status: MixingStatus): number {
  if (status === "pending") return 0;
  if (status === "in_progress") return 1;
  if (status === "revision_requested") return 1; // Back to in-progress visually
  return 2; // delivered or completed
}

export function MixingStatusTracker({
  status,
  revisionCount,
  maxRevisions,
}: MixingStatusTrackerProps) {
  const currentStep = getStepIndex(status);

  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemax={3}
      className="rounded-lg border border-border-subtle bg-bg-surface p-5"
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Suivi de ta commande
      </p>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    isDone
                      ? "bg-success text-white"
                      : isActive
                        ? "bg-brand-gradient text-white"
                        : "bg-bg-elevated text-text-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`mt-2 text-xs ${
                    isActive ? "font-semibold text-text-primary" : "text-text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    i < currentStep ? "bg-success" : "bg-border-subtle"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Revision counter */}
      {status === "delivered" || status === "revision_requested" ? (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-elevated px-3 py-1 text-xs">
            {revisionCount < maxRevisions ? (
              <span className="text-text-secondary">
                {maxRevisions - revisionCount} retouche
                {maxRevisions - revisionCount > 1 ? "s" : ""} restante
                {maxRevisions - revisionCount > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-text-muted">
                Retouches épuisées ({maxRevisions}/{maxRevisions})
              </span>
            )}
          </span>
        </div>
      ) : null}

      {/* Delivery estimate */}
      {status === "pending" && (
        <p className="mt-3 text-center text-xs text-text-muted">
          Délai estimé : 2-5 jours ouvrés
        </p>
      )}
    </div>
  );
}

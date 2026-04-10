"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Beat } from "@/types";
import { AudioPlayer } from "./audio-player";
import { LicenseSelector } from "./license-selector";
import { purchaseBeat } from "@/actions/beats";

interface BeatDetailSheetProps {
  beat: Beat;
  onClose: () => void;
}

export function BeatDetailSheet({ beat, onClose }: BeatDetailSheetProps) {
  const [selectedLicense, setSelectedLicense] = useState<"simple" | "exclusive">(
    "simple",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price =
    selectedLicense === "exclusive" && beat.price_exclusive
      ? beat.price_exclusive
      : beat.price_simple;

  async function handleBuy() {
    setPending(true);
    setError(null);

    const result = await purchaseBeat(beat.id, selectedLicense);

    if (!result.success) {
      // If auth required, redirect to login with return URL
      if (result.error === "Connexion requise pour acheter") {
        window.location.href = `/login?redirect=/beats/${beat.slug}`;
        return;
      }
      setError(result.error);
      setPending(false);
      return;
    }

    // Redirect to Stripe checkout (mock redirects to confirmation)
    window.location.href = result.data.checkoutUrl;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl border border-border-subtle bg-bg-surface p-6 md:rounded-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cover + info */}
        <div className="flex gap-4">
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-600/40 to-magenta-500/40">
            {beat.cover_image_url ? (
              <img
                src={beat.cover_image_url}
                alt={beat.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-3xl text-white/20">♫</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-bold">
              {beat.title}
            </h2>
            <p className="mt-0.5 text-sm text-text-secondary">
              {beat.genre ?? "Beat"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {beat.bpm && (
                <span className="rounded-full bg-bg-elevated px-2.5 py-0.5 font-mono text-xs text-text-muted">
                  {beat.bpm} BPM
                </span>
              )}
              {beat.key && (
                <span className="rounded-full bg-bg-elevated px-2.5 py-0.5 font-mono text-xs text-text-muted">
                  {beat.key}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Audio player */}
        <div className="mt-5">
          <AudioPlayer beatId={beat.id} previewUrl={beat.audio_preview_url} />
        </div>

        {/* License selector */}
        <div className="mt-5">
          <LicenseSelector
            priceSimple={beat.price_simple}
            priceExclusive={beat.price_exclusive}
            selectedLicense={selectedLicense}
            onSelect={setSelectedLicense}
          />
        </div>

        {/* Error */}
        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        {/* Buy CTA */}
        <button
          type="button"
          disabled={pending}
          className="mt-5 w-full rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          onClick={handleBuy}
        >
          {pending ? "Achat en cours..." : `Acheter pour ${price}€`}
        </button>

        <p className="mt-2 text-center text-xs text-text-muted">
          Téléchargement WAV instantané après paiement
        </p>

        {/* Tags */}
        {beat.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {beat.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-bg-elevated px-2.5 py-0.5 text-xs text-text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

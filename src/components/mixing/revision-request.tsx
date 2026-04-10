"use client";

import { useState } from "react";
import { requestRevision } from "@/actions/mixing";

interface RevisionRequestProps {
  mixingOrderId: string;
  revisionCount: number;
  maxRevisions: number;
  onSuccess: () => void;
}

export function RevisionRequest({
  mixingOrderId,
  revisionCount,
  maxRevisions,
  onSuccess,
}: RevisionRequestProps) {
  const [feedback, setFeedback] = useState("");
  const [requestVideoCall, setRequestVideoCall] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (revisionCount >= maxRevisions) {
    return null;
  }

  async function handleSubmit() {
    if (feedback.length < 10) return;
    setPending(true);
    setError(null);

    const result = await requestRevision({
      mixingOrderId,
      feedback,
      requestVideoCall,
    });

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    setPending(false);
    onSuccess();
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Demander une retouche ({revisionCount + 1}/{maxRevisions})
      </p>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="Décris les modifications souhaitées. Indique les timestamps si possible.

Ex: « À 1:24, le kick est trop fort par rapport au hi-hat. Sur le refrain (0:45-1:15), ajouter plus de delay sur les ad-libs. »"
        className="w-full resize-none rounded-lg border border-border-subtle bg-bg-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
      />

      {/* Video call option */}
      <label className="mt-3 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={requestVideoCall}
          onChange={(e) => setRequestVideoCall(e.target.checked)}
          className="accent-purple-500"
        />
        <span className="text-sm text-text-secondary">
          Je préfère une session en visio (Google Meet, max 2h)
        </span>
      </label>

      {error && <p className="mt-2 text-sm text-error">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending || feedback.length < 10}
        className="mt-4 w-full rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Envoi en cours..." : "Envoyer la demande de retouche"}
      </button>
    </div>
  );
}

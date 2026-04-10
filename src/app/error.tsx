"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-3xl font-bold">
        Oups, quelque chose s&apos;est mal passé
      </h1>
      <p className="mt-3 text-text-secondary">
        Une erreur inattendue est survenue. Réessaie ou retourne à l&apos;accueil.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium transition-colors hover:bg-bg-hover"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

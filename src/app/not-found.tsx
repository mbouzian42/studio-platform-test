import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-bold text-purple-500">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">
        Page introuvable
      </h1>
      <p className="mt-2 text-text-secondary">
        La page que tu cherches n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}

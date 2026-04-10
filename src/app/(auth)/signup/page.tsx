import type { Metadata } from "next";
import Link from "next/link";
import { signup, signInWithOAuth } from "../actions";
import { OAuthButtons } from "../_components/oauth-buttons";
import { AuthInput } from "../_components/auth-input";
import { SubmitButton } from "../_components/submit-button";
import { AuthMessage } from "../_components/auth-message";

export const metadata: Metadata = {
  title: "Créer un compte",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  if (success === "check-email") {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-success"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold">
          Vérifie ta boîte mail
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Un lien de confirmation a été envoyé à ton adresse email. Clique
          dessus pour activer ton compte.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-purple-500 hover:text-purple-400"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold">Créer un compte</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Rejoins Studio Platform pour réserver, acheter des prods et plus.
        </p>
      </div>

      {error && <AuthMessage type="error" message={error} />}

      <OAuthButtons />

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs text-text-muted">ou par email</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      <form action={signup} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <AuthInput
            label="Nom"
            name="last_name"
            type="text"
            placeholder="Dupont"
            required
            autoComplete="family-name"
          />
          <AuthInput
            label="Prénom"
            name="first_name"
            type="text"
            placeholder="Karim"
            required
            autoComplete="given-name"
          />
        </div>

        <AuthInput
          label="Nom d'artiste"
          name="artist_name"
          type="text"
          placeholder="Ton blaze"
          optional
        />

        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="exemple@email.com"
          required
          autoComplete="email"
        />

        <AuthInput
          label="Mot de passe"
          name="password"
          type="password"
          placeholder="Minimum 8 caractères"
          required
          minLength={8}
          autoComplete="new-password"
        />

        <p className="text-xs text-text-muted">
          En créant un compte, tu acceptes nos{" "}
          <Link href="/legal/terms" className="text-purple-500 hover:text-purple-400">
            conditions d&apos;utilisation
          </Link>{" "}
          et notre{" "}
          <Link
            href="/legal/privacy"
            className="text-purple-500 hover:text-purple-400"
          >
            politique de confidentialité
          </Link>
          .
        </p>

        <SubmitButton>Créer mon compte</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="font-medium text-purple-500 hover:text-purple-400"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}

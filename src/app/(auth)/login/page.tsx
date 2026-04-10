import type { Metadata } from "next";
import Link from "next/link";
import { login } from "../actions";
import { OAuthButtons } from "../_components/oauth-buttons";
import { AuthInput } from "../_components/auth-input";
import { SubmitButton } from "../_components/submit-button";
import { AuthMessage } from "../_components/auth-message";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const { error, redirect: redirectTo } = await searchParams;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold">
          Connecte-toi pour continuer
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Crée ton compte ou identifie-toi pour finaliser.
        </p>
      </div>

      {error && <AuthMessage type="error" message={error} />}

      <OAuthButtons redirectTo={redirectTo} />

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-xs text-text-muted">ou par email</span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      <form action={login} className="space-y-4">
        {redirectTo && (
          <input type="hidden" name="redirect" value={redirectTo} />
        )}

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
          placeholder="Ton mot de passe"
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              name="remember"
              className="h-4 w-4 rounded border-border-default bg-bg-surface accent-purple-500"
            />
            Se souvenir de moi
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-purple-500 hover:text-purple-400"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <SubmitButton>Se connecter</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Pas encore de compte ?{" "}
        <Link
          href={
            redirectTo
              ? `/signup?redirect=${encodeURIComponent(redirectTo)}`
              : "/signup"
          }
          className="font-medium text-purple-500 hover:text-purple-400"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { forgotPassword } from "../actions";
import { AuthInput } from "../_components/auth-input";
import { SubmitButton } from "../_components/submit-button";
import { AuthMessage } from "../_components/auth-message";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  if (success === "email-sent") {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-purple-500"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold">Email envoyé</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Si un compte existe avec cette adresse, tu recevras un lien pour
          réinitialiser ton mot de passe.
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
        <h1 className="font-display text-2xl font-bold">
          Mot de passe oublié ?
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Entre ton adresse email et on t&apos;envoie un lien de
          réinitialisation.
        </p>
      </div>

      {error && <AuthMessage type="error" message={error} />}

      <form action={forgotPassword} className="space-y-4">
        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="exemple@email.com"
          required
          autoComplete="email"
        />

        <SubmitButton>Envoyer le lien</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Tu te souviens ?{" "}
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

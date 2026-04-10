import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      {/* Back + Logo */}
      <div className="px-4 pt-4">
        <Link
          href="/"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-surface text-text-primary transition-colors hover:bg-bg-hover"
          aria-label="Retour à l'accueil"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
      </div>

      <main className="flex flex-1 flex-col items-center px-4 pt-8 pb-12">
        {/* Brand mark */}
        <Image src="/img/logo.jpg" alt="Studio Platform" width={160} height={32} className="mb-4 h-8 w-auto" />
        {children}
      </main>
    </div>
  );
}

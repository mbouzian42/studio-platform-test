import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="hidden border-t border-border-subtle bg-bg-elevated py-12 md:block">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p className="font-display text-lg font-bold">STUDIO PLATFORM</p>
            <p className="mt-2 text-sm text-text-secondary">
              {siteConfig.description}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="mb-3 text-sm font-semibold text-text-secondary">
              Navigation
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/#about" className="text-sm text-text-muted hover:text-text-primary">
                À propos
              </Link>
              <Link href="/#contact" className="text-sm text-text-muted hover:text-text-primary">
                Contact
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-3 text-sm font-semibold text-text-secondary">
              Légal
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/legal/notices" className="text-sm text-text-muted hover:text-text-primary">
                Mentions légales
              </Link>
              <Link href="/legal/terms" className="text-sm text-text-muted hover:text-text-primary">
                CGV
              </Link>
              <Link href="/legal/privacy" className="text-sm text-text-muted hover:text-text-primary">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border-subtle pt-8 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}

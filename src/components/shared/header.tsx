"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/site";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 hidden w-full border-b border-border-subtle bg-bg-primary/80 backdrop-blur-lg md:block">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/img/logo.png" alt="Studio Platform" width={160} height={32} className="h-8 w-auto object-contain" />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.desktop.map((item) => {
            const isActive = item.href.includes("#")
              ? false
              : item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-purple-500"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth CTA */}
        <Link
          href="/account"
          className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Mon compte
        </Link>
      </div>
    </header>
  );
}

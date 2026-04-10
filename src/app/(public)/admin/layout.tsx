"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Music,
  SlidersHorizontal,
  Users,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { checkAdminAccess } from "@/actions/admin";

const sidebarItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/calendar", label: "Calendrier", icon: Calendar },
  { href: "/admin/beats", label: "Prods", icon: Music },
  { href: "/admin/mixing", label: "Mixages", icon: SlidersHorizontal },
  { href: "/admin/engineers", label: "Équipe", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function check() {
      const access = await checkAdminAccess();
      if (!access.success || !access.data.isAdmin) {
        router.push("/");
        return;
      }
      setAuthorized(true);
    }
    check();
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          <div className="h-4 w-64 rounded bg-bg-surface" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop only */}
      <aside className="hidden w-[260px] flex-shrink-0 border-r border-border-subtle bg-bg-elevated md:block">
        <div className="fixed top-0 left-0 h-screen w-[260px] overflow-y-auto p-6">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
              A
            </div>
            <span className="font-display text-xl font-bold">Studio Platform</span>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1">
            {sidebarItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-brand-gradient text-white"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom link */}
          <div className="mt-auto pt-8">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-sm text-text-muted transition-colors hover:text-text-primary"
            >
              <ExternalLink className="h-5 w-5" />
              Voir le site
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-0">
        {children}
      </main>
    </div>
  );
}

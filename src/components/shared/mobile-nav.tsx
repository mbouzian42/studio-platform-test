"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Music,
  Calendar,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/site";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  music: Music,
  calendar: Calendar,
  sliders: SlidersHorizontal,
  user: User,
};

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border-subtle bg-bg-elevated md:hidden"
      aria-label="Navigation principale"
    >
      <div className="flex h-16 items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {navItems.mobile.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[56px] flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-purple-500"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Icon className="h-6 w-6" />
              <span
                className={cn(
                  "text-[11px]",
                  isActive && "font-semibold"
                )}
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #8B5CF6, #D946EF, #F43F5E)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }
                    : undefined
                }
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TeamMemberCardProps {
  name: string;
  role: string;
  bio: string;
}

export function TeamMemberCard({ name, role, bio }: TeamMemberCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full rounded-lg border border-border-subtle bg-bg-surface p-5 text-left transition-colors hover:border-purple-500/50"
      >
        {/* Avatar */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-magenta-500">
          <span className="font-display text-2xl font-bold text-white">
            {name.charAt(0)}
          </span>
        </div>
        <h3 className="text-center font-display font-semibold">{name}</h3>
        <p className="mt-1 text-center text-sm text-purple-400">{role}</p>
        <p className="mt-2 text-center text-xs text-text-muted">
          Cliquer pour en savoir plus
        </p>
      </button>

      {/* Bio — bottom sheet on mobile, inline modal on desktop */}
      {expanded && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl border border-border-subtle bg-bg-surface p-6 md:rounded-2xl">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-magenta-500">
                <span className="font-display text-xl font-bold text-white">
                  {name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">{name}</h3>
                <p className="text-sm text-purple-400">{role}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-text-secondary leading-relaxed">
              {bio}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

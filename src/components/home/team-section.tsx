"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const TEAM = [
  {
    id: "founder",
    name: "Founder",
    role: "Founder & Manager",
    initial: "F",
    bio: "Founder and manager of the studio. Sample bio text.",
    videoUrl: null as string | null,
  },
  {
    id: "engineer-1",
    name: "Engineer 1",
    role: "Sound engineer & Beatmaker",
    initial: "E",
    bio: "Sound engineer and beatmaker. Sample bio text.",
    videoUrl: null as string | null,
  },
  {
    id: "engineer-2",
    name: "Engineer 2",
    role: "Sound engineer",
    initial: "E",
    bio: "Sound engineer. Sample bio text.",
    videoUrl: null as string | null,
  },
  {
    id: "mixer",
    name: "Mix Engineer",
    role: "Sound engineer & Mix",
    initial: "M",
    bio: "Mixing engineer. Sample bio text.",
    videoUrl: null as string | null,
  },
];

export function TeamSection() {
  const [selected, setSelected] = useState<(typeof TEAM)[number] | null>(null);

  return (
    <>
      <div className="team-grid">
        {TEAM.map((member) => (
          <div
            key={member.id}
            className="team-member"
            onClick={() => setSelected(member)}
          >
            <div className="team-avatar">
              <div className="team-avatar-inner">{member.initial}</div>
            </div>
            <h4 className="font-display text-[15px] font-medium mb-0.5">{member.name}</h4>
            <span className="text-xs text-text-secondary">{member.role}</span>
          </div>
        ))}
      </div>

      {/* Team Bio Modal */}
      <div
        className={`team-modal-overlay ${selected ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        <div className="team-modal-container">
          <button
            className="absolute top-4 right-4 text-2xl text-text-muted hover:text-text-primary"
            onClick={() => setSelected(null)}
          >
            &times;
          </button>
          {selected && (
            <>
              <div className="team-modal-avatar">
                <div className="team-avatar-inner">{selected.initial}</div>
              </div>
              <h3 className="text-center font-display text-[22px] font-semibold mb-1">
                {selected.name}
              </h3>
              <p className="text-center text-sm font-medium text-purple-500 mb-4">
                {selected.role}
              </p>
              <p className="text-center text-sm text-text-secondary leading-[1.7]">
                {selected.bio}
              </p>
              <div className="mt-4 overflow-hidden rounded-lg">
                {selected.videoUrl ? (
                  <video
                    src={selected.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-default bg-bg-surface py-8">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                      <Play className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className="text-xs text-text-muted">Vidéo à venir</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

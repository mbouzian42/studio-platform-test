"use client";

interface BeatsOnboardingProps {
  onComplete: () => void;
}

export function BeatsOnboarding({ onComplete }: BeatsOnboardingProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg-primary text-center"
      style={{ padding: "40px 32px" }}
    >
      {/* Skip link */}
      <button
        type="button"
        onClick={onComplete}
        className="absolute font-medium transition-colors"
        style={{
          top: 52,
          right: 24,
          fontSize: 14,
          color: "var(--color-text-muted)",
        }}
      >
        Passer
      </button>

      {/* Illustration: stacked cards */}
      <div className="relative" style={{ width: 240, height: 300, marginBottom: 40 }}>
        {/* Card 1 — left, tilted -8deg */}
        <OnboardingCard
          title="Cloud Trap"
          meta="138 BPM"
          bars={5}
          style={{
            left: 0,
            top: 30,
            transform: "rotate(-8deg)",
            opacity: 0.5,
          }}
        />
        {/* Card 2 — right, tilted +8deg */}
        <OnboardingCard
          title="Dark Drill"
          meta="142 BPM"
          bars={5}
          style={{
            right: 0,
            top: 30,
            transform: "rotate(8deg)",
            opacity: 0.5,
          }}
        />
        {/* Card 3 — center, front */}
        <OnboardingCard
          title="Sunset Drill"
          meta="145 BPM · Cm"
          bars={7}
          style={{
            left: "50%",
            top: 10,
            transform: "translateX(-50%)",
            zIndex: 2,
            borderColor: "var(--color-purple-500, #8b5cf6)",
            boxShadow: "0 8px 32px rgba(139, 92, 246, 0.2)",
          }}
        />
      </div>

      {/* Swipe actions */}
      <div
        className="flex items-center"
        style={{ gap: 40, marginBottom: 40 }}
      >
        {/* Pass */}
        <div className="flex flex-col items-center" style={{ gap: 8 }}>
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 56,
              height: 56,
              border: "2px solid var(--color-border-default)",
              color: "var(--color-text-secondary)",
              fontSize: 24,
            }}
          >
            &times;
          </div>
          <span
            className="font-medium uppercase"
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              letterSpacing: 1,
            }}
          >
            Passer
          </span>
        </div>

        {/* Chevrons */}
        <div
          className="flex items-center"
          style={{ gap: 4, color: "var(--color-text-muted)", fontSize: 18, opacity: 0.4 }}
        >
          &larr; &rarr;
        </div>

        {/* Like */}
        <div className="flex flex-col items-center" style={{ gap: 8 }}>
          <div
            className="flex items-center justify-center rounded-full text-white"
            style={{
              width: 56,
              height: 56,
              background: "var(--color-brand-gradient)",
              fontSize: 24,
              boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)",
            }}
          >
            &hearts;
          </div>
          <span
            className="font-medium uppercase"
            style={{
              fontSize: 12,
              letterSpacing: 1,
              background: "var(--color-brand-gradient)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            J&apos;aime
          </span>
        </div>
      </div>

      {/* Title */}
      <div
        className="font-display font-bold"
        style={{ fontSize: 28, lineHeight: 1.2, marginBottom: 12 }}
      >
        Swipe pour
        <br />
        <span className="text-gradient">découvrir</span>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 15,
          color: "var(--color-text-secondary)",
          lineHeight: 1.6,
          maxWidth: 280,
          marginBottom: 40,
        }}
      >
        Écoute les prods, swipe à droite pour voir les détails et acheter. À
        gauche pour passer.
      </p>

      {/* CTA */}
      <button
        type="button"
        onClick={onComplete}
        className="inline-flex items-center rounded-full bg-brand-gradient font-display font-semibold text-white transition-transform hover:translate-y-[-2px]"
        style={{
          gap: 8,
          padding: "16px 40px",
          fontSize: 16,
          boxShadow: "0 4px 24px rgba(139, 92, 246, 0.4)",
        }}
      >
        C&apos;est parti &rarr;
      </button>
    </div>
  );
}

/** Single card in the stacked illustration */
const BAR_HEIGHTS: Record<number, number[]> = {
  5: [12, 24, 32, 20, 28],
  7: [12, 24, 32, 20, 28, 16, 22],
};

function OnboardingCard({
  title,
  meta,
  bars,
  style,
}: {
  title: string;
  meta: string;
  bars: 5 | 7;
  style: React.CSSProperties;
}) {
  return (
    <div
      className="absolute flex flex-col items-center justify-center rounded-[20px]"
      style={{
        width: 180,
        height: 240,
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
        gap: 8,
        ...style,
      }}
    >
      {/* Waveform bars */}
      <div
        className="flex items-center justify-center"
        style={{ width: 80, height: 40, gap: 3 }}
      >
        {BAR_HEIGHTS[bars].map((h, i) => (
          <span
            key={i}
            className="block rounded-sm"
            style={{
              width: 3,
              height: h,
              background: "var(--color-brand-gradient)",
            }}
          />
        ))}
      </div>
      <div
        className="font-display font-semibold"
        style={{ fontSize: 14, color: "var(--color-text-primary)" }}
      >
        {title}
      </div>
      <div
        className="font-mono"
        style={{ fontSize: 11, color: "var(--color-text-muted)" }}
      >
        {meta}
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { getStudios } from "@/actions/booking";

export const metadata: Metadata = {
  title: "Réserver — Studio Platform",
  description: "Book a slot in one of our recording studios.",
};

const STUDIO_DEFAULTS = [
  {
    name: "Studio A",
    slug: "studio-a",
    description: "Sample studio description. Replace with real content.",
    price: 20,
    image: null,
  },
  {
    name: "Studio B",
    slug: "studio-b",
    description: "Sample studio description. Replace with real content.",
    price: 25,
    image: null,
  },
  {
    name: "Studio C",
    slug: "studio-c",
    description: "Sample studio description. Replace with real content.",
    price: 30,
    image: null,
  },
];

export default async function BookingPage() {
  const result = await getStudios();
  const dbStudios = result.success ? result.data : [];

  const studios =
    dbStudios.length > 0
      ? dbStudios.map((s, i) => ({
          ...s,
          image: STUDIO_DEFAULTS[i]?.image ?? null,
          price: STUDIO_DEFAULTS[i]?.price ?? 20,
          description:
            s.description || STUDIO_DEFAULTS[i]?.description || "",
        }))
      : STUDIO_DEFAULTS;

  return (
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[1200px] md:px-6 md:pt-12">
      {/* Header */}
      <h1 className="font-display text-[30px] font-bold leading-tight mb-2">
        Réserver
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        Choisis ton studio et réserve ta session en quelques clics.
      </p>

      {/* Studio Cards */}
      <div className="flex flex-col gap-4 md:grid md:grid-cols-3">
        {studios.map((studio) => {
          const slug = studio.slug;
          return (
            <Link
              key={studio.name}
              href={`/booking/${slug}`}
              className="studio-booking-card block overflow-hidden rounded-xl border border-border-subtle bg-bg-elevated transition-all hover:border-purple-500"
            >
              <div className="h-[140px] w-full overflow-hidden">
                {studio.image ? (
                  <img
                    src={studio.image}
                    alt={`Studio ${studio.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
                    }}
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-xl font-semibold mb-1">
                  {studio.name}
                </h3>
                <p className="text-[13px] text-text-secondary leading-relaxed mb-3">
                  {studio.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl font-bold">
                    {studio.price}&nbsp;&euro;
                    <span className="text-sm font-normal text-text-secondary">
                      /h
                    </span>
                  </span>
                  <span className="inline-flex items-center justify-center rounded-full bg-brand-gradient px-5 py-2 text-sm font-semibold text-white">
                    Réserver
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

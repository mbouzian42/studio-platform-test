"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import { TimeSlotPicker } from "@/components/booking/time-slot-picker";
import { PricingDisplay } from "@/components/booking/pricing-display";
import { BookingRecap } from "@/components/booking/booking-recap";
import {
  getStudioBySlug,
  getStudioPricing,
  getBookedSlots,
} from "@/actions/booking";
import { createClient } from "@/lib/supabase/client";
import { calculatePrice } from "@/lib/pricing";
import type { Studio, StudioPricing } from "@/types";

const STUDIO_FALLBACKS: Record<string, { name: string; description: string }> = {
  "studio-a": {
    name: "Studio A",
    description: "Sample studio description.",
  },
  "studio-b": {
    name: "Studio B",
    description: "Sample studio description.",
  },
  "studio-c": {
    name: "Studio C",
    description: "Sample studio description.",
  },
};

const DEFAULT_PRICING: StudioPricing[] = [
  { id: "dp-1", studio_id: "fallback", day_category: "weekday" as const, time_category: "off_peak" as const, hourly_rate: 20, created_at: "", updated_at: "" },
  { id: "dp-2", studio_id: "fallback", day_category: "weekday" as const, time_category: "peak" as const, hourly_rate: 35, created_at: "", updated_at: "" },
  { id: "dp-3", studio_id: "fallback", day_category: "weekend" as const, time_category: "peak" as const, hourly_rate: 35, created_at: "", updated_at: "" },
  { id: "dp-4", studio_id: "fallback", day_category: "weekend" as const, time_category: "off_peak" as const, hourly_rate: 25, created_at: "", updated_at: "" },
];

export default function StudioBookingPage() {
  const params = useParams<{ studioSlug: string }>();
  const router = useRouter();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [pricing, setPricing] = useState<StudioPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<
    { start_time: string; end_time: string }[]
  >([]);
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<number | null>(null);
  const [show4hModal, setShow4hModal] = useState(false);
  const [showRecap, setShowRecap] = useState(false);

  // Load studio data
  useEffect(() => {
    async function load() {
      const studioResult = await getStudioBySlug(params.studioSlug);
      if (studioResult.success) {
        setStudio(studioResult.data);
        const pricingResult = await getStudioPricing(studioResult.data.id);
        if (pricingResult.success && pricingResult.data.length > 0) {
          setPricing(pricingResult.data);
        } else {
          setPricing(DEFAULT_PRICING);
        }
      } else {
        // Fallback to mock data
        const fallback = STUDIO_FALLBACKS[params.studioSlug];
        if (fallback) {
          setStudio({
            id: `fallback-${params.studioSlug}`,
            name: fallback.name,
            slug: params.studioSlug,
            description: fallback.description,
            image_url: null,
            capacity: null,
            equipment_highlights: [],
            is_active: true,
            created_at: "",
            updated_at: "",
          });
          setPricing(DEFAULT_PRICING);
        } else {
          setError("Studio introuvable");
        }
      }
      setLoading(false);
    }
    load();
  }, [params.studioSlug]);

  // Load booked slots when date changes
  const loadSlots = useCallback(async () => {
    if (!studio || !selectedDate) return;
    const result = await getBookedSlots(studio.id, selectedDate);
    if (result.success) {
      setBookedSlots(result.data);
    }
  }, [studio, selectedDate]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedStart(null);
    setSelectedEnd(null);
    setShowRecap(false);
    setShow4hModal(false);
  }

  function handleSlotChange(start: number, end: number) {
    setSelectedStart(start);
    setSelectedEnd(end);
    setShowRecap(false);
    setShow4hModal(false);
  }

  // Derive pricing rules for the UI
  const weekdayPeak =
    pricing.find(
      (p) => p.day_category === "weekday" && p.time_category === "peak",
    )?.hourly_rate ?? 35;
  const weekdayOffPeak =
    pricing.find(
      (p) => p.day_category === "weekday" && p.time_category === "off_peak",
    )?.hourly_rate ?? 20;
  const weekendPeak =
    pricing.find(
      (p) => p.day_category === "weekend" && p.time_category === "peak",
    )?.hourly_rate ?? 35;

  const pricingRules = {
    weekday_peak: weekdayPeak,
    weekday_off_peak: weekdayOffPeak,
    weekend_peak: weekendPeak,
  };

  // Calculate price breakdown
  const priceBreakdown =
    selectedDate && selectedStart !== null && selectedEnd !== null
      ? calculatePrice(pricing, selectedDate, selectedStart, selectedEnd)
      : null;

  const durationHours =
    selectedStart !== null && selectedEnd !== null
      ? selectedEnd - selectedStart
      : 0;
  const isValidSelection = durationHours >= 2;

  async function handleContinue() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?redirect=/booking/${params.studioSlug}`);
      return;
    }

    if (durationHours >= 2 && durationHours <= 3) {
      setShow4hModal(true);
    } else {
      setShowRecap(true);
    }
  }

  function handleUpgradeTo4h() {
    if (selectedStart !== null && selectedEnd !== null) {
      const newEnd = selectedStart + 4;
      // Only extend if within operating hours (up to 24)
      if (newEnd <= 24) {
        setSelectedEnd(newEnd);
      }
    }
    setShow4hModal(false);
    setShowRecap(true);
  }

  function handleKeepDuration() {
    setShow4hModal(false);
    setShowRecap(true);
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[1200px] md:px-6 md:pt-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-lg bg-bg-surface" />
          <div className="h-4 w-96 rounded bg-bg-surface" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-80 rounded-lg bg-bg-surface" />
            <div className="h-80 rounded-lg bg-bg-surface" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-12 text-center md:px-6 md:py-20">
        <h1 className="font-display text-2xl font-bold">Studio introuvable</h1>
        <p className="mt-2 text-text-secondary">
          Ce studio n&apos;existe pas ou n&apos;est plus disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 md:mx-auto md:max-w-[1200px] md:px-6 md:pt-12">
      {/* Studio header */}
      <div className="mb-8">
        <h1 className="font-display text-[30px] font-bold leading-tight">
          {studio.name}
        </h1>
        <p className="mt-2 text-text-secondary">{studio.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: Calendar + Slots */}
        <div className="space-y-6">
          <BookingCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
          <TimeSlotPicker
            selectedDate={selectedDate}
            bookedSlots={bookedSlots}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            onSlotChange={handleSlotChange}
            pricingRules={pricingRules}
          />
        </div>

        {/* Right: Price + Recap */}
        <div className="space-y-6">
          {priceBreakdown && (
            <PricingDisplay
              breakdown={priceBreakdown.breakdown}
              total={priceBreakdown.total}
              standardRate={weekdayPeak}
            />
          )}

          {isValidSelection && !showRecap && (
            <button
              type="button"
              onClick={handleContinue}
              className="w-full rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Continuer
            </button>
          )}

          {isValidSelection && showRecap && selectedDate && priceBreakdown && (
            <BookingRecap
              studioId={studio.id}
              studioName={studio.name}
              date={selectedDate}
              startHour={selectedStart!}
              endHour={selectedEnd!}
              total={priceBreakdown.total}
            />
          )}

          {durationHours > 0 && durationHours < 2 && (
            <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-center text-sm text-warning">
              La durée minimum est de 2 heures. Sélectionne un créneau
              supplémentaire.
            </p>
          )}
        </div>
      </div>

      {/* 4h recommendation modal */}
      {show4hModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShow4hModal(false)}
          />
          <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-border-subtle bg-bg-surface p-6">
            <h2 className="font-display text-xl font-bold">
              On vous recommande 4h
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              La plupart des artistes débordent sur les sessions de 2h. En
              réservant 4h dès maintenant, vous évitez le supplément horaire et
              ça vous revient moins cher.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={handleUpgradeTo4h}
                className="flex-1 rounded-lg bg-brand-gradient px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Passer à 4h
              </button>
              <button
                type="button"
                onClick={handleKeepDuration}
                className="flex-1 rounded-lg border border-border-subtle px-5 py-3 text-sm font-semibold text-text-secondary transition-colors hover:bg-bg-hover"
              >
                Continuer avec {durationHours}h
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

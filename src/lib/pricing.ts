import type { StudioPricing } from "@/types";

// Off-peak hours: Monday-Friday, 8h-14h
const OFF_PEAK_START = 8;
const OFF_PEAK_END = 14;

export function isOffPeak(dayOfWeek: number, hour: number): boolean {
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  return isWeekday && hour >= OFF_PEAK_START && hour < OFF_PEAK_END;
}

export function calculatePrice(
  pricing: StudioPricing[],
  date: string,
  startHour: number,
  endHour: number,
): { total: number; breakdown: { hour: number; rate: number; isOffPeak: boolean }[] } {
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

  const dayCategory = isWeekday ? "weekday" : "weekend";

  const breakdown: { hour: number; rate: number; isOffPeak: boolean }[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    const offPeak = isOffPeak(dayOfWeek, hour);
    const timeCategory = offPeak ? "off_peak" : "peak";

    const rule = pricing.find(
      (p) => p.day_category === dayCategory && p.time_category === timeCategory,
    );

    const rate = rule?.hourly_rate ?? 35;
    breakdown.push({ hour, rate, isOffPeak: offPeak });
  }

  const total = breakdown.reduce((sum, b) => sum + b.rate, 0);
  return { total, breakdown };
}

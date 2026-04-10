"use client";

interface TimeSlotPickerProps {
  selectedDate: string | null;
  bookedSlots: { start_time: string; end_time: string }[];
  selectedStart: number | null;
  selectedEnd: number | null;
  onSlotChange: (start: number, end: number) => void;
  pricingRules: {
    weekday_peak: number;
    weekday_off_peak: number;
    weekend_peak: number;
  };
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8h to 23h

function isOffPeak(dayOfWeek: number, hour: number): boolean {
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  return isWeekday && hour >= 8 && hour < 14;
}

export function TimeSlotPicker({
  selectedDate,
  bookedSlots,
  selectedStart,
  selectedEnd,
  onSlotChange,
  pricingRules,
}: TimeSlotPickerProps) {
  if (!selectedDate) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-surface p-6 text-center text-sm text-text-muted">
        Sélectionne une date pour voir les créneaux disponibles
      </div>
    );
  }

  const dateObj = new Date(selectedDate + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  function isBooked(hour: number): boolean {
    return bookedSlots.some((slot) => {
      const bookedStart = parseInt(slot.start_time.split(":")[0]);
      const bookedEnd = parseInt(slot.end_time.split(":")[0]);
      return hour >= bookedStart && hour < bookedEnd;
    });
  }

  function getRate(hour: number): number {
    if (dayOfWeek === 0 || dayOfWeek === 6) return pricingRules.weekend_peak;
    return isOffPeak(dayOfWeek, hour)
      ? pricingRules.weekday_off_peak
      : pricingRules.weekday_peak;
  }

  function handleSlotClick(hour: number) {
    if (isBooked(hour)) return;

    const hasSelection = selectedStart !== null && selectedEnd !== null;
    const isExtended = hasSelection && selectedEnd! - selectedStart! > 1;

    if (!hasSelection || isExtended) {
      // No selection yet, or already extended → start fresh (1h)
      onSlotChange(hour, hour + 1);
    } else {
      // Single-hour selection → extend range
      const newStart = Math.min(selectedStart!, hour);
      const newEnd = Math.max(selectedEnd!, hour + 1);

      // Check no booked slots in range
      let hasConflict = false;
      for (let h = newStart; h < newEnd; h++) {
        if (isBooked(h)) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        onSlotChange(newStart, newEnd);
      }
    }
  }

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
        Créneaux disponibles
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {HOURS.map((hour) => {
          const booked = isBooked(hour);
          const rate = getRate(hour);
          const offPeak = isOffPeak(dayOfWeek, hour);
          const isSelected =
            selectedStart !== null &&
            selectedEnd !== null &&
            hour >= selectedStart &&
            hour < selectedEnd;

          return (
            <button
              key={hour}
              type="button"
              disabled={booked}
              onClick={() => handleSlotClick(hour)}
              className={`
                flex flex-col items-center rounded-lg border px-3 py-2.5 text-sm transition-colors
                ${booked ? "cursor-not-allowed border-border-subtle bg-bg-elevated text-text-muted/40" : ""}
                ${isSelected ? "border-purple-500 bg-purple-500/20 text-white" : ""}
                ${!booked && !isSelected ? "border-border-subtle hover:border-purple-500/50 hover:bg-bg-hover" : ""}
              `}
            >
              <span className="font-medium">
                {String(hour).padStart(2, "0")}:00
              </span>
              {!booked && (
                <span
                  className={`mt-0.5 text-xs ${offPeak ? "text-success" : "text-text-muted"}`}
                >
                  {offPeak && (
                    <span className="mr-1 text-text-muted line-through">
                      {pricingRules.weekday_peak}€
                    </span>
                  )}
                  {rate}€/h
                </span>
              )}
              {booked && (
                <span className="mt-0.5 text-xs">Réservé</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

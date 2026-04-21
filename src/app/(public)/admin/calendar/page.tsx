"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";
import {
  getAdminCalendarData,
  blockSlot,
  unblockSlot,
  type CalendarStudio,
} from "@/actions/admin-calendar";
import { checkAdminAccess } from "@/actions/admin";
import { toast } from "@/components/ui/toaster";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8h-23h

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AdminCalendarPage() {
  const router = useRouter();
  const [data, setData] = useState<CalendarStudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const loadData = useCallback(async () => {
    const result = await getAdminCalendarData(selectedDate);
    if (!result.success) {
      router.push("/");
      return;
    }
    setData(result.data);
    setLoading(false);
  }, [selectedDate, router]);

  useEffect(() => {
    async function initAndLoad() {
      const access = await checkAdminAccess();
      if (!access.success || !access.data.isAdmin) {
        router.push("/");
        return;
      }
      loadData();
    }
    initAndLoad();
  }, [loadData, router]);

  function changeDate(days: number) {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(formatDate(d));
  }

  async function handleBlock(studioId: string, hour: number) {
    const startTime = `${String(hour).padStart(2, "0")}:00`;
    const endTime = `${String(hour + 1).padStart(2, "0")}:00`;
    const result = await blockSlot(studioId, selectedDate, startTime, endTime);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    toast({ title: "Créneau bloqué", variant: "success" });
    loadData();
  }

  async function handleUnblock(lockId: string) {
    const result = await unblockSlot(lockId);
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "error" });
      return;
    }
    toast({ title: "Créneau débloqué", variant: "success" });
    loadData();
  }

  const dateFormatted = new Date(selectedDate + "T00:00:00").toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-bg-surface" />
          <div className="h-96 rounded-lg bg-bg-surface" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24 md:px-8 md:pt-8">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <h1 className="font-display text-[30px] font-bold leading-tight">
        Calendrier Multi-Studio
      </h1>

      {/* Date navigation */}
      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => changeDate(-1)}
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-hover"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-display font-semibold capitalize">{dateFormatted}</p>
        <button
          type="button"
          onClick={() => changeDate(1)}
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-bg-hover"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Studio calendars */}
      <div className="mt-6 space-y-8">
        {data.map(({ studio, bookings, blockedSlots }) => (
          <div key={studio.id}>
            <p className="mb-3 font-display font-semibold">{studio.name}</p>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8 md:grid-cols-16">
              {HOURS.map((hour) => {
                const startStr = `${String(hour).padStart(2, "0")}:00`;

                // Check if booked
                const booking = bookings.find((b) => {
                  const bStart = parseInt(b.start_time.split(":")[0]);
                  const bEnd = parseInt(b.end_time.split(":")[0]);
                  return hour >= bStart && hour < bEnd;
                });

                // Check if admin-blocked
                const blocked = blockedSlots.find((l) => {
                  const lStart = parseInt(l.start_time.split(":")[0]);
                  const lEnd = parseInt(l.end_time.split(":")[0]);
                  return hour >= lStart && hour < lEnd;
                });

                if (booking) {
                  return (
                    <div
                      key={hour}
                      className="flex flex-col items-center rounded-lg bg-purple-500/20 px-2 py-2 text-xs"
                      title={`Réservé — ${booking.booking_status}`}
                    >
                      <span className="font-medium text-purple-400">
                        {startStr.slice(0, 5)}
                      </span>
                      <span className="text-[10px] text-purple-400">
                        Réservé
                      </span>
                    </div>
                  );
                }

                if (blocked) {
                  return (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleUnblock(blocked.id)}
                      className="flex flex-col items-center rounded-lg bg-error/20 px-2 py-2 text-xs transition-colors hover:bg-error/30"
                      title="Cliquer pour débloquer"
                    >
                      <span className="font-medium text-error">
                        {startStr.slice(0, 5)}
                      </span>
                      <Unlock className="mt-0.5 h-3 w-3 text-error" />
                    </button>
                  );
                }

                // Available — can block
                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleBlock(studio.id, hour)}
                    className="flex flex-col items-center rounded-lg border border-border-subtle px-2 py-2 text-xs transition-colors hover:border-error/50 hover:bg-error/5"
                    title="Cliquer pour bloquer"
                  >
                    <span className="font-medium text-text-muted">
                      {startStr.slice(0, 5)}
                    </span>
                    <Lock className="mt-0.5 h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-purple-500/20" />
          Réservé
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-error/20" />
          Bloqué (admin)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-border-subtle" />
          Disponible (cliquer pour bloquer)
        </div>
      </div>
    </div>
  );
}

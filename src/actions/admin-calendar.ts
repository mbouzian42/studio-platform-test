"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse, Booking, Studio } from "@/types";

interface AdminBooking {
  id: string;
  studio_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  booking_status: string;
  user_id: string;
}

interface AdminSlotLock {
  id: string;
  studio_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  user_id: string;
  locked_until: string;
}

export interface CalendarStudio {
  studio: Studio;
  bookings: AdminBooking[];
  blockedSlots: AdminSlotLock[];
}

/** Verify admin role */
async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  return { supabase, user, isAdmin: profile?.role === "admin" };
}

// Far-future date for admin-blocked slots (distinguished from payment locks)
const ADMIN_BLOCK_UNTIL = "2099-12-31T23:59:59Z";

export async function getAdminCalendarData(
  date: string,
): Promise<ActionResponse<CalendarStudio[]>> {
  const { supabase, isAdmin } = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  // Get all active studios
  const { data: studios } = await supabase
    .from("studios")
    .select("*")
    .eq("is_active", true)
    .order("name")
    .returns<Studio[]>();

  if (!studios) return { success: true, data: [] };

  const result: CalendarStudio[] = [];

  for (const studio of studios) {
    // Get bookings for this date
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, studio_id, booking_date, start_time, end_time, booking_status, user_id")
      .eq("studio_id", studio.id)
      .eq("booking_date", date)
      .in("booking_status", ["pending", "confirmed"])
      .returns<AdminBooking[]>();

    // Get admin-blocked slots (far-future locked_until = admin block)
    const { data: locks } = await supabase
      .from("slot_locks")
      .select("id, studio_id, booking_date, start_time, end_time, user_id, locked_until")
      .eq("studio_id", studio.id)
      .eq("booking_date", date)
      .gte("locked_until", ADMIN_BLOCK_UNTIL)
      .returns<AdminSlotLock[]>();

    result.push({
      studio,
      bookings: bookings ?? [],
      blockedSlots: locks ?? [],
    });
  }

  return { success: true, data: result };
}

export async function blockSlot(
  studioId: string,
  date: string,
  startTime: string,
  endTime: string,
): Promise<ActionResponse> {
  const { supabase, user, isAdmin } = await verifyAdmin();
  if (!isAdmin || !user) return { success: false, error: "Accès refusé" };

  const { error } = await supabase.from("slot_locks").insert({
    studio_id: studioId,
    booking_date: date,
    start_time: startTime,
    end_time: endTime,
    user_id: user.id,
    locked_until: ADMIN_BLOCK_UNTIL,
  });

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function unblockSlot(lockId: string): Promise<ActionResponse> {
  const { supabase, isAdmin } = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  const { error } = await supabase
    .from("slot_locks")
    .delete()
    .eq("id", lockId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

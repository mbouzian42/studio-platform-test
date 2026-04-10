"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/types";
import type { Studio, StudioPricing, Booking } from "@/types";
import { createBookingSchema, type CreateBookingInput } from "@/schemas/booking";
import { calculatePrice } from "@/lib/pricing";
import { createCheckoutSession } from "@/lib/stripe";

const MIN_DURATION_HOURS = 2;
const SLOT_LOCK_MINUTES = 10;

export async function getStudios(): Promise<ActionResponse<Studio[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studios")
    .select("*")
    .eq("is_active", true)
    .order("name")
    .returns<Studio[]>();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getStudioBySlug(
  slug: string,
): Promise<ActionResponse<Studio>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studios")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<Studio>();

  if (error || !data) return { success: false, error: "Studio introuvable" };
  return { success: true, data };
}

export async function getStudioPricing(
  studioId: string,
): Promise<ActionResponse<StudioPricing[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("studio_pricing")
    .select("*")
    .eq("studio_id", studioId)
    .returns<StudioPricing[]>();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getBookedSlots(
  studioId: string,
  date: string,
): Promise<ActionResponse<{ start_time: string; end_time: string }[]>> {
  const supabase = await createClient();

  // Get confirmed bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("start_time, end_time")
    .eq("studio_id", studioId)
    .eq("booking_date", date)
    .in("booking_status", ["pending", "confirmed"])
    .returns<{ start_time: string; end_time: string }[]>();

  if (bookingsError) return { success: false, error: bookingsError.message };

  // Get active slot locks (not expired)
  const now = new Date().toISOString();
  const { data: locks } = await supabase
    .from("slot_locks")
    .select("start_time, end_time")
    .eq("studio_id", studioId)
    .eq("booking_date", date)
    .gt("locked_until", now)
    .returns<{ start_time: string; end_time: string }[]>();

  // Combine bookings and active locks
  const combined = [...(bookings ?? []), ...(locks ?? [])];
  return { success: true, data: combined };
}

/** Lock a slot for the current user during payment (10 min TTL) */
async function lockSlot(
  studioId: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  userId: string,
): Promise<ActionResponse<{ lockId: string }>> {
  const supabase = await createClient();

  const lockedUntil = new Date(Date.now() + SLOT_LOCK_MINUTES * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("slot_locks")
    .insert({
      studio_id: studioId,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      user_id: userId,
      locked_until: lockedUntil,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    return { success: false, error: "Impossible de verrouiller le créneau" };
  }

  return { success: true, data: { lockId: data.id } };
}

/** Release a slot lock (on payment cancel or timeout) */
export async function releaseSlotLock(lockId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("slot_locks").delete().eq("id", lockId);
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<ActionResponse<{ booking: Booking; checkoutUrl: string }>> {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données invalides" };
  }

  const { studioId, bookingDate, startTime, endTime, paymentType } = parsed.data;
  const startHour = parseInt(startTime.split(":")[0]);
  const endHour = parseInt(endTime.split(":")[0]);

  if (endHour - startHour < MIN_DURATION_HOURS) {
    return { success: false, error: "La durée minimum est de 2 heures" };
  }

  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Connexion requise pour réserver" };
  }

  // Check availability (includes active locks)
  const bookedResult = await getBookedSlots(studioId, bookingDate);
  if (!bookedResult.success) return { success: false, error: bookedResult.error };

  for (const booked of bookedResult.data) {
    const bookedStart = parseInt(booked.start_time.split(":")[0]);
    const bookedEnd = parseInt(booked.end_time.split(":")[0]);
    if (startHour < bookedEnd && endHour > bookedStart) {
      return {
        success: false,
        error: "Ce créneau n'est plus disponible — veuillez en sélectionner un autre",
      };
    }
  }

  // Lock the slot for 10 minutes during payment
  const lockResult = await lockSlot(studioId, bookingDate, startTime, endTime, user.id);
  if (!lockResult.success) return { success: false, error: lockResult.error };

  // Get pricing
  const pricingResult = await getStudioPricing(studioId);
  if (!pricingResult.success) return { success: false, error: pricingResult.error };

  const { total } = calculatePrice(pricingResult.data, bookingDate, startHour, endHour);
  const durationHours = endHour - startHour;
  const hourlyRate = total / durationHours;
  const depositAmount = paymentType === "deposit" ? Math.ceil(total * 0.2) : null;
  const chargeAmount = depositAmount ?? total;

  // Auto-assign engineer (highest priority available)
  const { data: engineer } = await supabase
    .from("engineers")
    .select("id")
    .eq("is_available", true)
    .order("priority_order", { ascending: true })
    .limit(1)
    .single<{ id: string }>();

  // Create booking (pending payment)
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      studio_id: studioId,
      engineer_id: engineer?.id ?? null,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      duration_hours: durationHours,
      hourly_rate: hourlyRate,
      total_price: total,
      deposit_amount: depositAmount,
      booking_status: "pending" as const,
      payment_status: "pending" as const,
    })
    .select()
    .single<Booking>();

  if (error || !booking) {
    // Release lock on booking creation failure
    await releaseSlotLock(lockResult.data.lockId);
    return { success: false, error: error?.message ?? "Erreur lors de la réservation" };
  }

  // Create Stripe checkout session (mock for now)
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const session = await createCheckoutSession({
    amount: chargeAmount,
    description: `Réservation ${bookingDate} ${startTime}-${endTime}`,
    successUrl: `${origin}/booking/confirmation?booking_id=${booking.id}`,
    cancelUrl: `${origin}/booking`,
    metadata: {
      booking_id: booking.id,
      lock_id: lockResult.data.lockId,
      payment_type: paymentType,
    },
  });

  return {
    success: true,
    data: { booking, checkoutUrl: session.url },
  };
}

export async function getBookingById(
  bookingId: string,
): Promise<ActionResponse<Booking & { studio_name: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Non connecté" };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .single<Booking>();

  if (error || !booking) {
    return { success: false, error: "Réservation introuvable" };
  }

  // Get studio name
  const { data: studio } = await supabase
    .from("studios")
    .select("name")
    .eq("id", booking.studio_id)
    .single<{ name: string }>();

  return {
    success: true,
    data: { ...booking, studio_name: studio?.name ?? "Studio" },
  };
}

export async function getUserBookings(): Promise<
  ActionResponse<(Booking & { studio_name: string })[]>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Non connecté" };
  }

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("booking_date", { ascending: false })
    .returns<Booking[]>();

  if (error) return { success: false, error: error.message };

  // Fetch studio names for all bookings
  const studioIds = [...new Set((bookings ?? []).map((b) => b.studio_id))];
  const { data: studios } = await supabase
    .from("studios")
    .select("id, name")
    .in("id", studioIds.length > 0 ? studioIds : ["none"])
    .returns<{ id: string; name: string }[]>();

  const studioMap = new Map((studios ?? []).map((s) => [s.id, s.name]));

  const result = (bookings ?? []).map((b) => ({
    ...b,
    studio_name: studioMap.get(b.studio_id) ?? "Studio",
  }));

  return { success: true, data: result };
}

export async function cancelBooking(
  bookingId: string,
): Promise<ActionResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Non connecté" };
  }

  // Get the booking
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .single<Booking>();

  if (!booking) {
    return { success: false, error: "Réservation introuvable" };
  }

  if (booking.booking_status === "cancelled") {
    return { success: false, error: "Cette réservation est déjà annulée" };
  }

  // Update booking status
  const { error } = await supabase
    .from("bookings")
    .update({
      booking_status: "cancelled" as const,
      payment_status: "refunded" as const,
    })
    .eq("id", bookingId);

  if (error) {
    return { success: false, error: "Erreur lors de l'annulation" };
  }

  // Process refund via Stripe (mock)
  if (booking.stripe_payment_intent_id) {
    const { createRefund } = await import("@/lib/stripe");
    await createRefund({ paymentIntentId: booking.stripe_payment_intent_id });
  }

  // TODO: Send cancellation confirmation email via Resend

  return { success: true, data: undefined };
}

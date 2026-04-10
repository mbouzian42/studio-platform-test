"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/types";

export interface AdminKPIs {
  totalRevenue: number;
  bookingRevenue: number;
  beatRevenue: number;
  mixingRevenue: number;
  totalBookings: number;
  totalBeatSales: number;
  totalMixingOrders: number;
  confirmedBookings: number;
  pendingBookings: number;
}

export async function checkAdminAccess(): Promise<ActionResponse<{ isAdmin: boolean }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  if (!profile || profile.role !== "admin") {
    return { success: true, data: { isAdmin: false } };
  }

  return { success: true, data: { isAdmin: true } };
}

/** Admin or engineer — catalogue + upload in `/admin/beats`. */
export async function checkAdminBeatsSectionAccess(): Promise<
  ActionResponse<{ allowed: boolean }>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  const allowed =
    profile?.role === "admin" || profile?.role === "engineer";
  return { success: true, data: { allowed } };
}

export async function getAdminKPIs(): Promise<ActionResponse<AdminKPIs>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  if (!profile || profile.role !== "admin") {
    return { success: false, error: "Accès refusé" };
  }

  // Bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("total_price, booking_status")
    .returns<{ total_price: number; booking_status: string }[]>();

  const allBookings = bookings ?? [];
  const confirmedBookings = allBookings.filter(
    (b) => b.booking_status === "confirmed" || b.booking_status === "completed",
  );
  const pendingBookings = allBookings.filter(
    (b) => b.booking_status === "pending",
  );
  const bookingRevenue = confirmedBookings.reduce(
    (sum, b) => sum + b.total_price,
    0,
  );

  // Beat purchases
  const { data: beatPurchases } = await supabase
    .from("beat_purchases")
    .select("price_paid")
    .returns<{ price_paid: number }[]>();

  const beatRevenue = (beatPurchases ?? []).reduce(
    (sum, p) => sum + p.price_paid,
    0,
  );

  // Mixing orders
  const { data: mixingOrders } = await supabase
    .from("mixing_orders")
    .select("price, payment_status")
    .returns<{ price: number; payment_status: string }[]>();

  const paidMixing = (mixingOrders ?? []).filter(
    (m) => m.payment_status !== "pending",
  );
  const mixingRevenue = paidMixing.reduce((sum, m) => sum + m.price, 0);

  return {
    success: true,
    data: {
      totalRevenue: bookingRevenue + beatRevenue + mixingRevenue,
      bookingRevenue,
      beatRevenue,
      mixingRevenue,
      totalBookings: allBookings.length,
      totalBeatSales: (beatPurchases ?? []).length,
      totalMixingOrders: (mixingOrders ?? []).length,
      confirmedBookings: confirmedBookings.length,
      pendingBookings: pendingBookings.length,
    },
  };
}

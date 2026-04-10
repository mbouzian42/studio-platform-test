"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/types";

export interface HistoryItem {
  id: string;
  type: "booking" | "beat_purchase" | "mixing";
  title: string;
  date: string;
  status: string;
  amount: number;
  // Booking-specific
  studioName?: string;
  startTime?: string;
  endTime?: string;
  // Beat-specific
  licenseType?: string;
  beatSlug?: string;
  downloadUrl?: string | null;
  // Mixing-specific
  formula?: string;
  deliveredFileUrl?: string | null;
  mixingOrderId?: string;
}

export async function getUserHistory(): Promise<ActionResponse<HistoryItem[]>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  const items: HistoryItem[] = [];

  // Bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .returns<{
      id: string;
      studio_id: string;
      booking_date: string;
      start_time: string;
      end_time: string;
      total_price: number;
      booking_status: string;
      created_at: string;
    }[]>();

  // Get studio names
  const studioIds = [...new Set((bookings ?? []).map((b) => b.studio_id))];
  const { data: studios } = studioIds.length > 0
    ? await supabase
        .from("studios")
        .select("id, name")
        .in("id", studioIds)
        .returns<{ id: string; name: string }[]>()
    : { data: [] as { id: string; name: string }[] };

  const studioMap = new Map((studios ?? []).map((s) => [s.id, s.name]));

  for (const b of bookings ?? []) {
    items.push({
      id: b.id,
      type: "booking",
      title: `Session — ${studioMap.get(b.studio_id) ?? "Studio"}`,
      date: b.created_at,
      status: b.booking_status,
      amount: b.total_price,
      studioName: studioMap.get(b.studio_id),
      startTime: b.start_time,
      endTime: b.end_time,
    });
  }

  // Beat purchases
  const { data: purchases } = await supabase
    .from("beat_purchases")
    .select("*")
    .eq("user_id", user.id)
    .returns<{
      id: string;
      beat_id: string;
      license_type: string;
      price_paid: number;
      download_url: string | null;
      created_at: string;
    }[]>();

  const beatIds = [...new Set((purchases ?? []).map((p) => p.beat_id))];
  const { data: beats } = beatIds.length > 0
    ? await supabase
        .from("beats")
        .select("id, title, slug")
        .in("id", beatIds)
        .returns<{ id: string; title: string; slug: string }[]>()
    : { data: [] as { id: string; title: string; slug: string }[] };

  const beatMap = new Map((beats ?? []).map((b) => [b.id, b]));

  for (const p of purchases ?? []) {
    const beat = beatMap.get(p.beat_id);
    items.push({
      id: p.id,
      type: "beat_purchase",
      title: `Beat — ${beat?.title ?? "Beat"}`,
      date: p.created_at,
      status: "purchased",
      amount: p.price_paid,
      licenseType: p.license_type,
      beatSlug: beat?.slug,
      downloadUrl: p.download_url,
    });
  }

  // Mixing orders
  const { data: mixingOrders } = await supabase
    .from("mixing_orders")
    .select("*")
    .eq("user_id", user.id)
    .returns<{
      id: string;
      formula: string;
      mixing_status: string;
      price: number;
      delivered_file_url: string | null;
      created_at: string;
    }[]>();

  for (const m of mixingOrders ?? []) {
    items.push({
      id: m.id,
      type: "mixing",
      title: `Mixage — ${m.formula === "premium" ? "Premium" : "Standard"}`,
      date: m.created_at,
      status: m.mixing_status,
      amount: m.price,
      formula: m.formula,
      deliveredFileUrl: m.delivered_file_url,
      mixingOrderId: m.id,
    });
  }

  // Sort chronologically (newest first)
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { success: true, data: items };
}

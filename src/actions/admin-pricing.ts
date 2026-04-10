"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse, Studio, StudioPricing } from "@/types";

interface StudioWithPricing {
  studio: Studio;
  pricing: StudioPricing[];
}

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

export async function getAdminPricingData(): Promise<ActionResponse<StudioWithPricing[]>> {
  const { supabase, isAdmin } = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  const { data: studios } = await supabase
    .from("studios")
    .select("*")
    .eq("is_active", true)
    .order("name")
    .returns<Studio[]>();

  if (!studios) return { success: true, data: [] };

  const result: StudioWithPricing[] = [];

  for (const studio of studios) {
    const { data: pricing } = await supabase
      .from("studio_pricing")
      .select("*")
      .eq("studio_id", studio.id)
      .returns<StudioPricing[]>();

    result.push({ studio, pricing: pricing ?? [] });
  }

  return { success: true, data: result };
}

export async function updatePricingRule(
  pricingId: string,
  hourlyRate: number,
): Promise<ActionResponse> {
  const { supabase, isAdmin } = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  if (hourlyRate < 0) return { success: false, error: "Le tarif doit être positif" };

  const { error } = await supabase
    .from("studio_pricing")
    .update({ hourly_rate: hourlyRate })
    .eq("id", pricingId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function createPricingRule(
  studioId: string,
  dayCategory: "weekday" | "weekend",
  timeCategory: "peak" | "off_peak",
  hourlyRate: number,
): Promise<ActionResponse> {
  const { supabase, isAdmin } = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  const { error } = await supabase.from("studio_pricing").insert({
    studio_id: studioId,
    day_category: dayCategory,
    time_category: timeCategory,
    hourly_rate: hourlyRate,
  });

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse, MixingOrder, Engineer } from "@/types";

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

export async function getAdminMixingOrders(): Promise<ActionResponse<MixingOrder[]>> {
  const { supabase, isAdmin } = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  const { data, error } = await supabase
    .from("mixing_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<MixingOrder[]>();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function createManualMixOrder(input: {
  userId: string;
  formula: "standard" | "premium";
  brief: string;
  price: number;
}): Promise<ActionResponse<MixingOrder>> {
  const { supabase, user, isAdmin } = await verifyAdmin();
  if (!isAdmin || !user) return { success: false, error: "Accès refusé" };

  const { data: engineer } = await supabase
    .from("engineers")
    .select("id")
    .eq("is_available", true)
    .order("priority_order", { ascending: true })
    .limit(1)
    .single<{ id: string }>();

  const { data, error } = await supabase
    .from("mixing_orders")
    .insert({
      user_id: input.userId,
      created_by: user.id,
      formula: input.formula,
      brief: input.brief,
      price: input.price,
      mixing_status: "pending" as const,
      payment_status: "fully_paid" as const,
      max_revisions: 2,
      revision_count: 0,
      engineer_id: engineer?.id ?? null,
    })
    .select()
    .single<MixingOrder>();

  if (error || !data) return { success: false, error: error?.message ?? "Erreur" };
  return { success: true, data };
}

// ── Engineer management ──

export async function getAdminEngineers(): Promise<
  ActionResponse<(Engineer & { profile_name: string })[]>
> {
  const { supabase, isAdmin } = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  const { data: engineers, error } = await supabase
    .from("engineers")
    .select("*")
    .order("priority_order", { ascending: true })
    .returns<Engineer[]>();

  if (error) return { success: false, error: error.message };

  // Get profile names
  const profileIds = (engineers ?? []).map((e) => e.profile_id);
  const { data: profiles } = profileIds.length > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", profileIds)
        .returns<{ id: string; full_name: string }[]>()
    : { data: [] as { id: string; full_name: string }[] };

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return {
    success: true,
    data: (engineers ?? []).map((e) => ({
      ...e,
      profile_name: nameMap.get(e.profile_id) ?? "Ingénieur",
    })),
  };
}

export async function updateEngineerPriority(
  engineerId: string,
  priorityOrder: number,
): Promise<ActionResponse> {
  const { supabase, isAdmin } = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  const { error } = await supabase
    .from("engineers")
    .update({ priority_order: priorityOrder })
    .eq("id", engineerId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function toggleEngineerAvailability(
  engineerId: string,
  isAvailable: boolean,
): Promise<ActionResponse> {
  const { supabase, isAdmin } = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  const { error } = await supabase
    .from("engineers")
    .update({ is_available: isAvailable })
    .eq("id", engineerId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

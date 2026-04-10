"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse, Beat } from "@/types";

async function verifyAdminBeatsSection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, allowed: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  const allowed =
    profile?.role === "admin" || profile?.role === "engineer";
  return { supabase, allowed };
}

export interface AdminBeat extends Beat {
  sales_count: number;
}

export async function getAdminBeats(): Promise<ActionResponse<AdminBeat[]>> {
  const { supabase, allowed } = await verifyAdminBeatsSection();
  if (!allowed) return { success: false, error: "Accès refusé" };

  const { data: beats, error } = await supabase
    .from("beats")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Beat[]>();

  if (error) return { success: false, error: error.message };

  // Get sales counts
  const beatIds = (beats ?? []).map((b) => b.id);
  const { data: purchases } = beatIds.length > 0
    ? await supabase
        .from("beat_purchases")
        .select("beat_id")
        .in("beat_id", beatIds)
        .returns<{ beat_id: string }[]>()
    : { data: [] as { beat_id: string }[] };

  const salesMap = new Map<string, number>();
  for (const p of purchases ?? []) {
    salesMap.set(p.beat_id, (salesMap.get(p.beat_id) ?? 0) + 1);
  }

  const result: AdminBeat[] = (beats ?? []).map((b) => ({
    ...b,
    sales_count: salesMap.get(b.id) ?? 0,
  }));

  return { success: true, data: result };
}

export async function adminUpdateBeat(
  beatId: string,
  input: {
    title?: string;
    bpm?: number;
    key?: string;
    genre?: string;
    price_simple?: number;
    price_exclusive?: number | null;
    is_published?: boolean;
  },
): Promise<ActionResponse> {
  const { supabase, allowed } = await verifyAdminBeatsSection();
  if (!allowed) return { success: false, error: "Accès refusé" };

  const { error } = await supabase
    .from("beats")
    .update(input)
    .eq("id", beatId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function adminDeleteBeat(beatId: string): Promise<ActionResponse> {
  const { supabase, allowed } = await verifyAdminBeatsSection();
  if (!allowed) return { success: false, error: "Accès refusé" };

  // Unpublish instead of hard delete (preserves purchase history)
  const { error } = await supabase
    .from("beats")
    .update({ is_published: false })
    .eq("id", beatId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

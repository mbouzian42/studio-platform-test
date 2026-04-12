"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse, Beat } from "@/types";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  return { supabase, isAdmin: profile?.role === "admin" };
}

export interface AdminBeat extends Beat {
  sales_count: number;
}

export async function getAdminBeats(): Promise<ActionResponse<AdminBeat[]>> {
  const { supabase, isAdmin } = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Accès refusé" };

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
  const { supabase, isAdmin } = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  const { error } = await supabase
    .from("beats")
    .update(input)
    .eq("id", beatId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function adminDeleteBeat(beatId: string): Promise<ActionResponse> {
  const { supabase, isAdmin } = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Accès refusé" };

  // Get beat info for storage cleanup
  const { data: beat } = await supabase
    .from("beats")
    .select("beatmaker_id, audio_full_url, audio_preview_url, cover_image_url")
    .eq("id", beatId)
    .single<{
      beatmaker_id: string;
      audio_full_url: string | null;
      audio_preview_url: string | null;
      cover_image_url: string | null;
    }>();

  // Delete favorites referencing this beat
  await supabase.from("beat_favorites").delete().eq("beat_id", beatId);

  // Delete purchases referencing this beat
  await supabase.from("beat_purchases").delete().eq("beat_id", beatId);

  // Hard delete the beat record
  const { error } = await supabase.from("beats").delete().eq("id", beatId);
  if (error) return { success: false, error: error.message };

  // Clean up storage files
  if (beat) {
    const basePath = `${beat.beatmaker_id}/${beatId}`;
    try {
      const { data: previewFiles } = await supabase.storage
        .from("beat-previews")
        .list(basePath);
      if (previewFiles && previewFiles.length > 0) {
        await supabase.storage
          .from("beat-previews")
          .remove(previewFiles.map((f) => `${basePath}/${f.name}`));
      }

      const { data: fullFiles } = await supabase.storage
        .from("beat-files")
        .list(basePath);
      if (fullFiles && fullFiles.length > 0) {
        await supabase.storage
          .from("beat-files")
          .remove(fullFiles.map((f) => `${basePath}/${f.name}`));
      }
    } catch {
      // Storage cleanup is best-effort
    }
  }

  return { success: true, data: undefined };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResponse, Beat } from "@/types";

export async function toggleFavorite(beatId: string): Promise<ActionResponse<boolean>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Connexion requise" };

  // Check if already favorited
  const { data: existing } = await supabase
    .from("beat_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("beat_id", beatId)
    .maybeSingle();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from("beat_favorites")
      .delete()
      .eq("id", existing.id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: false }; // false means no longer favorited
  } else {
    // Add
    const { error } = await supabase
      .from("beat_favorites")
      .insert({ user_id: user.id, beat_id: beatId });

    if (error) return { success: false, error: error.message };

    // Increment like_count on beat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc("increment_like_count", { beat_id: beatId });

    return { success: true, data: true }; // true means now favorited
  }
}

export async function getFavorites(): Promise<ActionResponse<Beat[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Non connecté" };

  const { data, error } = await supabase
    .from("beat_favorites")
    .select("beat:beats(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };

  // @ts-ignore - Supabase join typing can be tricky with custom selects
  const beats = (data?.map(d => d.beat) || []).filter(Boolean) as Beat[];
  return { success: true, data: beats };
}

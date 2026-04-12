"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse, Beat } from "@/types";

export async function toggleFavorite(
    beatId: string,
): Promise<ActionResponse<{ favorited: boolean }>> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Connexion requise" };

    const { data: existing } = await supabase
        .from("beat_favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("beat_id", beatId)
        .maybeSingle();

    if (existing) {
        await supabase.from("beat_favorites").delete().eq("id", existing.id);
        return { success: true, data: { favorited: false } };
    }

    await supabase
        .from("beat_favorites")
        .insert({ user_id: user.id, beat_id: beatId });
    return { success: true, data: { favorited: true } };
}

export async function getFavorites(): Promise<ActionResponse<Beat[]>> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Connexion requise" };

    const { data, error } = await supabase
        .from("beat_favorites")
        .select("beat_id, beats(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };

    const beats = (data ?? [])
        .map((row) => (row as { beats: Beat }).beats)
        .filter(Boolean);
    return { success: true, data: beats };
}

export async function removeFavorite(beatId: string): Promise<ActionResponse> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Non connecté" };

    const { error } = await supabase
        .from("beat_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("beat_id", beatId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
}
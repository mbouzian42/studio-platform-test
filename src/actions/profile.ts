"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/types";
import type { Profile } from "@/types";
import { updateProfileSchema, type UpdateProfileInput } from "@/schemas/profile";

export async function getProfile(): Promise<ActionResponse<Profile & { email: string }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Non connecté" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (error || !data) {
    return { success: false, error: "Profil introuvable" };
  }

  return {
    success: true,
    data: { ...data, email: user.email ?? "" },
  };
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<ActionResponse<Profile>> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Données invalides";
    return { success: false, error: firstError };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Non connecté" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
    })
    .eq("id", user.id)
    .select()
    .single<Profile>();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Erreur lors de la mise à jour" };
  }

  return { success: true, data };
}

export async function deleteAccount(): Promise<ActionResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Non connecté" };
  }

  // Delete associated data (RLS ensures only own data)
  // Order matters: delete children before parent
  // TODO: Add back mixing_orders, bookings, etc. when those tables are created
  await supabase.from("beat_purchases").delete().eq("user_id", user.id);
  // @ts-ignore - beat_favorites exists in DB but we might need to delete it too
  await supabase.from("beat_favorites").delete().eq("user_id", user.id);
  await supabase.from("profiles").delete().eq("id", user.id);

  // TODO: Send confirmation email via Resend
  // TODO: Delete Supabase Auth user via admin API (requires service role key)
  // For now, sign out the user — admin API deletion needs service role key
  await supabase.auth.signOut();

  return { success: true, data: undefined };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse, Booking } from "@/types";

export async function checkEngineerAccess(): Promise<
  ActionResponse<{ isEngineer: boolean; engineerId: string | null }>
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

  if (!profile || (profile.role !== "engineer" && profile.role !== "admin")) {
    return { success: true, data: { isEngineer: false, engineerId: null } };
  }

  const { data: engineer } = await supabase
    .from("engineers")
    .select("id")
    .eq("profile_id", user.id)
    .single<{ id: string }>();

  return {
    success: true,
    data: { isEngineer: true, engineerId: engineer?.id ?? null },
  };
}

export async function getEngineerSessions(): Promise<
  ActionResponse<(Booking & { studio_name: string })[]>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  // Get engineer record
  const { data: engineer } = await supabase
    .from("engineers")
    .select("id")
    .eq("profile_id", user.id)
    .single<{ id: string }>();

  if (!engineer) return { success: false, error: "Profil ingénieur introuvable" };

  // Get bookings assigned to this engineer
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("engineer_id", engineer.id)
    .in("booking_status", ["pending", "confirmed"])
    .order("booking_date", { ascending: true })
    .returns<Booking[]>();

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

  return {
    success: true,
    data: (bookings ?? []).map((b) => ({
      ...b,
      studio_name: studioMap.get(b.studio_id) ?? "Studio",
    })),
  };
}

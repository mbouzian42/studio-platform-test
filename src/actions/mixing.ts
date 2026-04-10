"use server";

import { createClient } from "@/lib/supabase/server";
import { MIXING_STANDARD_PRICE, MIXING_PREMIUM_PRICE } from "@/config/site";
import type { ActionResponse } from "@/types";
import type { MixingOrder, MixingRevision } from "@/types";
import {
  mixingRequestSchema,
  revisionRequestSchema,
  type MixingRequestInput,
  type RevisionRequestInput,
} from "@/schemas/mixing";
import { createCheckoutSession } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";

const MAX_REVISIONS = 2;

export async function submitMixingRequest(
  input: MixingRequestInput,
): Promise<ActionResponse<{ order: MixingOrder; checkoutUrl: string }>> {
  const parsed = mixingRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données invalides" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Connexion requise" };
  }

  const price = parsed.data.formula === "premium" ? MIXING_PREMIUM_PRICE : MIXING_STANDARD_PRICE;

  // Auto-assign engineer (highest priority available)
  const { data: engineer } = await supabase
    .from("engineers")
    .select("id")
    .eq("is_available", true)
    .order("priority_order", { ascending: true })
    .limit(1)
    .single<{ id: string }>();

  const { data: order, error } = await supabase
    .from("mixing_orders")
    .insert({
      user_id: user.id,
      formula: parsed.data.formula,
      brief: parsed.data.brief,
      price,
      mixing_status: "pending" as const,
      payment_status: "pending" as const,
      max_revisions: MAX_REVISIONS,
      revision_count: 0,
      engineer_id: engineer?.id ?? null,
    })
    .select()
    .single<MixingOrder>();

  if (error || !order) {
    return { success: false, error: error?.message ?? "Erreur lors de la création" };
  }

  // Create Stripe checkout session (mock)
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const formulaLabel = parsed.data.formula === "premium" ? "Premium" : "Standard";
  const session = await createCheckoutSession({
    amount: price,
    description: `Mix ${formulaLabel}`,
    successUrl: `${origin}/mixing/confirmation?order_id=${order.id}`,
    cancelUrl: `${origin}/mixing/order`,
    metadata: { order_id: order.id, formula: parsed.data.formula },
  });

  // Send confirmation email (mock)
  await sendEmail({
    to: user.email ?? "",
    subject: `Commande de mixage confirmée — Mix ${formulaLabel}`,
    html: `<h1>Commande confirmée</h1><p>Formule : Mix ${formulaLabel}</p><p>Prix : ${price}€</p>`,
  });

  return { success: true, data: { order, checkoutUrl: session.url } };
}

export async function getUserMixingOrders(): Promise<ActionResponse<MixingOrder[]>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Connexion requise" };
  }

  const { data, error } = await supabase
    .from("mixing_orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<MixingOrder[]>();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getMixingOrder(
  orderId: string,
): Promise<ActionResponse<MixingOrder>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Connexion requise" };
  }

  const { data, error } = await supabase
    .from("mixing_orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single<MixingOrder>();

  if (error || !data) {
    return { success: false, error: "Commande introuvable" };
  }

  return { success: true, data };
}

export async function requestRevision(
  input: RevisionRequestInput,
): Promise<ActionResponse<MixingRevision>> {
  const parsed = revisionRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données invalides" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Connexion requise" };
  }

  // Get current order
  const { data: order } = await supabase
    .from("mixing_orders")
    .select("*")
    .eq("id", parsed.data.mixingOrderId)
    .eq("user_id", user.id)
    .single<MixingOrder>();

  if (!order) {
    return { success: false, error: "Commande introuvable" };
  }

  if (order.revision_count >= order.max_revisions) {
    return {
      success: false,
      error: `Nombre maximum de retouches atteint (${order.max_revisions})`,
    };
  }

  if (order.mixing_status !== "delivered") {
    return { success: false, error: "Le mix doit être livré avant de demander une retouche" };
  }

  // Create revision
  const { data: revision, error } = await supabase
    .from("mixing_revisions")
    .insert({
      mixing_order_id: parsed.data.mixingOrderId,
      revision_number: order.revision_count + 1,
      feedback: parsed.data.feedback,
      revision_status: "requested" as const,
    })
    .select()
    .single<MixingRevision>();

  if (error || !revision) {
    return { success: false, error: error?.message ?? "Erreur" };
  }

  // Update order status and revision count
  await supabase
    .from("mixing_orders")
    .update({
      mixing_status: "revision_requested" as const,
      revision_count: order.revision_count + 1,
    })
    .eq("id", parsed.data.mixingOrderId);

  return { success: true, data: revision };
}

// ── Engineer mixing workspace ──

export async function getEngineerMixingOrders(): Promise<ActionResponse<MixingOrder[]>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  // Get engineer record for this user
  const { data: engineer } = await supabase
    .from("engineers")
    .select("id")
    .eq("profile_id", user.id)
    .single<{ id: string }>();

  if (!engineer) return { success: false, error: "Profil ingénieur introuvable" };

  const { data, error } = await supabase
    .from("mixing_orders")
    .select("*")
    .eq("engineer_id", engineer.id)
    .order("created_at", { ascending: false })
    .returns<MixingOrder[]>();

  if (error) return { success: false, error: error.message };
  return { success: true, data: data ?? [] };
}

export async function getEngineerMixingOrder(
  orderId: string,
): Promise<ActionResponse<MixingOrder & { revisions: MixingRevision[] }>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  const { data: engineer } = await supabase
    .from("engineers")
    .select("id")
    .eq("profile_id", user.id)
    .single<{ id: string }>();

  if (!engineer) return { success: false, error: "Profil ingénieur introuvable" };

  const { data: order } = await supabase
    .from("mixing_orders")
    .select("*")
    .eq("id", orderId)
    .eq("engineer_id", engineer.id)
    .single<MixingOrder>();

  if (!order) return { success: false, error: "Commande introuvable" };

  const { data: revisions } = await supabase
    .from("mixing_revisions")
    .select("*")
    .eq("mixing_order_id", orderId)
    .order("revision_number", { ascending: true })
    .returns<MixingRevision[]>();

  return { success: true, data: { ...order, revisions: revisions ?? [] } };
}

export async function deliverMix(
  orderId: string,
  deliveredFileUrl: string,
): Promise<ActionResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non connecté" };

  const { error } = await supabase
    .from("mixing_orders")
    .update({
      mixing_status: "delivered" as const,
      delivered_file_url: deliveredFileUrl,
    })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  // Send notification email (mock)
  await sendEmail({
    to: "client@example.com",
    subject: "Votre mix est prêt !",
    html: "<h1>Mix livré</h1><p>Votre mix est disponible dans votre espace.</p>",
  });

  return { success: true, data: undefined };
}

export async function addMeetLink(
  orderId: string,
  meetLink: string,
): Promise<ActionResponse> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("mixing_orders")
    .update({ meet_link: meetLink })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function updateMixingStatus(
  orderId: string,
  status: "pending" | "in_progress" | "delivered",
): Promise<ActionResponse> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("mixing_orders")
    .update({ mixing_status: status })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  // Send status change email (mock)
  const statusLabels = { pending: "en attente", in_progress: "en cours", delivered: "livré" };
  await sendEmail({
    to: "client@example.com",
    subject: `Statut de votre mix : ${statusLabels[status]}`,
    html: `<h1>Mise à jour</h1><p>Votre mix est maintenant ${statusLabels[status]}.</p>`,
  });

  return { success: true, data: undefined };
}

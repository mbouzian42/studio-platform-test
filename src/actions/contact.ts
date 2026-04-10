"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/types";
import { contactFormSchema, type ContactFormInput } from "@/schemas/contact";

export async function submitContactForm(
  input: ContactFormInput,
): Promise<ActionResponse> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Données invalides";
    return { success: false, error: firstError };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (error) {
    return { success: false, error: "Erreur lors de l'envoi du message" };
  }

  // TODO: Send confirmation email to studio via Resend

  return { success: true, data: undefined };
}

import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  email: z.string().email("Email invalide"),
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
  subject: z.string().min(1, "Le sujet est requis").max(200),
  message: z.string().min(10, "Le message doit faire au moins 10 caractères").max(2000),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

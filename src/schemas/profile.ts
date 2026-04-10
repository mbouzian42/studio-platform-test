import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Le nom est requis").max(100),
  phone: z
    .string()
    .max(20)
    .regex(/^[0-9+\s()-]*$/, "Numéro de téléphone invalide")
    .nullable()
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

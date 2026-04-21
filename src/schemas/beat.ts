import { z } from "zod";

export const purchaseBeatSchema = z.object({
  beatId: z.string().uuid(),
  licenseType: z.enum(["simple", "exclusive"]),
});

export const uploadBeatSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100, "Le titre est trop long"),
  bpm: z.coerce
    .number({ invalid_type_error: "Le BPM doit être un nombre" })
    .int("Le BPM doit être un nombre entier")
    .min(20, "Le BPM doit être au moins de 20")
    .max(300, "Le BPM est trop élevé")
    .optional(),
  key: z.string().max(10, "La tonalité est trop longue").optional(),
  genre: z.string().max(50, "Le genre est trop long").optional(),
  tags: z.array(z.string()).max(10, "Maximum 10 tags").optional(),
  priceSimple: z.coerce
    .number({ invalid_type_error: "Le prix doit être un nombre" })
    .min(0, "Le prix ne peut pas être négatif")
    .optional(),
  priceExclusive: z.coerce
    .number({ invalid_type_error: "Le prix doit être un nombre" })
    .min(0, "Le prix ne peut pas être négatif")
    .optional()
    .nullable(),
  published: z.boolean().default(false),
});

export type PurchaseBeatInput = z.infer<typeof purchaseBeatSchema>;
export type UploadBeatInput = z.infer<typeof uploadBeatSchema>;

import { z } from "zod";

export const createBookingSchema = z.object({
  studioId: z.string().uuid(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:00$/),
  endTime: z.string().regex(/^\d{2}:00$/),
  paymentType: z.enum(["deposit", "full"]),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

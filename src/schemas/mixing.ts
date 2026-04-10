import { z } from "zod";

export const mixingRequestSchema = z.object({
  formula: z.enum(["standard", "premium"]),
  brief: z.string().min(10).max(2000),
});

export const revisionRequestSchema = z.object({
  mixingOrderId: z.string().uuid(),
  feedback: z.string().min(10).max(2000),
  requestVideoCall: z.boolean().optional(),
});

export type MixingRequestInput = z.infer<typeof mixingRequestSchema>;
export type RevisionRequestInput = z.infer<typeof revisionRequestSchema>;

import { z } from "zod";

export const supportTicketSchema = z.object({
  subject: z.string().min(3).max(160),
  message: z.string().min(3).max(4000),
});

export const supportMessageSchema = z.object({
  message: z.string().min(1).max(4000),
});

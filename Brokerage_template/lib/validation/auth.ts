import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  email: z.string().email().max(160),
  password: z.string().min(8).max(128),
  challengeId: z.string().min(1),
  challengeAnswer: z.number().int().min(0).max(100),
});

export const loginSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(1).max(128),
});

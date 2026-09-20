import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must not exceed 72 characters");

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: emailSchema,

  password: passwordSchema,

  role: z.enum(["PARENT", "TEACHER"]),

  schoolId: z
    .string()
    .trim()
    .min(1, "School ID is required")
    .max(100, "School ID must not exceed 100 characters"),
});

export const loginSchema = z.object({
  email: emailSchema,

  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Password must not exceed 72 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
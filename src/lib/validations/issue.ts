import { z } from "zod";

export const createIssueSchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters"),

  category: z.enum([
    "FURNITURE",
    "CLASSROOM",
    "TOILET_SANITATION",
    "ELECTRICAL",
    "SAFETY",
    "OTHER",
  ]),

  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location must not exceed 200 characters"),

  priority: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
  ]),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
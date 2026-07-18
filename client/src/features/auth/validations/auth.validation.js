import { z } from "zod";

export const loginSchema = z.object({
  tenantSlug: z
    .string()
    .trim()
    .min(3, "Workspace ID must be at least 3 characters")
    .max(50, "Workspace ID is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(4, "Name must be at least 4 characters"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role_id: z.number(),
});

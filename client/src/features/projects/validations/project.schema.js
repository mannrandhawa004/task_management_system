import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  department_id: z.union([z.string(), z.number(), z.null()]).optional(),
  departmentId: z.union([z.string(), z.number(), z.null()]).optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name cannot exceed 100 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  status: z.enum(["active", "completed", "archived"]).optional(),

  department_id: z.union([z.string(), z.number(), z.null()]).optional(),
  departmentId: z.union([z.string(), z.number(), z.null()]).optional(),
});

export const addProjectMemberSchema = z.object({
  userId: z.number({
    required_error: "User ID required",
  }),

  roleId: z.enum(["2", "3"]),
});

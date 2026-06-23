import { z } from "zod";

export const createTaskSchema = z.object({

    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(120, "Title too long"),

    description: z
        .string()
        .max(1000)
        .optional(),

    priority: z.enum([
        "low",
        "medium",
        "high",
    ]),

    due_date: z
        .string()
        .optional()
        .refine(
            (date) =>
                !date ||
                !isNaN(
                    new Date(date).getTime()
                ),
            {
                message:
                    "Invalid due date",
            }
        ),
});
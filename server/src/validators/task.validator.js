import { body } from "express-validator";

export const createTaskValidator = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").optional().trim(),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority"),

  body("due_date").optional().isISO8601().withMessage("Invalid due date"),
];

export const updateTaskValidator = [
  body("title").optional().trim().notEmpty(),
  body("description").optional().trim(),
  body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
  body("status").optional().isIn(["todo", "in_progress", "completed"]),
  body("due_date").optional().isISO8601(),
];

export const updateTaskStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["todo", "in_progress", "completed"])
    .withMessage("Invalid status"),
];

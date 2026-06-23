import { body } from "express-validator";

export const createProjectValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
];

export const updateProjectValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("status")
    .optional()
    .isIn(["active", "completed", "inactive"])
    .withMessage("Invalid project status"),
];

export const addProjectMemberValidator = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isInt()
    .withMessage("User ID must be integer"),

  body("roleId")
    .notEmpty()
    .withMessage("role_id is required")
    .isIn(["2", "3"])
    .withMessage("Invalid role"),
];

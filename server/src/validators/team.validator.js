import { body } from "express-validator";

export const createTeamValidator = [
  body("department_id")
    .notEmpty()
    .withMessage("Department ID is required")
    .isInt()
    .withMessage("Department ID must be an integer"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Team name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Team name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("lead_id")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Lead ID must be an integer"),
];

export const updateTeamValidator = [
  body("department_id")
    .optional()
    .isInt()
    .withMessage("Department ID must be an integer"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Team name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("lead_id")
    .optional({ nullable: true })
    .isInt()
    .withMessage("Lead ID must be an integer"),
];

export const addTeamMemberValidator = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isInt()
    .withMessage("User ID must be an integer"),
];

export const assignTeamToProjectValidator = [
  body("projectId")
    .notEmpty()
    .withMessage("Project ID is required")
    .isInt()
    .withMessage("Project ID must be an integer"),

  body("teamId")
    .notEmpty()
    .withMessage("Team ID is required")
    .isInt()
    .withMessage("Team ID must be an integer"),
];

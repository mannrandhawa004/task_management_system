import { body } from "express-validator";

export const createUserValidator = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 8 })
    .withMessage("Phone number must be at least 8 characters"),

  body("employeeId")
    .trim()
    .notEmpty()
    .withMessage("Employee ID is required"),

  body("departmentId")
    .trim()
    .notEmpty()
    .withMessage("Department ID is required")
    .isNumeric()
    .withMessage("Department ID must be an integer"),

  body("roleId")
    .trim()
    .notEmpty()
    .withMessage("Role ID is required")
    .isNumeric()
    .withMessage("Role ID must be an integer"),

  body("teamId")
    .optional({ checkFalsy: true })
    .trim()
    .isNumeric()
    .withMessage("Team ID must be an integer"),

  body("managerId")
    .optional({ checkFalsy: true })
    .trim()
    .isNumeric()
    .withMessage("Manager ID must be an integer"),

  body("dob")
    .optional({ checkFalsy: true })
    .trim()
    .isISO8601()
    .withMessage("Date of birth must be a valid date"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const updateUserValidator = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 8 })
    .withMessage("Phone number must be at least 8 characters"),

  body("employeeId")
    .trim()
    .notEmpty()
    .withMessage("Employee ID is required"),

  body("departmentId")
    .trim()
    .notEmpty()
    .withMessage("Department ID is required")
    .isNumeric()
    .withMessage("Department ID must be an integer"),

  body("roleId")
    .trim()
    .notEmpty()
    .withMessage("Role ID is required")
    .isNumeric()
    .withMessage("Role ID must be an integer"),

  body("teamId")
    .optional({ checkFalsy: true })
    .trim()
    .isNumeric()
    .withMessage("Team ID must be an integer"),

  body("managerId")
    .optional({ checkFalsy: true })
    .trim()
    .isNumeric()
    .withMessage("Manager ID must be an integer"),

  body("dob")
    .optional({ checkFalsy: true })
    .trim()
    .isISO8601()
    .withMessage("Date of birth must be a valid date"),

  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["active", "inactive", "suspended"])
    .withMessage("Invalid status option"),
];

import { body } from "express-validator";

export const registerValidator = [
  body("name")
    .trim()
    .isLength({ min: 3})
    .withMessage("name must be at least 3 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid Email Format"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),

  body("role_id").trim().isNumeric().withMessage("role_id must be integer")
    .optional(),

  body("department_id").trim().isNumeric().withMessage("department_id must be integer")
    .optional(),
];

export const loginValidator = [
  body("tenantSlug").custom((value, { req }) => {
    const tenantSlug = String(value || req.headers["x-tenant-slug"] || "")
      .trim()
      .toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tenantSlug) || tenantSlug.length > 50) {
      throw new Error("Enter a valid workspace ID");
    }
    req.body.tenantSlug = tenantSlug;
    return true;
  }),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password").notEmpty().withMessage("Password is required"),
];

export const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

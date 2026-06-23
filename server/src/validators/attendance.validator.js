import { body } from "express-validator";

export const checkInValidator = [
  body("status")
    .optional()
    .isIn(["present", "late", "half_day", "remote", "on_leave"])
    .withMessage("Invalid status value. Must be present, late, half_day, remote or on_leave"),
];

export const updateAttendanceValidator = [
  body("status")
    .optional()
    .isIn(["present", "late", "half_day", "absent", "remote", "on_leave"])
    .withMessage("Invalid status value"),

  body("working_hours")
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage("Working hours must be a number between 0 and 24"),
];

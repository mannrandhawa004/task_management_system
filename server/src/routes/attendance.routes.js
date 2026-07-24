import { Router } from "express";
import AttendanceController from "../controllers/attendance.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validate } from "../middlewares/validate.js";
import {
  checkInValidator,
  updateAttendanceValidator,
} from "../validators/attendance.validator.js";
import { invalidateCacheAfter } from "../middlewares/cache.middleware.js";

const router = Router();

router.use(authMiddleware);

// Employee Check-In and Check-Out
router.post(
  "/check-in",
  checkInValidator,
  validate,
  invalidateCacheAfter(["attendance", "dashboard"]),
  AttendanceController.checkIn
);

router.post(
  "/check-out",
  invalidateCacheAfter(["attendance", "dashboard"]),
  AttendanceController.checkOut
);

router.post(
  "/start-break",
  invalidateCacheAfter(["attendance", "dashboard"]),
  AttendanceController.startBreak
);

router.post(
  "/end-break",
  invalidateCacheAfter(["attendance", "dashboard"]),
  AttendanceController.endBreak
);

router.get(
  "/today-status",
  AttendanceController.getTodayStatus
);

router.get(
  "/my-history",
  AttendanceController.getMyHistory
);

// Admin / Department Head views
router.get(
  "/daily-logs",
  authorizeRoles("super_admin", "admin", "dept_head"),
  AttendanceController.getDailyLogs
);

router.get(
  "/monthly-summary",
  authorizeRoles("super_admin", "admin", "dept_head"),
  AttendanceController.getMonthlySummary
);

// Admin manual corrections
router.patch(
  "/:id",
  authorizeRoles("super_admin", "admin"),
  updateAttendanceValidator,
  validate,
  invalidateCacheAfter(["attendance", "dashboard"]),
  AttendanceController.updateAttendance
);

export default router;

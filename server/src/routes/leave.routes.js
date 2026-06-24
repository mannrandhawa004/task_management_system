import { Router } from "express";
import LeaveController from "../controllers/leave.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.use(authMiddleware);

// Employee routes
router.post("/apply", LeaveController.applyLeave);
router.get("/my", LeaveController.getMyLeaves);
router.get("/colleagues", LeaveController.getColleaguesOnLeave);

// Management routes
router.get("/manage", authorizeRoles("super_admin", "admin", "hr", "dept_head"), LeaveController.getManageLeaves);
router.patch("/:id/status", authorizeRoles("super_admin", "admin", "hr", "dept_head"), LeaveController.updateStatus);

export default router;

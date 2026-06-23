import { Router } from "express";
import AuditController from "../controllers/audit.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

// View audit logs - all users can view, but filtering is done based on role
router.get(
  "/",
  authMiddleware,
  authorizeRoles("super_admin"),
  AuditController.getAllLogs,
);

router.get(
  "/project/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  AuditController.getProjectLogs,
);


router.get(
  "/tasks/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  AuditController.getTaskLogs,
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("super_admin"),
  AuditController.getLogById,
);

export default router;

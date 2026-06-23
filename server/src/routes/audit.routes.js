import { Router } from "express";
import AuditController from "../controllers/audit.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// View audit logs - all users can view, but filtering is done based on role
router.get(
  "/",
  authMiddleware,
  AuditController.getAllLogs,
);

router.get(
  "/project/:id",
  authMiddleware,
  AuditController.getProjectLogs,
);


router.get(
  "/tasks/:id",
  authMiddleware,
  AuditController.getTaskLogs,
);

router.get(
  "/:id",
  authMiddleware,
  AuditController.getLogById,
);

export default router;

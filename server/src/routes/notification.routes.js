import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import NotificationController from "../controllers/notification.controller.js";

const router = Router();

router.get("/", authMiddleware, NotificationController.getMyNotifications);
router.patch("/:id/read", authMiddleware, NotificationController.markAsRead);
router.patch("/read-all", authMiddleware, NotificationController.markAllAsRead);

export default router;

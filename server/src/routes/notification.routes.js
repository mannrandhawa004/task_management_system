import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import NotificationController from "../controllers/notification.controller.js";

const router = Router();

router.get("/", authMiddleware, NotificationController.getMyNotifications);
router.patch("/read-all", authMiddleware, NotificationController.markAllAsRead);
router.patch("/:id/read", authMiddleware, NotificationController.markAsRead);
router.delete("/clear-all", authMiddleware, NotificationController.clearAllNotifications);
router.delete("/:id", authMiddleware, NotificationController.deleteNotification);

export default router;

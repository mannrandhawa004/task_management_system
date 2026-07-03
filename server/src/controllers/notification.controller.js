import { asyncHandler } from "../utils/asyncHandler.js";
import NotificationService from "../services/notification.service.js";
import AuditService from "../services/audit.service.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import { successResponse } from "../utils/response.js";

class NotificationController {
  getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await NotificationService.getMyNotifications(
      req.user.id,
    );
    return successResponse(res, "Notifications fetched", notifications, 200);
  });

  markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notificationId = id;

    await NotificationService.markAsRead(notificationId, req.user.id);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.MARK_NOTIFICATION_READ,
        entity_type: "notification",
        entity_id: notificationId,
        ip_address: req.clientIp,
        details: {
          notification_id: notificationId,
          user_id: req.user.id,
          summary: "Notification marked as read",
        },
      });
    } catch (error) {
      console.error("Audit log failed for mark notification as read:", error.message);
    }

    return successResponse(res, "Notification marked as read", null, 200);
  });

  markAllAsRead = asyncHandler(async (req, res) => {
    await NotificationService.markAllAsRead(req.user.id);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.MARK_ALL_NOTIFICATIONS_READ,
        entity_type: "user",
        entity_id: req.user.id,
        ip_address: req.clientIp,
        details: {
          user_id: req.user.id,
          summary: "All notifications marked as read",
        },
      });
    } catch (error) {
      console.error("Audit log failed for mark all notifications as read:", error.message);
    }

    return successResponse(res, "All notifications marked as read", null, 200);
  });

  deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await NotificationService.deleteNotification(id, req.user.id);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.DELETE_NOTIFICATION,
        entity_type: "notification",
        entity_id: id,
        ip_address: req.clientIp,
        details: {
          notification_id: id,
          user_id: req.user.id,
          summary: "Notification deleted",
        },
      });
    } catch (error) {
      console.error("Audit log failed for delete notification:", error.message);
    }

    return successResponse(res, "Notification deleted", null, 200);
  });

  clearAllNotifications = asyncHandler(async (req, res) => {
    await NotificationService.clearAllNotifications(req.user.id);

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.CLEAR_ALL_NOTIFICATIONS,
        entity_type: "user",
        entity_id: req.user.id,
        ip_address: req.clientIp,
        details: {
          user_id: req.user.id,
          summary: "All notifications cleared",
        },
      });
    } catch (error) {
      console.error("Audit log failed for clear all notifications:", error.message);
    }

    return successResponse(res, "All notifications cleared", null, 200);
  });
}

export default new NotificationController();

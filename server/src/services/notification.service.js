import NotificationModel from "../models/notification.model.js";
import { getSocketIO } from "../socket/socket.js";
import { getUserSocket } from "../socket/socket.js";

class NotificationService {
  async send({ userIds, title, message, type, entity_type, entity_id, includeAdmins = true }) {
    // Get unique user IDs and optionally include admins
    let recipientIds = Array.from(new Set(userIds.filter(Boolean)));

    // Always include admins to ensure they get all important notifications
    if (includeAdmins) {
      try {
        const adminIds = await NotificationModel.getAllAdminIds();
        recipientIds = Array.from(new Set([...recipientIds, ...adminIds]));
      } catch (error) {
        console.error("Failed to get admin IDs:", error.message);
        // Continue with existing recipients if admin fetch fails
      }
    }

    const notifications = [];

    for (const userId of recipientIds) {
      const notification = await NotificationModel.createNotification({
        user_id: userId,
        title,
        message,
        type,
        entity_type,
        entity_id,
      });

      notifications.push(notification);

      const socketId = getUserSocket(userId);
      const io = getSocketIO();

      if (socketId && io) {
        io.to(socketId).emit("notification", {
          id: notification.id,
          title,
          message,
          type,
          entity_type,
          entity_id,
          is_read: 0,
          created_at: new Date().toISOString(),
        });
      }
    }

    return notifications;
  }

  async getMyNotifications(userId) {
    return await NotificationModel.getUserNotifications(userId);
  }

  async markAsRead(notificationId, userId) {
    return await NotificationModel.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId) {
    return await NotificationModel.markAllAsRead(userId);
  }
}

export default new NotificationService();

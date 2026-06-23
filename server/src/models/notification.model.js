import { executeQuery } from "../utils/dbQuery.js";

class NotificationModel {
  async createNotification({
    user_id,
    title,
    message,
    type,
    entity_type,
    entity_id,
  }) {
    
    const query = `
      INSERT INTO notifications (
        user_id,
        title,
        message,
        type,
        entity_type,
        entity_id
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [
      user_id,
      title,
      message,
      type,
      entity_type,
      entity_id,
    ]);

    return {
      id: result.insertId,
      user_id,
      title,
      message,
      type,
      entity_type,
      entity_id,
    };
  }

  async getUserNotifications(userId) {
    const query = `
      SELECT
        n.*,
        t.id AS task_id,
        t.title AS task_title,
        COALESCE(task_project.id, project_entity.id) AS project_id,
        COALESCE(task_project.name, project_entity.name) AS project_name
      FROM notifications n
      LEFT JOIN tasks t
        ON n.entity_type = 'task'
        AND t.id = n.entity_id
      LEFT JOIN projects task_project
        ON task_project.id = t.project_id
      LEFT JOIN projects project_entity
        ON n.entity_type = 'project'
        AND project_entity.id = n.entity_id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
    `;

    const notifications = await executeQuery(query, [userId]);

    return notifications.map((notification) => ({
      ...notification,
      task: notification.task_id
        ? {
          id: notification.task_id,
          title: notification.task_title,
        }
        : null,
      project: notification.project_id
        ? {
          id: notification.project_id,
          name: notification.project_name,
        }
        : null,
    }));
  }

  async markAsRead(notificationId, userId) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ?
      AND user_id = ?
    `;

    return await executeQuery(query, [notificationId, userId]);
  }

  async markAllAsRead(userId) {
    const query = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ?
    `;

    return await executeQuery(query, [userId]);
  }

  async getAllAdminIds() {
    const query = `
      SELECT id FROM users WHERE role_id = '1'
    `;
    const result = await executeQuery(query, []);
    return result.map(row => row.id);
  }
}

export default new NotificationModel();

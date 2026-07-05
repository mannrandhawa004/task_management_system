import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import TaskService from "../services/task.service.js";
import AuditService from "../services/audit.service.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";
import ProjectModel from "../models/project.model.js";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes.js";
import NotificationService from "../services/notification.service.js"
import { getSocketIO } from "../socket/socket.js";

const buildChanges = (before, after, fields) => {
  return fields.reduce((changes, field) => {
    const beforeValue = before?.[field] ?? null;
    const afterValue = after?.[field] ?? null;

    if (String(beforeValue) !== String(afterValue)) {
      changes[field] = {
        from: beforeValue,
        to: afterValue,
      };
    }

    return changes;
  }, {});
};

class TaskController {
  createTask = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title, description, priority, due_date } =
      req.body;

    const created_by = req.user.id;
    const task = await TaskService.createTask({
      projectId,
      title,
      description,
      created_by,
      priority,
      due_date,
    });


    const projectMembers = await ProjectModel.getProjectMembersIds(projectId);
    const memberIds = projectMembers.map((member) => member.user_id);

    try {
      await NotificationService.send({
        userIds: memberIds,
        title: "New Task Created",
        message: `New task "${title}" created in project`,
        type: NOTIFICATION_TYPES.TASK_CREATED,
        entity_type: "task",
        entity_id: task.id,
      });
    } catch (error) {
      console.error("Notification failed for create task:", error.message);
    }

    try {
      await AuditService.log({
        user_id: created_by,
        action: AUDIT_ACTIONS.CREATE_TASK,
        entity_type: "task",
        entity_id: task.id,
        ip_address: req.clientIp,
        details: {
          task_id: task.id,
          task_title: task.title,
          project_id: task.project?.id || Number(projectId),
          project_name: task.project?.name,
          assigned_to: task.assigned_users,
          summary: `Task "${task.title}" created in project "${task.project?.name || "Unknown Project"}"`,
        },
      });
    } catch (error) {
      console.error("Audit log failed for createTask:", error.message);
    }

    return successResponse(res, "Task created successfully", task, 201);
  });

  getProjectAllTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const allTasks = await TaskService.getProjectAllTasks(projectId, req.query);
    return successResponse(
      res,
      "All tasks of a project fetched",
      allTasks,
      200,
    );
  });

  getTaskDeatils = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const taskDetails = await TaskService.getTaskDeatils(taskId);
    return successResponse(
      res,
      "Task Details Fetched successfully",
      taskDetails,
      200,
    );
  });

  updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const updated_by = req.user.id;

    const { title, description, status, priority, due_date } = req.body;
    const existingTask = await TaskService.getTaskDeatils(taskId);

    const updatedTask = await TaskService.updateTask({
      taskId,
      title,
      description,
      status,
      priority,
      due_date,
    });

    const requestedFields = Object.entries({
      title,
      description,
      status,
      priority,
      due_date,
    })
      .filter(([, value]) => value !== undefined)
      .map(([field]) => field);

    const changes = buildChanges(existingTask, updatedTask, requestedFields);
    const changedFields = Object.keys(changes);

    try {
      await NotificationService.send({
        userIds: updatedTask.assigned_users.map((user) => user.id),
        title: "Task Updated",
        message: `Task "${updatedTask?.title || updatedTask?.description}" was updated`,
        type: NOTIFICATION_TYPES.TASK_UPDATED,
        entity_type: "task",
        entity_id: updatedTask.id,
      });
    } catch (error) {
      console.error("Notification failed for task update:", error.message);
    }

    try {
      await AuditService.log({
        user_id: updated_by,
        action: AUDIT_ACTIONS.UPDATE_TASK,
        entity_type: "task",
        entity_id: taskId,
        ip_address: req.clientIp,
        details: {
          task_id: updatedTask.id,
          task_title: updatedTask.title,
          project_id: updatedTask.project?.id,
          project_name: updatedTask.project?.name,
          summary: changedFields.length
            ? `Task "${updatedTask.title}" updated in project "${updatedTask.project?.name || "Unknown Project"}": ${changedFields.join(", ")}`
            : `Task "${updatedTask.title}" update requested, but no values changed`,
          changed_fields: changedFields,
          changes,
        },
      });
    } catch (error) {
      console.error("Audit log failed for updateTask:", error.message);
    }

    return successResponse(res, "Task updated successfully", updatedTask, 200);
  });

  deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const normalizedTaskId = Number(taskId);
    const deleted_by = req.user.id;
    const existingTask = await TaskService.getTaskDeatils(taskId);
    const projectId = existingTask?.project?.id || null

    await TaskService.deleteTask(taskId);

    try {
      await AuditService.log({
        user_id: deleted_by,
        action: AUDIT_ACTIONS.DELETE_TASK,
        entity_type: "task",
        ip_address: req.clientIp,
        entity_id: normalizedTaskId,
        details: {
          task_id: existingTask.id,
          task_title: existingTask.title,
          project_id: projectId,
          project_name: existingTask.project?.name,
          id: existingTask.id,
          title: existingTask.title,
          description: existingTask.description,
          status: existingTask.status,
          priority: existingTask.priority,
          due_date: existingTask.due_date,
          summary: `Task "${existingTask.title}" was deleted from project "${existingTask.project?.name || "Unknown Project"}"`,
        },
      });
    } catch (error) {
      console.error("Audit log failed for deleteTask:", error.message);
    }

    // Inside your backend deleteTask controller
    try {
      const io = getSocketIO();

      if (io) {
        io.emit("task_deleted", { taskId: normalizedTaskId, projectId });
        io.emit("project_activity_updated", { project_id: projectId });

        console.log(`Successfully emitted task_deleted for ID: ${taskId}`);
      }
    } catch (socketError) {
      console.error("Socket emit failed for deleteTask:", socketError.message);
    }

    return successResponse(res, "Task deleted successfully", null, 200);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { status } = req.body;

    const existingTask = await TaskService.getTaskDeatils(taskId);
    const updatedTask = await TaskService.updateStatus(taskId, status, req.user);

    const notifyUsers = [
      updatedTask.created_by.id,
      ...updatedTask.assigned_users.filter(Boolean).map((user) => user.id),
    ];

    try {
      await NotificationService.send({
        userIds: notifyUsers,
        title: "Task Status Updated",
        message: `Task "${updatedTask.title}" marked as ${status}`,
        type: "TASK_STATUS_UPDATED",
        entity_type: "task",
        entity_id: updatedTask.id,
      });
    } catch (error) {
      console.error(
        "Notification failed for update task staus:",
        error.message,
      );
    }

    try {
      await AuditService.log({
        user_id: req.user.id,
        action: AUDIT_ACTIONS.UPDATE_TASK_STATUS,
        entity_type: "task",
        entity_id: updatedTask.id,
        ip_address: req.clientIp,
        details: {
          task_id: updatedTask.id,
          task_title: updatedTask.title,
          project_id: updatedTask.project?.id,
          project_name: updatedTask.project?.name,
          summary: `Task "${updatedTask.title}" moved from "${existingTask.status}" to "${status}" in project "${updatedTask.project?.name || "Unknown Project"}"`,
          changed_fields: ["status"],
          changes: {
            status: {
              from: existingTask.status,
              to: status,
            },
          },
          old_status: existingTask.status,
          new_status: status,
        },
      });
    } catch (err) {
      console.error("Audit log failed:", err.message);
    }

    return successResponse(
      res,
      "Task status updated successfully",
      updatedTask,
      200,
    );
  });

  getMyTasks = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const tasks = await TaskService.getMyTasks(req.query, userId);
    return successResponse(res, "Tasks fetched successfully", tasks, 200);
  });

  assignTask = asyncHandler(async (req, res) => {
    const taskId = req.params.taskId;
    const userIds = req.body;

    const result = await TaskService.assignTask({ taskId, userIds });

    try {
      const taskDetails = await TaskService.getTaskDeatils(taskId);
      await AuditService.log({
        user_id: req.user.id,
        action: "ASSIGN_TASK_MEMBERS",
        entity_type: "task",
        entity_id: taskId,
        ip_address: req.clientIp,
        details: {
          task_id: taskId,
          task_title: taskDetails.title,
          project_id: taskDetails.project?.id,
          project_name: taskDetails.project?.name,
          assigned_user_ids: userIds,
          summary: `Task "${taskDetails.title}" assigned to ${Array.isArray(userIds) ? userIds.length : 1} member(s)`,
        },
      });
    } catch (error) {
      console.error("Audit log failed for assign task:", error.message);
    }

    return successResponse(res, "Member assigned sucessfully", result, 201);
  });

  getAllTasks = asyncHandler(async (req, res) => {
    const allTasks = await TaskService.getAllTasks(req.query);
    return successResponse(res, "All tasks fetched successfully", allTasks, 200);
  });
}

export default new TaskController();

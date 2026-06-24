import ProjectModel from "../models/project.model.js";
import TaskModel from "../models/task.model.js";

import { ForbiddenError } from "../utils/errorHandler.js";

export const projectAccessMiddleware = async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  if (req.user.role === "super_admin" || "admin") {
    return next();
  }
  const member = await ProjectModel.getProjectMember(projectId, userId);
  if (!member || !member.isMember) {
    throw new ForbiddenError("Access denied to this project");
  }

  next();
};

export const taskAssigneeMiddleware = async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  if (req.user.role === "super_admin" || "admin") {
    return next();
  }

  const isAssignedMember = await TaskModel.getAssignedMember(taskId, userId);
  if (!isAssignedMember || !isAssignedMember.isAssigned) {
    throw new ForbiddenError("Access denied to this project");
  }
  next();
};

export const taskAccessMiddleware = async (req, res, next) => {
  const { taskId } = req.params;
  if (req.user.role === "super_admin" || "admin") {
    return next();
  }
  const task = await TaskModel.getTaskProject(taskId);
  if (!task) {
    throw new NotFoundError("Task not found");
  }

  const member = await ProjectModel.getProjectMember(
    task.project_id,
    req.user.id,
  );

  if (!member || !member.isMember) {
    throw new ForbiddenError("Access denied to this task");
  }

  next();
};

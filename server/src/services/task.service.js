import ProjectModel from "../models/project.model.js";
import { BadRequestError, NotFoundError } from "../utils/errorHandler.js";
import TaskModel from "../models/task.model.js";
import { pool } from "../config/db.js";
import { formatPagination, getPagination } from "../utils/pagination.js";
import { query } from "express-validator";
import authModel from "../models/auth.model.js";

class TaskService {
  async createTask({
    projectId,
    title,
    description,
    created_by,
    priority,
    status,
    due_date,
  }) {
    // get valid project members
    // const validMembers = await ProjectModel.getValidProjectMembers(
    //   projectId,
    //   assignedUsers,
    // );

    // const validIds = validMembers.map((member) => member.user_id);

    // const invalidUserIds = assignedUsers.filter(
    //   (id) => !validIds.includes(id),
    // );

    // no valid member found
    // if (validIds.length === 0) {
    //   throw new BadRequestError("No valid project member found");
    // }

    // create task
    const taskId = await TaskModel.createTask(
      {
        projectId,
        title,
        description,
        created_by,
        priority,
        due_date,
      }
    );

    // assign task to valid users
    // await TaskModel.assignTaskToUsers(taskId, validIds, connection);

    // commit transaction
    // await connection.commit();

    // fetch created task
    const task = await TaskModel.getTaskById(taskId);

    return task

  }

  async getProjectAllTasks(projectId, querParams) {
    const { page, limit, offset } = getPagination(querParams);

    const filters = {
      status: querParams.status,
      priority: querParams.priority,
      search: querParams.search,
    };

    const tasks = await TaskModel.getProjectAllTasks({
      projectId,
      filters,
      limit,
      offset,
    });

    const totalTask = await TaskModel.countProjectTasks({
      projectId,
      filters,
    });

    const formattedTasks = tasks.map((task) => ({
      ...task,
      project: typeof task.project === "string" ? JSON.parse(task.project) : task.project,
      created_by: JSON.parse(task.created_by),
      assigned_users: JSON.parse(task.assigned_users),
    }));

    return formatPagination({
      data: formattedTasks,
      total: totalTask,
      page,
      limit,
    });
  }

  async getAllTasks(queryParams) {
    const { page, limit, offset } = getPagination(queryParams);

    const filters = {
      status: queryParams.status,
      priority: queryParams.priority,
      search: queryParams.search,
      projectId: queryParams.projectId,
    };

    const tasks = await TaskModel.getAllTasks({
      filters,
      limit,
      offset,
    });

    const totalTask = await TaskModel.countAllTasks({ filters });

    const formattedTasks = tasks.map((task) => ({
      ...task,
      project: typeof task.project === "string" ? JSON.parse(task.project) : task.project,
      created_by: typeof task.created_by === "string" ? JSON.parse(task.created_by) : task.created_by,
      assigned_users:
        typeof task.assigned_users === "string"
          ? JSON.parse(task.assigned_users)
          : task.assigned_users,
    }));

    return formatPagination({
      data: formattedTasks,
      total: totalTask,
      page,
      limit,
    });
  }

  async getTaskDeatils(taskId) {
    const task = await TaskModel.getTaskById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    return task;
  }

  async updateTask(data) {
    const task = await TaskModel.getTaskById(data.taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    const updated = await TaskModel.updateTask(data);

    if (!updated) {
      throw new BadRequestError("No fields provided for update");
    }
    return await TaskModel.getTaskById(data.taskId);
  }

  async deleteTask(taskId) {
    const isExists = await TaskModel.findTaskById(taskId);
    if (!isExists || isExists[0].isTaskExists === 0) {
      throw new BadRequestError("Task doesn't exists which want you to delete");
    }

    const res = await TaskModel.deleteTask(taskId);
    return res
  }

  async updateStatus(taskId, status, user) {
    const task = await TaskModel.getTaskById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    if (task.status === status) {
      return task;
    }

    const isPrivileged =
      user?.role === "admin" ||
      user?.role === "super_admin" 
      Number(task?.created_by?.id) === Number(user?.id);

    if (!isPrivileged) {
      const allowedTransitions = {
        todo: ["in_progress"],
        in_progress: ["completed"],
        completed: [],
      };

      if (!allowedTransitions[task.status]?.includes(status)) {
        throw new BadRequestError(
          "Standard workflow policy restricts moving completed tasks backward or returning active tasks to backlog. Contact a project manager or admin to reopen or reassign this task."
        );
      }
    }

    await TaskModel.updateStatus(taskId, status);
    return await TaskModel.getTaskById(taskId);
  }

  async getMyTasks(userId) {
    return await TaskModel.getMyTasks(userId);
  }

  async assignTask({ taskId, userIds }) {

    const isExists =
      await TaskModel.findTaskById(taskId);

    if (
      !isExists ||
      isExists[0].isTaskExists === 0
    ) {
      throw new BadRequestError(
        "Task doesn't exist"
      );
    }

    const alreadyAssigned =
      await TaskModel.checkAssignment(
        taskId,
        userIds
      );

    const assignedUserIds =
      alreadyAssigned.map(
        item => item.user_id
      );

    const usersToAssign =
      userIds.filter(
        id =>
          !assignedUserIds.includes(id)
      );

    if (!usersToAssign.length) {
      throw new BadRequestError(
        "All users already assigned"
      );
    }

    await TaskModel.assignTask(
      taskId,
      usersToAssign
    );

    // fetch full user data
    const assignedUsers =
      await Promise.all(

        usersToAssign.map(
          async (userId) => {

            const user =
              await authModel.getUserById(
                userId
              );

            return {
              id: user.id,
              name: user.name,
              email: user.email,
            };
          }
        )

      );

    return {
      taskId,
      assignedUsers,
    };
  }
}

export default new TaskService();

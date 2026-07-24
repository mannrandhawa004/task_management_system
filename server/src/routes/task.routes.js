import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeProjectRoles } from "../middlewares/authorizeProjectRoles.middleware.js";
import TaskController from "../controllers/task.controller.js";
import {
  createTaskValidator,
  updateTaskStatusValidator,
  updateTaskValidator,
} from "../validators/task.validator.js";
import { validate } from "../middlewares/validate.js";
import {
  projectAccessMiddleware,
  taskAccessMiddleware,
  taskAssigneeMiddleware,
} from "../middlewares/projectAccess.middleware.js";
import { authorizePermissions } from "../middlewares/authorizePermissions.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { cacheResponse, invalidateCacheAfter } from "../middlewares/cache.middleware.js";
const router = Router();

router.post(
  "/:projectId/tasks",
  authMiddleware,
  authorizePermissions("create_task"),
  createTaskValidator,
  validate,
  invalidateCacheAfter(["tasks", "projects", "users", "departments", "dashboard"]),
  TaskController.createTask,
);

router.get(
  "/project/:projectId/tasks",
  authMiddleware,
  projectAccessMiddleware,
  cacheResponse({ resource: (req) => `project-${req.params.projectId}-tasks`, ttl: 20, versionResources: ["tasks", "projects", "users"] }),
  TaskController.getProjectAllTasks,
);

router.get(
  "/allTasks",
  authMiddleware,
  authorizeRoles("admin"),
  cacheResponse({ resource: "all-tasks", ttl: 20, versionResources: ["tasks", "projects", "users"] }),
  TaskController.getAllTasks,
)

router.post(
  "/:taskId/assign",
  authMiddleware,
  authorizePermissions(
    "assign_task"
  ),
  taskAccessMiddleware,
  invalidateCacheAfter(["tasks", "projects", "users", "departments", "dashboard"]),
  TaskController.assignTask
);

router.get(
  "/mytask",
  authMiddleware,
  cacheResponse({ resource: "my-tasks", ttl: 20, versionResources: ["tasks", "projects", "users"] }),
  TaskController.getMyTasks,
);

router.get(
  "/:taskId",
  authMiddleware,
  taskAccessMiddleware,
  cacheResponse({ resource: (req) => `task-${req.params.taskId}`, ttl: 30, versionResources: ["tasks", "projects", "users"], includeQuery: false }),
  TaskController.getTaskDeatils,
);

router.patch(
  "/update/:taskId",
  authMiddleware,
  authorizePermissions("update_task"),
  taskAccessMiddleware,
  updateTaskValidator,
  validate,
  invalidateCacheAfter(["tasks", "projects", "users", "departments", "dashboard"]),
  TaskController.updateTask,
);

router.delete(
  "/delete/:taskId",
  authMiddleware,
  authorizePermissions("delete_task"),
  taskAccessMiddleware,
  invalidateCacheAfter(["tasks", "projects", "users", "departments", "dashboard"]),
  TaskController.deleteTask,
);

router.patch(
  "/update/:taskId/status",
  authMiddleware,
  authorizePermissions("update_own_task_status"),
  taskAssigneeMiddleware,
  updateTaskStatusValidator,
  validate,
  invalidateCacheAfter(["tasks", "projects", "users", "departments", "dashboard"]),
  TaskController.updateStatus,
);


export default router;

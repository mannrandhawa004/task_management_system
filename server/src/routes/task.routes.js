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
const router = Router();

router.post(
  "/:projectId/tasks",
  authMiddleware,
  authorizePermissions("create_task"),
  createTaskValidator,
  validate,
  TaskController.createTask,
);

router.get(
  "/project/:projectId/tasks",
  authMiddleware,
  projectAccessMiddleware,
  TaskController.getProjectAllTasks,
);

router.get("/allTasks", authMiddleware, authorizeRoles("admin"), TaskController.getAllTasks)

router.post(
  "/:taskId/assign",
  authMiddleware,
  authorizePermissions(
    "assign_task"
  ),
  taskAccessMiddleware,
  TaskController.assignTask
);

router.get("/mytask", authMiddleware, TaskController.getMyTasks);

router.get(
  "/:taskId",
  authMiddleware,
  taskAccessMiddleware,
  TaskController.getTaskDeatils,
);

router.patch(
  "/update/:taskId",
  authMiddleware,
  authorizePermissions("update_task"),
  taskAccessMiddleware,
  updateTaskValidator,
  validate,
  TaskController.updateTask,
);

router.delete(
  "/delete/:taskId",
  authMiddleware,
  authorizePermissions("delete_task"),
  taskAccessMiddleware,
  TaskController.deleteTask,
);

router.patch(
  "/update/:taskId/status",
  authMiddleware,
  authorizePermissions("update_own_task_status"),
  taskAssigneeMiddleware,
  updateTaskStatusValidator,
  validate,
  TaskController.updateStatus,
);


export default router;

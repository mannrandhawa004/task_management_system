
import { Router } from "express";
import DashboardController from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware); // Protect all analytical scopes

router.get("/projects-summary", DashboardController.getProjectStats);
router.get("/tasks-in-progress", DashboardController.getInProgressTasks);
router.get("/tasks-completed", DashboardController.getCompletedTasks);
router.get("/tasks-upcoming", DashboardController.getUpcomingTasks);
router.get("/tasks-overdue", DashboardController.getOverdueTasks);
router.get("/recently-active-projects", DashboardController.getRecentlyActiveProjects);
router.get("/recently-active-tasks", DashboardController.getRecentlyActiveTasks);
router.get("/daily-task-progress", DashboardController.getDailyTaskProgress);

export default router;
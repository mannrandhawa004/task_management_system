
import { Router } from "express";
import DashboardController from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

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

router.get("/admin-metrics", authorizeRoles("super_admin", "admin"), DashboardController.getAdminMetrics);
router.get("/department-metrics", DashboardController.getDepartmentMetrics);
router.get("/department-metrics/:deptId", DashboardController.getDepartmentMetrics);
router.get("/user-metrics", DashboardController.getUserMetrics);

export default router;
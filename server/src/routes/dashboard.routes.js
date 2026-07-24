
import { Router } from "express";
import DashboardController from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { cacheResponse } from "../middlewares/cache.middleware.js";

const router = Router();

router.use(authMiddleware); // Protect all analytical scopes

const dashboardCache = (resource, ttl, options = {}) => cacheResponse({
  resource,
  ttl,
  versionResources: ["dashboard"],
  ...options,
});

router.get("/projects-summary", dashboardCache("dashboard-projects", 45), DashboardController.getProjectStats);
router.get("/tasks-in-progress", dashboardCache("dashboard-tasks-in-progress", 30), DashboardController.getInProgressTasks);
router.get("/tasks-completed", dashboardCache("dashboard-tasks-completed", 30), DashboardController.getCompletedTasks);
router.get("/tasks-upcoming", dashboardCache("dashboard-tasks-upcoming", 30), DashboardController.getUpcomingTasks);
router.get("/tasks-overdue", dashboardCache("dashboard-tasks-overdue", 20), DashboardController.getOverdueTasks);
router.get("/recently-active-projects", dashboardCache("dashboard-recent-projects", 20), DashboardController.getRecentlyActiveProjects);
router.get("/recently-active-tasks", dashboardCache("dashboard-recent-tasks", 20), DashboardController.getRecentlyActiveTasks);
router.get("/daily-task-progress", dashboardCache("dashboard-daily-progress", 120), DashboardController.getDailyTaskProgress);

router.get(
  "/admin-metrics",
  authorizeRoles("super_admin", "admin"),
  dashboardCache("dashboard-admin-metrics", 45, { scope: "role", includeQuery: false }),
  DashboardController.getAdminMetrics,
);
router.get("/department-metrics", dashboardCache("dashboard-department-self", 45), DashboardController.getDepartmentMetrics);
router.get(
  "/department-metrics/:deptId",
  dashboardCache((req) => `dashboard-department-${req.params.deptId}`, 45, { scope: "role", includeQuery: false }),
  DashboardController.getDepartmentMetrics,
);
router.get("/user-metrics", dashboardCache("dashboard-user-metrics", 30, { includeQuery: false }), DashboardController.getUserMetrics);

export default router;

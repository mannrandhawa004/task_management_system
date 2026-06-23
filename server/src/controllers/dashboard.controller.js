import DashboardService from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination, formatPagination } from "../utils/pagination.js";
import { successResponse } from "../utils/response.js";


class DashboardController {
    getProjectStats = asyncHandler(async (req, res) => {
        const { page, offset, limit } = getPagination(req.query);
        const { user } = req;

        const { totalProjects, activeProjects, rows } = await DashboardService.getProjectMetrics(user, { offset, limit });

        const payload = {
            metrics: { totalProjects, activeProjectsCount: activeProjects },
            ...formatPagination({ data: rows, total: activeProjects, page, limit })
        };

        return successResponse(res, "Project dashboard metrics aggregated.", payload, 200);
    });

    // Task 2: Active / In-Progress Tasks Pipeline
    getInProgressTasks = asyncHandler(async (req, res) => {
        const { page, offset, limit } = getPagination(req.query);
        const { totalTasks, inProgressCount, rows } = await DashboardService.getInProgressMetrics(req.user, { offset, limit });

        const payload = {
            metrics: { totalTasks, inProgressCount },
            ...formatPagination({ data: rows, total: inProgressCount, page, limit })
        };

        return successResponse(res, "Active workflow analytics compiled.", payload, 200);
    });

    // Task 3: Finished Tasks & Structural Percentages
    getCompletedTasks = asyncHandler(async (req, res) => {
        const { page, offset, limit } = getPagination(req.query);
        const { totalTasks, completedCount, completionPercentage, rows } = await DashboardService.getCompletedMetrics(req.user, { offset, limit });

        const payload = {
            metrics: { totalTasks, completedCount, completionPercentage: `${completionPercentage}%` },
            ...formatPagination({ data: rows, total: completedCount, page, limit })
        };

        return successResponse(res, "Performance metrics structured.", payload, 200);
    });

    // Task 4: Upcoming (To Do) Pipeline Nodes
    getUpcomingTasks = asyncHandler(async (req, res) => {
        const { page, offset, limit } = getPagination(req.query);
        const { todoCount, rows } = await DashboardService.getUpcomingMetrics(req.user, { offset, limit });

        const payload = {
            metrics: { upcomingTodoCount: todoCount },
            ...formatPagination({ data: rows, total: todoCount, page, limit })
        };

        return successResponse(res, "Upcoming work arrays extracted.", payload, 200);
    });


    getOverdueTasks = asyncHandler(async (req, res) => {
        const { page, offset, limit } = getPagination(req.query);
        const { user } = req;

        const { totalCriticalCount, overdueTasks, upcomingDeadlines } =
            await DashboardService.getOverdueMetrics(user, { offset, limit });

        const payload = {
            metrics: {
                totalCriticalCount,
                overdueCount: overdueTasks.length,
                upcomingCount: upcomingDeadlines.length
            },
            data: {
                overdueTasks,
                upcomingDeadlines
            },
            pagination: {
                total: totalCriticalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCriticalCount / limit)
            }
        };

        return successResponse(res, "Critical radar elements separated successfully.", payload, 200);
    });

    getRecentlyActiveProjects = asyncHandler(async (req, res) => {
        const limit = parseInt(req.query.limit) || 5;
        const { rows } = await DashboardService.getRecentlyActiveProjects(req.user, { limit });

        const payload = {
            data: rows,
            count: rows.length,
        };

        return successResponse(res, "Recently active projects retrieved.", payload, 200);
    });

    getRecentlyActiveTasks = asyncHandler(async (req, res) => {
        const limit = parseInt(req.query.limit) || 5;
        const { rows } = await DashboardService.getRecentlyActiveTasks(req.user, { limit });

        const payload = {
            data: rows,
            count: rows.length,
        };

        return successResponse(res, "Recently active tasks retrieved.", payload, 200);
    });

    getDailyTaskProgress = asyncHandler(async (req, res) => {
        const days = parseInt(req.query.days) || 30;
        const { rows } = await DashboardService.getDailyTaskProgress(req.user, { days });

        const payload = {
            data: rows,
            count: rows.length,
        };

        return successResponse(res, "Daily task progress retrieved.", payload, 200);
    });

    getAdminMetrics = asyncHandler(async (req, res) => {
        const metrics = await DashboardService.getAdminMetrics();
        return successResponse(res, "Admin global metrics fetched successfully", metrics, 200);
    });

    getDepartmentMetrics = asyncHandler(async (req, res) => {
        const departmentId = req.params.deptId || req.user.department_id;
        if (!departmentId) {
            return successResponse(res, "No department associated with this user", { counts: {}, tasks: {}, attendance: {} }, 200);
        }

        // Restrict non-admins to their own department
        const userRole = req.user.role ? req.user.role.toLowerCase() : "";
        if (userRole !== "super_admin" && userRole !== "admin" && Number(req.user.department_id) !== Number(departmentId)) {
            return res.status(403).json({ success: false, message: "Access denied to this department dashboard" });
        }

        const metrics = await DashboardService.getDepartmentMetrics(departmentId);
        return successResponse(res, "Department metrics fetched successfully", metrics, 200);
    });

    getUserMetrics = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const metrics = await DashboardService.getUserMetrics(userId);
        return successResponse(res, "User metrics fetched successfully", metrics, 200);
    });
}

export default new DashboardController();
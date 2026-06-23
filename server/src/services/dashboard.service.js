
import DashboardModel from "../models/dashboard.model.js";

class DashboardService {
    async getProjectMetrics(user, { offset, limit }) {
        const isAdmin = user.role === "admin";
        const [totalProjects, activeProjects, rows] = await Promise.all([
            DashboardModel.countProjects(user, isAdmin, false), 
            DashboardModel.countProjects(user, isAdmin, true), 
            DashboardModel.fetchPaginatedProjects(user, isAdmin, { offset, limit })
        ]);
        return { totalProjects, activeProjects, rows };
    }

    async getInProgressMetrics(user, { offset, limit }) {
        const isAdmin = user.role === "admin";
        const [totalTasks, inProgressCount, rows] = await Promise.all([
            DashboardModel.countTotalTasks(user, isAdmin),
            DashboardModel.countFilteredTasks(user, isAdmin, "in_progress"),
            DashboardModel.fetchPaginatedTasks(user, isAdmin, { status: "in_progress", offset, limit })
        ]);
        return { totalTasks, inProgressCount, rows };
    }

    async getCompletedMetrics(user, { offset, limit }) {
        const isAdmin = user.role === "admin";
        const [totalTasks, completedCount, rows] = await Promise.all([
            DashboardModel.countTotalTasks(user, isAdmin),
            DashboardModel.countFilteredTasks(user, isAdmin, "completed"),
            DashboardModel.fetchPaginatedTasks(user, isAdmin, { status: "completed", offset, limit })
        ]);

        const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
        return { totalTasks, completedCount, completionPercentage, rows };
    }

    async getUpcomingMetrics(user, { offset, limit }) {
        const isAdmin = user.role === "admin";
        const [todoCount, rows] = await Promise.all([
            DashboardModel.countFilteredTasks(user, isAdmin, "todo"),
            DashboardModel.fetchPaginatedTasks(user, isAdmin, { status: "todo", offset, limit })
        ]);
        return { todoCount, rows };
    }



    async getRecentlyActiveProjects(user, { limit = 5 }) {
        const isAdmin = user.role === "admin";
        const rows = await DashboardModel.fetchRecentlyActiveProjects(user, isAdmin, { limit });
        return { rows };
    }

    async getRecentlyActiveTasks(user, { limit = 5 }) {
        const isAdmin = user.role === "admin";
        const rows = await DashboardModel.fetchRecentlyActiveTasks(user, isAdmin, { limit });
        return { rows };
    }

    async getDailyTaskProgress(user, { days = 30 } = {}) {
        const isAdmin = user.role === "admin";
        const rows = await DashboardModel.getDailyTaskProgress(user, isAdmin, { days });
        return { rows };
    }

    async getOverdueMetrics(user, { offset, limit }) {
        const isAdmin = user.role === "admin";
        const [totalCriticalCount, rawRows] = await Promise.all([
            DashboardModel.countOverdueTasks(user, isAdmin),
            DashboardModel.fetchPaginatedOverdueTasks(user, isAdmin, { offset, limit })
        ]);

        const now = new Date();
        const overdueTasks = [];
        const upcomingDeadlines = [];


        rawRows.forEach((task) => {
            const taskDueDate = new Date(task.due_date);

            if (taskDueDate < now) {
                overdueTasks.push(task);
            } else {
                upcomingDeadlines.push(task);
            }
        });

        return {
            totalCriticalCount,
            overdueTasks,
            upcomingDeadlines
        };
    }
}

export default new DashboardService();
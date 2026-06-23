import { api } from "@/lib/axios";

const dashboardService = {
    getProjectStats: async (page = 1, limit = 10) => {
        const response = await api.get("/dashboard/projects-summary", {
            params: { page, limit },
        });
        return response.data.data;
    },

    getInProgressTasks: async (page = 1, limit = 10) => {
        const response = await api.get("/dashboard/tasks-in-progress", {
            params: { page, limit },
        });
        return response.data.data;
    },

    getCompletedTasks: async (page = 1, limit = 10) => {
        const response = await api.get("/dashboard/tasks-completed", {
            params: { page, limit },
        });
        return response.data.data;
    },

    getUpcomingTasks: async (page = 1, limit = 10) => {
        const response = await api.get("/dashboard/tasks-upcoming", {
            params: { page, limit },
        });
        return response.data.data;
    },

    getOverdueTasks: async (page = 1, limit = 10) => {
        const response = await api.get("/dashboard/tasks-overdue", {
            params: { page, limit },
        });
        // console.log("res", response.data.data)
        return response.data.data;
    },

    getRecentlyActiveProjects: async (limit = 5) => {
        const response = await api.get("/dashboard/recently-active-projects", {
            params: { limit },
        });
        return response.data.data;
    },

    getRecentlyActiveTasks: async (limit = 5) => {
        const response = await api.get("/dashboard/recently-active-tasks", {
            params: { limit },
        });
        return response.data.data;
    },

    getDailyTaskProgress: async (days = 30) => {
        const response = await api.get("/dashboard/daily-task-progress", {
            params: { days },
        });
        return response.data.data;
    },
};

export default dashboardService;

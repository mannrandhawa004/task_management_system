import { createSlice } from "@reduxjs/toolkit";
import {
    getProjectStatsThunk,
    getInProgressTasksThunk,
    getCompletedTasksThunk,
    getUpcomingTasksThunk,
    getOverdueTasksThunk,
    getRecentlyActiveProjectsThunk,
    getRecentlyActiveTasksThunk,
    getDailyTaskProgressThunk,
} from "../thunks/dashboardThunks";

const initialState = {
    projectStats: {
        metrics: {},
        data: [],
        pagination: {},
        loading: false,
        error: null,
    },
    inProgressTasks: {
        metrics: {},
        data: [],
        pagination: {},
        loading: false,
        error: null,
    },
    completedTasks: {
        metrics: {},
        data: [],
        pagination: {},
        loading: false,
        error: null,
    },
    upcomingTasks: {
        metrics: {},
        data: [],
        pagination: {},
        loading: false,
        error: null,
    },
    criticalRadar: {
        metrics: {},
        overdueTasks: [],
        upcomingDeadlinesTasks: [],
        pagination: {},
        loading: false,
        error: null,
    },
    recentlyActiveProjects: {
        data: [],
        loading: false,
        error: null,
    },
    recentlyActiveTasks: {
        data: [],
        loading: false,
        error: null,
    },
    dailyTaskProgress: {
        data: [],
        loading: false,
        error: null,
    },
    isLoading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    extraReducers: (builder) => {
        // Project Stats
        builder
            .addCase(getProjectStatsThunk.pending, (state) => {
                state.projectStats.loading = true;
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProjectStatsThunk.fulfilled, (state, action) => {
                state.projectStats.loading = false;
                state.projectStats.metrics = action.payload.metrics || {};
                state.projectStats.data = action.payload.data || [];
                state.projectStats.pagination = action.payload.pagination || {};
                state.isLoading = false;
            })
            .addCase(getProjectStatsThunk.rejected, (state, action) => {
                state.projectStats.loading = false;
                state.projectStats.error = action.payload;
                state.isLoading = false;
                state.error = action.payload;
            });

        // In Progress Tasks
        builder
            .addCase(getInProgressTasksThunk.pending, (state) => {
                state.inProgressTasks.loading = true;
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getInProgressTasksThunk.fulfilled, (state, action) => {
                state.inProgressTasks.loading = false;
                state.inProgressTasks.metrics = action.payload.metrics || {};
                state.inProgressTasks.data = action.payload.data || [];
                state.inProgressTasks.pagination = action.payload.pagination || {};
                state.isLoading = false;
            })
            .addCase(getInProgressTasksThunk.rejected, (state, action) => {
                state.inProgressTasks.loading = false;
                state.inProgressTasks.error = action.payload;
                state.isLoading = false;
                state.error = action.payload;
            });

        // Completed Tasks
        builder
            .addCase(getCompletedTasksThunk.pending, (state) => {
                state.completedTasks.loading = true;
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCompletedTasksThunk.fulfilled, (state, action) => {
                state.completedTasks.loading = false;
                state.completedTasks.metrics = action.payload.metrics || {};
                state.completedTasks.data = action.payload.data || [];
                state.completedTasks.pagination = action.payload.pagination || {};
                state.isLoading = false;
            })
            .addCase(getCompletedTasksThunk.rejected, (state, action) => {
                state.completedTasks.loading = false;
                state.completedTasks.error = action.payload;
                state.isLoading = false;
                state.error = action.payload;
            });

        // Upcoming Tasks
        builder
            .addCase(getUpcomingTasksThunk.pending, (state) => {
                state.upcomingTasks.loading = true;
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUpcomingTasksThunk.fulfilled, (state, action) => {
                state.upcomingTasks.loading = false;
                state.upcomingTasks.metrics = action.payload.metrics || {};
                state.upcomingTasks.data = action.payload.data || [];
                state.upcomingTasks.pagination = action.payload.pagination || {};
                state.isLoading = false;
            })
            .addCase(getUpcomingTasksThunk.rejected, (state, action) => {
                state.upcomingTasks.loading = false;
                state.upcomingTasks.error = action.payload;
                state.isLoading = false;
                state.error = action.payload;
            });

        // Overdue Tasks
        builder
            .addCase(getOverdueTasksThunk.pending, (state) => {
                state.criticalRadar.loading = true;
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getOverdueTasksThunk.fulfilled, (state, action) => {
                state.criticalRadar.loading = false;
                state.criticalRadar.metrics = action.payload.metrics || {};
                state.criticalRadar.overdueTasks = action.payload.data.overdueTasks || [];
                state.criticalRadar.upcomingDeadlinesTasks = action.payload.data.upcomingDeadlines || [];
                state.criticalRadar.pagination = action.payload.pagination || {};
                state.isLoading = false;
            })
            .addCase(getOverdueTasksThunk.rejected, (state, action) => {
                state.criticalRadar.loading = false;
                state.criticalRadar.error = action.payload;
                state.isLoading = false;
                state.error = action.payload;
            });

        // Recently Active Projects
        builder
            .addCase(getRecentlyActiveProjectsThunk.pending, (state) => {
                state.recentlyActiveProjects.loading = true;
                state.error = null;
            })
            .addCase(getRecentlyActiveProjectsThunk.fulfilled, (state, action) => {
                state.recentlyActiveProjects.loading = false;
                state.recentlyActiveProjects.data = action.payload.data || [];
            })
            .addCase(getRecentlyActiveProjectsThunk.rejected, (state, action) => {
                state.recentlyActiveProjects.loading = false;
                state.recentlyActiveProjects.error = action.payload;
                state.error = action.payload;
            });

        // Recently Active Tasks
        builder
            .addCase(getRecentlyActiveTasksThunk.pending, (state) => {
                state.recentlyActiveTasks.loading = true;
                state.error = null;
            })
            .addCase(getRecentlyActiveTasksThunk.fulfilled, (state, action) => {
                state.recentlyActiveTasks.loading = false;
                state.recentlyActiveTasks.data = action.payload.data || [];
            })
            .addCase(getRecentlyActiveTasksThunk.rejected, (state, action) => {
                state.recentlyActiveTasks.loading = false;
                state.recentlyActiveTasks.error = action.payload;
                state.error = action.payload;
            });

        // Daily Task Progress
        builder
            .addCase(getDailyTaskProgressThunk.pending, (state) => {
                state.dailyTaskProgress.loading = true;
                state.error = null;
            })
            .addCase(getDailyTaskProgressThunk.fulfilled, (state, action) => {
                state.dailyTaskProgress.loading = false;
                state.dailyTaskProgress.data = action.payload.data || [];
            })
            .addCase(getDailyTaskProgressThunk.rejected, (state, action) => {
                state.dailyTaskProgress.loading = false;
                state.dailyTaskProgress.error = action.payload;
                state.error = action.payload;
            });
    },
});

export default dashboardSlice.reducer;

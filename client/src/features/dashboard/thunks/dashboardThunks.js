import { createAsyncThunk } from "@reduxjs/toolkit";
import dashboardService from "../services/dashboardService";

export const getProjectStatsThunk = createAsyncThunk(
    "dashboard/getProjectStats",
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const data = await dashboardService.getProjectStats(page, limit);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getInProgressTasksThunk = createAsyncThunk(
    "dashboard/getInProgressTasks",
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const data = await dashboardService.getInProgressTasks(page, limit);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getCompletedTasksThunk = createAsyncThunk(
    "dashboard/getCompletedTasks",
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const data = await dashboardService.getCompletedTasks(page, limit);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getUpcomingTasksThunk = createAsyncThunk(
    "dashboard/getUpcomingTasks",
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const data = await dashboardService.getUpcomingTasks(page, limit);
            // console.log("upcoming dta", data)
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getOverdueTasksThunk = createAsyncThunk(
    "dashboard/getOverdueTasks",
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const data = await dashboardService.getOverdueTasks(page, limit);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getRecentlyActiveProjectsThunk = createAsyncThunk(
    "dashboard/getRecentlyActiveProjects",
    async ({ limit = 5 } = {}, { rejectWithValue }) => {
        try {
            const data = await dashboardService.getRecentlyActiveProjects(limit);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getRecentlyActiveTasksThunk = createAsyncThunk(
    "dashboard/getRecentlyActiveTasks",
    async ({ limit = 5 } = {}, { rejectWithValue }) => {
        try {
            const data = await dashboardService.getRecentlyActiveTasks(limit);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getDailyTaskProgressThunk = createAsyncThunk(
    "dashboard/getDailyTaskProgress",
    async ({ days = 30 } = {}, { rejectWithValue }) => {
        try {
            const data = await dashboardService.getDailyTaskProgress(days);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

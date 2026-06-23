import { createAsyncThunk } from "@reduxjs/toolkit";
import * as auditService from "../services/audit.service";

export const getAllLogsThunk = createAsyncThunk(
    "audit/getAllLogs",
    async (params, { rejectWithValue }) => {
        try {
            return await auditService.getAllLogs(params);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch log indexes");
        }
    }
);

export const getLogByIdThunk = createAsyncThunk(
    "audit/getLogById",
    async (logId, { rejectWithValue }) => {
        try {
            return await auditService.getLogById(logId);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to locate audit registry");
        }
    }
);

export const getProjectLogsThunk = createAsyncThunk(
    "audit/getProjectLogs",
    async (projectId, { rejectWithValue }) => {
        try {
            return await auditService.getProjectLogs(projectId);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to isolate project timeline tracking");
        }
    }
);

export const getTaskLogsThunk = createAsyncThunk(
    "audit/getTaskLogs",
    async (taskId, { rejectWithValue }) => {
        try {
            return await auditService.getTaskLogs(taskId);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to extract task mutation registries");
        }
    }
);
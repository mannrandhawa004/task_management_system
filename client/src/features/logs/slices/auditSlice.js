import { createSlice } from "@reduxjs/toolkit";
import {
    getAllLogsThunk,
    getLogByIdThunk,
    getProjectLogsThunk,
    getTaskLogsThunk,
} from "../thunks/auditThunk";

const initialState = {
    logs: [],
    currentLog: null,
    auditLoading: false,
    pagination: null,
};

const auditSlice = createSlice({
    name: "audit",
    initialState,
    reducers: {
        clearCurrentLog: (state) => {
            state.currentLog = null;
        },
        resetAuditState: (state) => {
            state.logs = [];
            state.currentLog = null;
            state.auditLoading = false;
            state.pagination = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // 1. GET ALL LOGS (WITH ADVANCED SERVER-SIDE PAGINATION)
            .addCase(getAllLogsThunk.pending, (state) => {
                state.auditLoading = true;
            })
            .addCase(getAllLogsThunk.fulfilled, (state, action) => {
                state.auditLoading = false;
                const payloadData = action.payload?.data;
                state.logs = payloadData?.data || [];
                state.pagination = payloadData?.pagination || null;
            })
            .addCase(getAllLogsThunk.rejected, (state) => {
                state.auditLoading = false;
            })

            // 2. GET LOG BY ID
            .addCase(getLogByIdThunk.pending, (state) => {
                state.auditLoading = true;
            })
            .addCase(getLogByIdThunk.fulfilled, (state, action) => {
                state.auditLoading = false;
                // Extracts the structural single log item securely
                state.currentLog = action.payload?.data || null;
            })
            .addCase(getLogByIdThunk.rejected, (state) => {
                state.auditLoading = false;
                state.currentLog = null;
            })

            // 3. GET PROJECT LOGS
            .addCase(getProjectLogsThunk.pending, (state) => {
                state.auditLoading = true;
            })
            .addCase(getProjectLogsThunk.fulfilled, (state, action) => {
                state.auditLoading = false;
                // If your backend project logs endpoint sends a raw array under response.data
                const projectPayload = action.payload?.data;
                state.logs = Array.isArray(projectPayload) ? projectPayload : (projectPayload?.data || []);
                state.pagination = null; // Clear pagination for localized parameters
            })
            .addCase(getProjectLogsThunk.rejected, (state) => {
                state.auditLoading = false;
            })

            // 4. GET TASK LOGS
            .addCase(getTaskLogsThunk.pending, (state) => {
                state.auditLoading = true;
            })
            .addCase(getTaskLogsThunk.fulfilled, (state, action) => {
                state.auditLoading = false;
                // If your backend task logs endpoint sends a raw array under response.data
                const taskPayload = action.payload?.data;
                state.logs = Array.isArray(taskPayload) ? taskPayload : (taskPayload?.data || []);
                state.pagination = null; // Clear pagination for localized parameters
            })
            .addCase(getTaskLogsThunk.rejected, (state) => {
                state.auditLoading = false;
            });
    },
});

export const { clearCurrentLog, resetAuditState } = auditSlice.actions;
export default auditSlice.reducer;
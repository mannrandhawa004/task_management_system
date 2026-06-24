import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyHistory,
  getDailyLogs,
  getMonthlySummary,
  updateAttendance,
  startBreak,
  endBreak,
} from "../services/attendance.service";

export const checkInThunk = createAsyncThunk(
  "attendance/checkIn",
  async (status, thunkAPI) => {
    try {
      return await checkIn(status);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Check-in failed");
    }
  }
);

export const checkOutThunk = createAsyncThunk(
  "attendance/checkOut",
  async (_, thunkAPI) => {
    try {
      return await checkOut();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Check-out failed");
    }
  }
);

export const startBreakThunk = createAsyncThunk(
  "attendance/startBreak",
  async (_, thunkAPI) => {
    try {
      return await startBreak();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to start break");
    }
  }
);

export const endBreakThunk = createAsyncThunk(
  "attendance/endBreak",
  async (_, thunkAPI) => {
    try {
      return await endBreak();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to end break");
    }
  }
);

export const getTodayStatusThunk = createAsyncThunk(
  "attendance/getTodayStatus",
  async (_, thunkAPI) => {
    try {
      return await getTodayStatus();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch status");
    }
  }
);

export const getMyHistoryThunk = createAsyncThunk(
  "attendance/getMyHistory",
  async (params, thunkAPI) => {
    try {
      return await getMyHistory(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch history");
    }
  }
);

export const getDailyLogsThunk = createAsyncThunk(
  "attendance/getDailyLogs",
  async (params, thunkAPI) => {
    try {
      return await getDailyLogs(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch daily logs");
    }
  }
);

export const getMonthlySummaryThunk = createAsyncThunk(
  "attendance/getMonthlySummary",
  async (params, thunkAPI) => {
    try {
      return await getMonthlySummary(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch monthly summary");
    }
  }
);

export const updateAttendanceThunk = createAsyncThunk(
  "attendance/updateAttendance",
  async ({ id, data }, thunkAPI) => {
    try {
      return await updateAttendance({ id, data });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update attendance record");
    }
  }
);

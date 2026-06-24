import { createSlice } from "@reduxjs/toolkit";
import {
  checkInThunk,
  checkOutThunk,
  getTodayStatusThunk,
  getMyHistoryThunk,
  getDailyLogsThunk,
  getMonthlySummaryThunk,
  updateAttendanceThunk,
  startBreakThunk,
  endBreakThunk,
} from "../thunks/attendanceThunks";

const initialState = {
  todayRecord: null, // current day checkin/checkout/break status
  weeklyHours: 0,
  history: [],
  summary: null,
  dailyLogs: [],
  monthlySummary: [],
  loading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendanceState: (state) => {
      state.todayRecord = null;
      state.weeklyHours = 0;
      state.history = [];
      state.summary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkIn
      .addCase(checkInThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkInThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.todayRecord = action.payload;
      })
      .addCase(checkInThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // checkOut
      .addCase(checkOutThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOutThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.todayRecord = action.payload;
      })
      .addCase(checkOutThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // startBreak
      .addCase(startBreakThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startBreakThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.todayRecord = action.payload;
      })
      .addCase(startBreakThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // endBreak
      .addCase(endBreakThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(endBreakThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.todayRecord = action.payload;
      })
      .addCase(endBreakThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getTodayStatus
      .addCase(getTodayStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTodayStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.todayRecord = action.payload?.record || null;
        state.weeklyHours = action.payload?.weeklyHours || 0;
      })
      .addCase(getTodayStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getMyHistory
      .addCase(getMyHistoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyHistoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload?.rows || [];
        state.summary = action.payload?.summary || null;
      })
      .addCase(getMyHistoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getDailyLogs
      .addCase(getDailyLogsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDailyLogsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyLogs = action.payload || [];
      })
      .addCase(getDailyLogsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getMonthlySummary
      .addCase(getMonthlySummaryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMonthlySummaryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlySummary = action.payload || [];
      })
      .addCase(getMonthlySummaryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateAttendance
      .addCase(updateAttendanceThunk.fulfilled, (state, action) => {
        state.dailyLogs = state.dailyLogs.map((log) =>
          log.id === action.payload.id ? { ...log, ...action.payload } : log
        );
      });
  },
});

export const { clearAttendanceState } = attendanceSlice.actions;
export default attendanceSlice.reducer;

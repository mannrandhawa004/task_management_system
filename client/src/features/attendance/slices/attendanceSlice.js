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

const defaultMeta = { page: 1, limit: 10, total: 0, totalPages: 1 };

const initialState = {
  todayRecord: null, // current day checkin/checkout/break status
  weeklyHours: 0,
  history: [],
  historyMeta: { ...defaultMeta },
  summary: null,
  dailyLogs: [],
  dailyLogsMeta: { ...defaultMeta },
  monthlySummary: [],
  monthlySummaryMeta: { ...defaultMeta },
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

      // getMyHistory — now paginated
      .addCase(getMyHistoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyHistoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        // Support both old format and new paginated format
        if (payload?.data) {
          state.history = payload.data?.rows || [];
          state.summary = payload.data?.summary || null;
          state.historyMeta = payload.meta || { ...defaultMeta };
        } else {
          state.history = payload?.rows || [];
          state.summary = payload?.summary || null;
        }
      })
      .addCase(getMyHistoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getDailyLogs — now paginated
      .addCase(getDailyLogsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDailyLogsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.data) {
          state.dailyLogs = payload.data || [];
          state.dailyLogsMeta = payload.meta || { ...defaultMeta };
        } else {
          state.dailyLogs = payload || [];
        }
      })
      .addCase(getDailyLogsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getMonthlySummary — now paginated
      .addCase(getMonthlySummaryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMonthlySummaryThunk.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.data) {
          state.monthlySummary = payload.data || [];
          state.monthlySummaryMeta = payload.meta || { ...defaultMeta };
        } else {
          state.monthlySummary = payload || [];
        }
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

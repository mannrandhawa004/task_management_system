import { createSlice } from "@reduxjs/toolkit";
import {
  getDepartmentsThunk,
  getDepartmentDetailsThunk,
  createDepartmentThunk,
  updateDepartmentThunk,
  deleteDepartmentThunk,
  getDepartmentUsersThunk,
  getDepartmentStatsThunk,
} from "../thunks/departmentThunks";

const initialState = {
  departmentsList: [],
  total: 0,
  currentDepartment: null,
  departmentUsers: [],
  departmentStats: null,
  loading: false,
  error: null,
};

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
      state.departmentUsers = [];
      state.departmentStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getDepartments
      .addCase(getDepartmentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDepartmentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.departmentsList = action.payload?.rows || action.payload || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(getDepartmentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getDepartmentDetails
      .addCase(getDepartmentDetailsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDepartmentDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDepartment = action.payload;
      })
      .addCase(getDepartmentDetailsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createDepartment
      .addCase(createDepartmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDepartmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.departmentsList.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createDepartmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateDepartment
      .addCase(updateDepartmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDepartmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.departmentsList = state.departmentsList.map((dept) =>
          dept.id === action.payload.id ? action.payload : dept
        );
        if (state.currentDepartment?.id === action.payload.id) {
          state.currentDepartment = action.payload;
        }
      })
      .addCase(updateDepartmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteDepartment
      .addCase(deleteDepartmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDepartmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.departmentsList = state.departmentsList.filter((dept) => dept.id !== action.payload);
        state.total -= 1;
        if (state.currentDepartment?.id === action.payload) {
          state.currentDepartment = null;
        }
      })
      .addCase(deleteDepartmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getDepartmentUsers
      .addCase(getDepartmentUsersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDepartmentUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.departmentUsers = action.payload;
      })
      .addCase(getDepartmentUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getDepartmentStats
      .addCase(getDepartmentStatsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDepartmentStatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.departmentStats = action.payload;
      })
      .addCase(getDepartmentStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentDepartment } = departmentSlice.actions;
export default departmentSlice.reducer;

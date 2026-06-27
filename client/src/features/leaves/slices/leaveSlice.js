import { createSlice } from "@reduxjs/toolkit";
import { applyLeaveThunk, getMyLeavesThunk, getManageLeavesThunk, updateLeaveStatusThunk, getColleaguesOnLeaveThunk, getPoliciesThunk, createPolicyThunk, updatePolicyThunk, allocateQuotasThunk, getMyBalancesThunk, getSalaryReportThunk } from "../thunks/leaveThunks";

const initialState = {
  myLeaves: [],
  manageLeaves: [],
  colleaguesOnLeave: [],
  policies: [],
  balances: [],
  salaryReport: [],
  loading: false,
  error: null,
};

const leaveSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(applyLeaveThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyLeaveThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves.unshift(action.payload);
      })
      .addCase(applyLeaveThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMyLeavesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyLeavesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves = action.payload || [];
      })
      .addCase(getMyLeavesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getManageLeavesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getManageLeavesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.manageLeaves = action.payload || [];
      })
      .addCase(getManageLeavesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateLeaveStatusThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.manageLeaves.findIndex(l => l.id === updated.id);
        if (index !== -1) {
          state.manageLeaves[index] = { ...state.manageLeaves[index], ...updated };
        }
      })
      .addCase(getColleaguesOnLeaveThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getColleaguesOnLeaveThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.colleaguesOnLeave = action.payload || [];
      })
      .addCase(getColleaguesOnLeaveThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPoliciesThunk.fulfilled, (state, action) => {
        state.policies = action.payload || [];
      })
      .addCase(createPolicyThunk.fulfilled, (state, action) => {
        if (action.payload) state.policies.push(action.payload);
      })
      .addCase(updatePolicyThunk.fulfilled, (state, action) => {
        const idx = state.policies.findIndex(p => p.id === action.payload?.id);
        if (idx !== -1) state.policies[idx] = action.payload;
      })
      .addCase(getMyBalancesThunk.fulfilled, (state, action) => {
        state.balances = action.payload || [];
      })
      .addCase(getSalaryReportThunk.fulfilled, (state, action) => {
        state.salaryReport = action.payload || [];
      });
  }
});

export default leaveSlice.reducer;

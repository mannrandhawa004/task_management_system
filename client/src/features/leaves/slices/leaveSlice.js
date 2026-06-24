import { createSlice } from "@reduxjs/toolkit";
import { applyLeaveThunk, getMyLeavesThunk, getManageLeavesThunk, updateLeaveStatusThunk, getColleaguesOnLeaveThunk } from "../thunks/leaveThunks";

const initialState = {
  myLeaves: [],
  manageLeaves: [],
  colleaguesOnLeave: [],
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
      });
  }
});

export default leaveSlice.reducer;

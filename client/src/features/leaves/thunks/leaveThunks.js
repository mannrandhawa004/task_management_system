import { createAsyncThunk } from "@reduxjs/toolkit";
import { applyLeave, getMyLeaves, getManageLeaves, updateLeaveStatus, getColleaguesOnLeave } from "../services/leave.service";

export const applyLeaveThunk = createAsyncThunk(
  "leaves/apply",
  async (data, thunkAPI) => {
    try {
      return await applyLeave(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to apply leave");
    }
  }
);

export const getMyLeavesThunk = createAsyncThunk(
  "leaves/getMy",
  async (_, thunkAPI) => {
    try {
      return await getMyLeaves();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch leaves");
    }
  }
);

export const getManageLeavesThunk = createAsyncThunk(
  "leaves/getManage",
  async (_, thunkAPI) => {
    try {
      return await getManageLeaves();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch manage leaves");
    }
  }
);

export const updateLeaveStatusThunk = createAsyncThunk(
  "leaves/updateStatus",
  async (data, thunkAPI) => {
    try {
      return await updateLeaveStatus(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update leave");
    }
  }
);

export const getColleaguesOnLeaveThunk = createAsyncThunk(
  "leaves/getColleagues",
  async (_, thunkAPI) => {
    try {
      return await getColleaguesOnLeave();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch colleagues on leave");
    }
  }
);

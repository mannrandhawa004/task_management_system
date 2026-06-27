import { createAsyncThunk } from "@reduxjs/toolkit";
import { applyLeave, getMyLeaves, getManageLeaves, updateLeaveStatus, getColleaguesOnLeave, getPolicies, createPolicy, updatePolicy, allocateQuotas, getMyBalances, getSalaryReport } from "../services/leave.service";

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

export const getPoliciesThunk = createAsyncThunk(
  "leaves/getPolicies",
  async (_, thunkAPI) => {
    try {
      return await getPolicies();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch leave policies");
    }
  }
);

export const createPolicyThunk = createAsyncThunk(
  "leaves/createPolicy",
  async (data, thunkAPI) => {
    try {
      return await createPolicy(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to create leave policy");
    }
  }
);

export const updatePolicyThunk = createAsyncThunk(
  "leaves/updatePolicy",
  async (data, thunkAPI) => {
    try {
      return await updatePolicy(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update leave policy");
    }
  }
);

export const allocateQuotasThunk = createAsyncThunk(
  "leaves/allocateQuotas",
  async (year, thunkAPI) => {
    try {
      return await allocateQuotas(year);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to allocate leave quotas");
    }
  }
);

export const getMyBalancesThunk = createAsyncThunk(
  "leaves/getMyBalances",
  async (year, thunkAPI) => {
    try {
      return await getMyBalances(year);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch leave balances");
    }
  }
);

export const getSalaryReportThunk = createAsyncThunk(
  "leaves/getSalaryReport",
  async (params, thunkAPI) => {
    try {
      return await getSalaryReport(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch salary report");
    }
  }
);

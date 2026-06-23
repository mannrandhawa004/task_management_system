import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartments,
  getDepartmentDetails,
  getDepartmentUsers,
  getDepartmentStats,
} from "../services/department.service";

export const getDepartmentsThunk = createAsyncThunk(
  "departments/getDepartments",
  async (params, thunkAPI) => {
    try {
      return await getDepartments(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch departments");
    }
  }
);

export const getDepartmentDetailsThunk = createAsyncThunk(
  "departments/getDepartmentDetails",
  async (id, thunkAPI) => {
    try {
      return await getDepartmentDetails(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch department details");
    }
  }
);

export const createDepartmentThunk = createAsyncThunk(
  "departments/createDepartment",
  async (data, thunkAPI) => {
    try {
      return await createDepartment(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to create department");
    }
  }
);

export const updateDepartmentThunk = createAsyncThunk(
  "departments/updateDepartment",
  async ({ id, data }, thunkAPI) => {
    try {
      return await updateDepartment({ id, data });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update department");
    }
  }
);

export const deleteDepartmentThunk = createAsyncThunk(
  "departments/deleteDepartment",
  async (id, thunkAPI) => {
    try {
      await deleteDepartment(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete department");
    }
  }
);

export const getDepartmentUsersThunk = createAsyncThunk(
  "departments/getDepartmentUsers",
  async (id, thunkAPI) => {
    try {
      return await getDepartmentUsers(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch department users");
    }
  }
);

export const getDepartmentStatsThunk = createAsyncThunk(
  "departments/getDepartmentStats",
  async (id, thunkAPI) => {
    try {
      return await getDepartmentStats(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch department stats");
    }
  }
);

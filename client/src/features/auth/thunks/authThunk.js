import {
  loginUser,
  getProfile,
  logoutUser,
  registerUser,
  getAllUsers,
  changeStatus,
} from "@/features/auth/services/auth.service";
import { createAsyncThunk } from "@reduxjs/toolkit";


export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      return await registerUser(data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const response = await loginUser(credentials);
      return response;
    } catch (error) {
      return (
        thunkAPI.rejectWithValue(error.response?.data?.message) ||
        "Login failed"
      );
    }
  },
);

export const profileThunk = createAsyncThunk(
  "auth/profile",

  async (_, thunkAPI) => {
    try {
      return await getProfile();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",

  async (_, thunkAPI) => {
    try {
      return await logoutUser();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);


export const changeStatusThunk = createAsyncThunk(
  "auth/changeStatus",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      return await changeStatus({ userId, status });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Systemic clearance permissions update rejected."
      );
    }
  }
);

export const getAllUsersThunk = createAsyncThunk(
  "auth/getAllUsers",
  async ({ page = 1, limit = 10 }, thunkAPI) => {
    try {
      return await getAllUsers(page, limit);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

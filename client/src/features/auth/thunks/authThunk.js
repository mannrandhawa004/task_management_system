import {
  loginUser,
  getProfile,
  logoutUser,
  registerUser,
  getAllUsers,
  changeStatus,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
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
  async ({ page = 1, limit = 10, filters = {} }, thunkAPI) => {
    try {
      return await getAllUsers(page, limit, filters);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch users");
    }
  },
);

export const createUserThunk = createAsyncThunk(
  "auth/createUser",
  async (formData, thunkAPI) => {
    try {
      return await createUser(formData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to create user");
    }
  }
);

export const updateUserThunk = createAsyncThunk(
  "auth/updateUser",
  async ({ id, formData }, thunkAPI) => {
    try {
      return await updateUser(id, formData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  "auth/deleteUser",
  async (id, thunkAPI) => {
    try {
      return await deleteUser(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete user");
    }
  }
);

export const getRolesThunk = createAsyncThunk(
  "auth/getRoles",
  async (_, thunkAPI) => {
    try {
      return await getRoles();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch roles");
    }
  }
);

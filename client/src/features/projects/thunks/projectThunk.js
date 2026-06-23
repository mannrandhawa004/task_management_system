import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  getProjects,
  getProjectDetails,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from "../services/project.service";

export const getProjectsThunk = createAsyncThunk(
  "project/getProjects",

  async (params = {}, thunkAPI) => {
    try {
      const { page = 1, limit = 10 } = params;
      return await getProjects({ page, limit });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getProjectDetailsThunk = createAsyncThunk(
  "project/getProjectDetails",

  async (id, thunkAPI) => {
    try {
      return await getProjectDetails(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const createProjectThunk = createAsyncThunk(
  "project/createProject",

  async (data, thunkAPI) => {
    try {
      return await createProject(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateProjectThunk = createAsyncThunk(
  "project/updateProject",

  async ({ id, data }, thunkAPI) => {
    try {
      return await updateProject(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteProjectThunk = createAsyncThunk(
  "project/deleteProject",

  async (id, thunkAPI) => {
    try {
      return await deleteProject(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getProjectMembersThunk = createAsyncThunk(
  "project/getMembers",

  async (projectId, thunkAPI) => {
    try {
      return await getProjectMembers(projectId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const addProjectMemberThunk = createAsyncThunk(
  "project/addMember",

  async ({ projectId, data }, thunkAPI) => {
    try {
      return await addProjectMember(projectId, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

export const removeProjectMemberThunk = createAsyncThunk(
  "project/removeMember",

  async ({ projectId, userId }, thunkAPI) => {
    try {
      await removeProjectMember(projectId, userId);
      return { userId };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

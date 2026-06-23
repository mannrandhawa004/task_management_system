import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createTeam,
  updateTeam,
  deleteTeam,
  getTeams,
  getTeamDetails,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
  assignTeamToProject,
  removeTeamFromProject,
  getProjectTeams,
} from "../services/team.service";

export const getTeamsThunk = createAsyncThunk(
  "teams/getTeams",
  async (params, thunkAPI) => {
    try {
      return await getTeams(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch teams");
    }
  }
);

export const getTeamDetailsThunk = createAsyncThunk(
  "teams/getTeamDetails",
  async (id, thunkAPI) => {
    try {
      return await getTeamDetails(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch team details");
    }
  }
);

export const createTeamThunk = createAsyncThunk(
  "teams/createTeam",
  async (data, thunkAPI) => {
    try {
      return await createTeam(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to create team");
    }
  }
);

export const updateTeamThunk = createAsyncThunk(
  "teams/updateTeam",
  async ({ id, data }, thunkAPI) => {
    try {
      return await updateTeam({ id, data });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update team");
    }
  }
);

export const deleteTeamThunk = createAsyncThunk(
  "teams/deleteTeam",
  async (id, thunkAPI) => {
    try {
      await deleteTeam(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete team");
    }
  }
);

export const addTeamMemberThunk = createAsyncThunk(
  "teams/addTeamMember",
  async ({ teamId, userId }, thunkAPI) => {
    try {
      return await addTeamMember({ teamId, userId });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to add member to team");
    }
  }
);

export const removeTeamMemberThunk = createAsyncThunk(
  "teams/removeTeamMember",
  async ({ teamId, userId }, thunkAPI) => {
    try {
      return await removeTeamMember({ teamId, userId });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to remove member from team");
    }
  }
);

export const getTeamMembersThunk = createAsyncThunk(
  "teams/getTeamMembers",
  async (teamId, thunkAPI) => {
    try {
      return await getTeamMembers(teamId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch team members");
    }
  }
);

export const assignTeamToProjectThunk = createAsyncThunk(
  "teams/assignTeamToProject",
  async ({ projectId, teamId }, thunkAPI) => {
    try {
      return await assignTeamToProject({ projectId, teamId });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to assign team to project");
    }
  }
);

export const removeTeamFromProjectThunk = createAsyncThunk(
  "teams/removeTeamFromProject",
  async ({ projectId, teamId }, thunkAPI) => {
    try {
      return await removeTeamFromProject({ projectId, teamId });
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to remove team from project");
    }
  }
);

export const getProjectTeamsThunk = createAsyncThunk(
  "teams/getProjectTeams",
  async (projectId, thunkAPI) => {
    try {
      return await getProjectTeams(projectId);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch project teams");
    }
  }
);

import { createSlice } from "@reduxjs/toolkit";

import {
  getProjectsThunk,
  getProjectDetailsThunk,
  createProjectThunk,
  updateProjectThunk,
  deleteProjectThunk,
  getProjectMembersThunk,
  removeProjectMemberThunk,
} from "../thunks/projectThunk";

const initialState = {
  projects: [],
  project: null,
  members: [],
  total: 0,
  loading: false,
  actionLoading: false,
  memberLoading: false,
  removeLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  },

};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // create project thunks
      .addCase(createProjectThunk.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(createProjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
      })
      .addCase(createProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // get project thunks
      .addCase(getProjectsThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(getProjectsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.data;
        state.total = action.payload.total;
        state.pagination.totalItems = action.payload.total;
        state.pagination.totalPages = Math.ceil(action.payload.total / state.pagination.pageSize);
        state.pagination.currentPage = action.payload.page;
        
        
      })

      .addCase(getProjectsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //   get detail of project thunks
      .addCase(getProjectDetailsThunk.pending, (state, action) => {
        state.loading = true;
      })

      .addCase(getProjectDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.project = action.payload;
      })
      .addCase(getProjectDetailsThunk.rejected, (action, state) => {
        state.loading = false;
        state.error = action.payload;
      })

      // MEMBERS

      .addCase(getProjectMembersThunk.fulfilled, (state, action) => {
        state.members = action.payload;
      })

      // delete members
      .addCase(removeProjectMemberThunk.pending, (state) => {
        state.removeLoading = true;
      })

      .addCase(removeProjectMemberThunk.fulfilled, (state, action) => {
        const removedUserId = action.meta.arg.userId;
        state.members = state.members.filter(
          (member) => Number(member.member_id) !== Number(removedUserId),
        );
        state.actionLoading = false;
      })

      .addCase(removeProjectMemberThunk.rejected, (state, action) => {
        state.removeLoading = false;
        state.error = action.payload;
      })
      // ACTION LOADING

      .addMatcher(
        (action) =>
          action.type.includes("/pending") &&
          (action.type.includes("createProject") ||
            action.type.includes("updateProject") ||
            action.type.includes("deleteProject")),

        (state) => {
          state.actionLoading = true;
        },
      )

      .addMatcher(
        (action) =>
          action.type.includes("/fulfilled") ||
          action.type.includes("/rejected"),

        (state) => {
          state.actionLoading = false;
        },
      );
  },
});

export default projectSlice.reducer;

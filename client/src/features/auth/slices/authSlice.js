import { createSlice } from "@reduxjs/toolkit";

import {
  loginThunk,
  profileThunk,
  logoutThunk,
  changeStatusThunk,
  getAllUsersThunk,
} from "../thunks/authThunk";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  users: [],
  initialized: false,
  pagination: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })

      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(profileThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(profileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;

        state.user = action.payload;
        state.isAuthenticated = true;
      })

      .addCase(profileThunk.rejected, (state) => {
        state.loading = false;
        state.initialized = true;

        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = false;
      })

      .addCase(getAllUsersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changeStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload;
        state.users = state.users.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        );
      })
      .addCase(changeStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Captures the  message safely
      });
  },
});

export default authSlice.reducer;

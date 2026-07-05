import { createSlice } from "@reduxjs/toolkit";

import {
  loginThunk,
  profileThunk,
  logoutThunk,
  changeStatusThunk,
  getAllUsersThunk,
  getRolesThunk,
  verify2FALoginThunk,
  verify2FASetupThunk,
  disable2FAThunk,
} from "../thunks/authThunk";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  users: [],
  roles: [],
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
        if (!action.payload?.requires2FA) {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.initialized = true;
        }
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
      })
      .addCase(getRolesThunk.fulfilled, (state, action) => {
        state.roles = action.payload || [];
      })
      .addCase(verify2FALoginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verify2FALoginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(verify2FALoginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verify2FASetupThunk.fulfilled, (state) => {
        if (state.user) {
          state.user.two_factor_enabled = 1;
        }
      })
      .addCase(disable2FAThunk.fulfilled, (state) => {
        if (state.user) {
          state.user.two_factor_enabled = 0;
        }
      });
  },
});

export default authSlice.reducer;

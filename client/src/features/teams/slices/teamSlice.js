import { createSlice } from "@reduxjs/toolkit";
import {
  getTeamsThunk,
  getMyTeamsThunk,
  getTeamDetailsThunk,
  createTeamThunk,
  updateTeamThunk,
  deleteTeamThunk,
  addTeamMemberThunk,
  removeTeamMemberThunk,
  getTeamMembersThunk,
  assignTeamToProjectThunk,
  removeTeamFromProjectThunk,
  getProjectTeamsThunk,
} from "../thunks/teamThunks";

const initialState = {
  teamsList: [],
  myTeamsList: [],
  total: 0,
  currentTeam: null,
  teamMembers: [],
  projectTeams: [],
  loading: false,
  error: null,
};

const teamSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
      state.teamMembers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // getTeams
      .addCase(getTeamsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.teamsList = Array.isArray(action.payload) ? action.payload : (action.payload?.data || action.payload?.rows || []);
        state.total = action.payload?.pagination?.total || action.payload?.total || (Array.isArray(action.payload) ? action.payload.length : 0);
      })
      .addCase(getTeamsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getMyTeams
      .addCase(getMyTeamsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyTeamsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myTeamsList = Array.isArray(action.payload) ? action.payload : (action.payload?.data || action.payload?.rows || []);
      })
      .addCase(getMyTeamsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getTeamDetails
      .addCase(getTeamDetailsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeamDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTeam = action.payload;
      })
      .addCase(getTeamDetailsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createTeam
      .addCase(createTeamThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeamThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.teamsList.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createTeamThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateTeam
      .addCase(updateTeamThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeamThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.teamsList = state.teamsList.map((t) =>
          t.id === action.payload.id ? action.payload : t
        );
        if (state.currentTeam?.id === action.payload.id) {
          state.currentTeam = action.payload;
        }
      })
      .addCase(updateTeamThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteTeam
      .addCase(deleteTeamThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeamThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.teamsList = state.teamsList.filter((t) => t.id !== action.payload);
        state.total -= 1;
        if (state.currentTeam?.id === action.payload) {
          state.currentTeam = null;
        }
      })
      .addCase(deleteTeamThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // team membership actions
      .addCase(addTeamMemberThunk.fulfilled, (state, action) => {
        state.teamMembers = action.payload;
      })
      .addCase(removeTeamMemberThunk.fulfilled, (state, action) => {
        state.teamMembers = action.payload;
      })
      .addCase(getTeamMembersThunk.fulfilled, (state, action) => {
        state.teamMembers = action.payload;
      })

      // project team assignments
      .addCase(assignTeamToProjectThunk.fulfilled, (state, action) => {
        state.projectTeams = action.payload;
      })
      .addCase(removeTeamFromProjectThunk.fulfilled, (state, action) => {
        state.projectTeams = action.payload;
      })
      .addCase(getProjectTeamsThunk.fulfilled, (state, action) => {
        state.projectTeams = action.payload;
      });
  },
});

export const { clearCurrentTeam } = teamSlice.actions;
export default teamSlice.reducer;

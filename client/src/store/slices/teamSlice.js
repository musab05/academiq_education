import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  teams: [],
  currentTeam: null,
  loading: false,
  error: null,
};

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    setTeams: (state, action) => {
      state.teams = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentTeam: (state, action) => {
      state.currentTeam = action.payload;
    },
    updateTeam: (state, action) => {
      const updatedTeam = action.payload;
      const index = state.teams.findIndex(
        (team) => team._id === updatedTeam._id
      );
      if (index !== -1) {
        state.teams[index] = updatedTeam;
      }
      // Update current team if it's the one being updated
      if (state.currentTeam && state.currentTeam._id === updatedTeam._id) {
        state.currentTeam = updatedTeam;
      }
    },
    addTeam: (state, action) => {
      state.teams.push(action.payload);
    },
    removeTeam: (state, action) => {
      const teamId = action.payload;
      state.teams = state.teams.filter((team) => team._id !== teamId);
      // Clear current team if it's the one being removed
      if (state.currentTeam && state.currentTeam._id === teamId) {
        state.currentTeam = null;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCurrentTeam: (state) => {
      state.currentTeam = null;
    },
    clearTeams: (state) => {
      state.teams = [];
      state.currentTeam = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setTeams,
  setCurrentTeam,
  updateTeam,
  addTeam,
  removeTeam,
  setLoading,
  setError,
  clearCurrentTeam,
  clearTeams,
} = teamSlice.actions;

export default teamSlice.reducer;

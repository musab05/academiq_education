import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  enrollments: [],
  userEnrollments: [],
  teamEnrollments: [],
  currentEnrollment: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  },
  filters: {
    enrolleeType: "",
    courseId: "",
    status: "",
    enrollmentSource: "",
    search: "",
  },
};

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    // General enrollments
    setEnrollments: (state, action) => {
      state.enrollments = action.payload;
      state.loading = false;
      state.error = null;
    },

    setUserEnrollments: (state, action) => {
      state.userEnrollments = action.payload;
      state.loading = false;
      state.error = null;
    },

    setTeamEnrollments: (state, action) => {
      state.teamEnrollments = action.payload;
      state.loading = false;
      state.error = null;
    },

    setCurrentEnrollment: (state, action) => {
      state.currentEnrollment = action.payload;
    },

    addEnrollment: (state, action) => {
      state.enrollments.unshift(action.payload);

      // Also add to specific arrays based on type
      if (action.payload.enrolleeType === "user") {
        state.userEnrollments.unshift(action.payload);
      } else if (action.payload.enrolleeType === "team") {
        state.teamEnrollments.unshift(action.payload);
      }
    },

    updateEnrollment: (state, action) => {
      const updatedEnrollment = action.payload;

      // Update in general enrollments
      const index = state.enrollments.findIndex(
        (enrollment) => enrollment._id === updatedEnrollment._id
      );
      if (index !== -1) {
        state.enrollments[index] = updatedEnrollment;
      }

      // Update in user enrollments
      const userIndex = state.userEnrollments.findIndex(
        (enrollment) => enrollment._id === updatedEnrollment._id
      );
      if (userIndex !== -1) {
        state.userEnrollments[userIndex] = updatedEnrollment;
      }

      // Update in team enrollments
      const teamIndex = state.teamEnrollments.findIndex(
        (enrollment) => enrollment._id === updatedEnrollment._id
      );
      if (teamIndex !== -1) {
        state.teamEnrollments[teamIndex] = updatedEnrollment;
      }

      // Update current enrollment if it's the one being updated
      if (
        state.currentEnrollment &&
        state.currentEnrollment._id === updatedEnrollment._id
      ) {
        state.currentEnrollment = updatedEnrollment;
      }
    },

    removeEnrollment: (state, action) => {
      const enrollmentId = action.payload;

      // Remove from general enrollments
      state.enrollments = state.enrollments.filter(
        (enrollment) => enrollment._id !== enrollmentId
      );

      // Remove from user enrollments
      state.userEnrollments = state.userEnrollments.filter(
        (enrollment) => enrollment._id !== enrollmentId
      );

      // Remove from team enrollments
      state.teamEnrollments = state.teamEnrollments.filter(
        (enrollment) => enrollment._id !== enrollmentId
      );

      // Clear current enrollment if it's the one being removed
      if (
        state.currentEnrollment &&
        state.currentEnrollment._id === enrollmentId
      ) {
        state.currentEnrollment = null;
      }
    },

    // Bulk operations
    addBulkEnrollments: (state, action) => {
      const newEnrollments = action.payload;

      newEnrollments.forEach((enrollment) => {
        state.enrollments.unshift(enrollment);

        if (enrollment.enrolleeType === "user") {
          state.userEnrollments.unshift(enrollment);
        } else if (enrollment.enrolleeType === "team") {
          state.teamEnrollments.unshift(enrollment);
        }
      });
    },

    // Progress updates
    updateEnrollmentProgress: (state, action) => {
      const { enrollmentId, progress, memberProgress } = action.payload;

      const updateProgress = (enrollments) => {
        const enrollment = enrollments.find((e) => e._id === enrollmentId);
        if (enrollment) {
          enrollment.progress = progress;
          if (memberProgress) {
            enrollment.teamMemberProgress = memberProgress;
          }
          enrollment.lastAccessedAt = new Date().toISOString();
        }
      };

      updateProgress(state.enrollments);
      updateProgress(state.userEnrollments);
      updateProgress(state.teamEnrollments);

      if (
        state.currentEnrollment &&
        state.currentEnrollment._id === enrollmentId
      ) {
        state.currentEnrollment.progress = progress;
        if (memberProgress) {
          state.currentEnrollment.teamMemberProgress = memberProgress;
        }
        state.currentEnrollment.lastAccessedAt = new Date().toISOString();
      }
    },

    // Pagination
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },

    // Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Loading and error states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Clear functions
    clearCurrentEnrollment: (state) => {
      state.currentEnrollment = null;
    },

    clearEnrollments: (state) => {
      state.enrollments = [];
      state.userEnrollments = [];
      state.teamEnrollments = [];
      state.currentEnrollment = null;
      state.loading = false;
      state.error = null;
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
    },

    // Search and filtering helpers
    filterEnrollmentsByStatus: (state, action) => {
      const status = action.payload;
      state.filters.status = status;
    },

    filterEnrollmentsByType: (state, action) => {
      const enrolleeType = action.payload;
      state.filters.enrolleeType = enrolleeType;
    },

    searchEnrollments: (state, action) => {
      state.filters.search = action.payload;
    },
  },
});

export const {
  setEnrollments,
  setUserEnrollments,
  setTeamEnrollments,
  setCurrentEnrollment,
  addEnrollment,
  updateEnrollment,
  removeEnrollment,
  addBulkEnrollments,
  updateEnrollmentProgress,
  setPagination,
  setFilters,
  clearFilters,
  setLoading,
  setError,
  clearError,
  clearCurrentEnrollment,
  clearEnrollments,
  filterEnrollmentsByStatus,
  filterEnrollmentsByType,
  searchEnrollments,
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;

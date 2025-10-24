import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  departments: [],
  currentDepartment: null,
  loading: false,
  error: null,
};

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    setDepartments: (state, action) => {
      state.departments = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentDepartment: (state, action) => {
      state.currentDepartment = action.payload;
    },
    updateDepartment: (state, action) => {
      const updatedDepartment = action.payload;
      const index = state.departments.findIndex(
        (dept) => dept._id === updatedDepartment._id
      );
      if (index !== -1) {
        state.departments[index] = updatedDepartment;
      }
      if (state.currentDepartment && state.currentDepartment._id === updatedDepartment._id) {
        state.currentDepartment = updatedDepartment;
      }
    },
    addDepartment: (state, action) => {
      state.departments.push(action.payload);
    },
    removeDepartment: (state, action) => {
      const departmentId = action.payload;
      state.departments = state.departments.filter((dept) => dept._id !== departmentId);
      if (state.currentDepartment && state.currentDepartment._id === departmentId) {
        state.currentDepartment = null;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCurrentDepartment: (state) => {
      state.currentDepartment = null;
    },
    clearDepartments: (state) => {
      state.departments = [];
      state.currentDepartment = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setDepartments,
  setCurrentDepartment,
  updateDepartment,
  addDepartment,
  removeDepartment,
  setLoading,
  setError,
  clearCurrentDepartment,
  clearDepartments,
} = departmentSlice.actions;

export default departmentSlice.reducer;
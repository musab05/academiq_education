import { createSlice } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

const initialState = {
  classrooms: [],
  currentClassroom: null,
  currentClassroomId: null,
  currentSession: null,
  loading: false,
  error: null,
};

const classroomSlice = createSlice({
  name: 'classroom',
  initialState,
  reducers: {
    setClassrooms: (state, action) => {
      // Ensure payload is a valid array
      state.classrooms = Array.isArray(action.payload) ? action.payload : [];
      state.loading = false;
      state.error = null;
    },
    setCurrentClassroom: (state, action) => {
      const classroomId = action.payload;
      state.currentClassroomId = classroomId;
      // Find classroom from stored classrooms if available
      // Add safety check to ensure classrooms array exists
      if (state.classrooms && Array.isArray(state.classrooms)) {
        state.currentClassroom = state.classrooms.find(c => c._id === classroomId) || null;
      } else {
        // If classrooms array doesn't exist, initialize it and set current to null
        state.classrooms = [];
        state.currentClassroom = null;
      }
    },
    setCurrentClassroomData: (state, action) => {
      state.currentClassroom = action.payload;
      state.currentClassroomId = action.payload?._id || null;
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    updateClassroom: (state, action) => {
      const updatedClassroom = action.payload;
      // Ensure classrooms array exists
      if (!state.classrooms || !Array.isArray(state.classrooms)) {
        state.classrooms = [];
      }
      const index = state.classrooms.findIndex(
        (classroom) => classroom._id === updatedClassroom._id
      );
      if (index !== -1) {
        state.classrooms[index] = updatedClassroom;
      }
      if (state.currentClassroomId === updatedClassroom._id) {
        state.currentClassroom = updatedClassroom;
      }
    },
    addClassroom: (state, action) => {
      // Ensure classrooms array exists
      if (!state.classrooms || !Array.isArray(state.classrooms)) {
        state.classrooms = [];
      }
      state.classrooms.push(action.payload);
    },
    removeClassroom: (state, action) => {
      const classroomId = action.payload;
      // Ensure classrooms array exists
      if (!state.classrooms || !Array.isArray(state.classrooms)) {
        state.classrooms = [];
      }
      state.classrooms = state.classrooms.filter((classroom) => classroom._id !== classroomId);
      if (state.currentClassroomId === classroomId) {
        state.currentClassroomId = null;
        state.currentClassroom = null;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearClassroom: (state) => {
      state.currentClassroom = null;
      state.currentClassroomId = null;
      state.currentSession = null;
    },
    clearAll: (state) => {
      state.classrooms = [];
      state.currentClassroom = null;
      state.currentClassroomId = null;
      state.currentSession = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      // Handle rehydration from Redux Persist
      if (action.payload && action.payload.classroom) {
        const rehydratedClassroom = action.payload.classroom;
        // Ensure classrooms is always an array
        if (!Array.isArray(rehydratedClassroom.classrooms)) {
          rehydratedClassroom.classrooms = [];
        }
        return {
          ...initialState,
          ...rehydratedClassroom,
          loading: false, // Reset loading state on rehydration
        };
      }
      return state;
    });
  },
});

export const { 
  setClassrooms,
  setCurrentClassroom, 
  setCurrentClassroomData,
  setCurrentSession, 
  updateClassroom,
  addClassroom,
  removeClassroom,
  setLoading,
  setError,
  clearClassroom,
  clearAll
} = classroomSlice.actions;

export default classroomSlice.reducer;

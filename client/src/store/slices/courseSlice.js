import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  courses: [],
  loading: false,
  error: null,
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload;
    },
    addCourse: (state, action) => {
      state.courses.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCourses, addCourse, setLoading, setError } = courseSlice.actions;
export default courseSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const navigationSlice = createSlice({
  name: 'navigation',
  initialState: {
    courseListSource: '/all-courses',
    navigationStack: [],
  },
  reducers: {
    setCourseListSource: (state, action) => {
      state.courseListSource = action.payload;
    },
    pushNavigation: (state, action) => {
      if (!state.navigationStack) {
        state.navigationStack = [];
      }
      state.navigationStack.push(action.payload);
    },
    popNavigation: (state) => {
      if (!state.navigationStack) {
        state.navigationStack = [];
      }
      state.navigationStack = state.navigationStack.slice(0, -1);
    },
    clearNavigationStack: (state) => {
      state.navigationStack = [];
    },
  },
});

export const { setCourseListSource, pushNavigation, popNavigation, clearNavigationStack } = navigationSlice.actions;
export default navigationSlice.reducer;

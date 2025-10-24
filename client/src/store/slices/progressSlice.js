import { createSlice } from '@reduxjs/toolkit';

const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    lessonProgress: {},
    lastLesson: {}
  },
  reducers: {
    setLessonProgress: (state, action) => {
      const { courseId, lessonId, progress } = action.payload;
      if (!state.lessonProgress[courseId]) {
        state.lessonProgress[courseId] = {};
      }
      state.lessonProgress[courseId][lessonId] = progress;
    },
    setAllLessonProgress: (state, action) => {
      const { courseId, progressData } = action.payload;
      state.lessonProgress[courseId] = progressData;
    },
    setLastLesson: (state, action) => {
      const { courseId, lessonId } = action.payload;
      state.lastLesson[courseId] = lessonId;
    },
    clearCourseProgress: (state, action) => {
      const { courseId } = action.payload;
      delete state.lessonProgress[courseId];
      delete state.lastLesson[courseId];
    }
  }
});

export const { setLessonProgress, setAllLessonProgress, setLastLesson, clearCourseProgress } = progressSlice.actions;
export default progressSlice.reducer;

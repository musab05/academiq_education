import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentCourseId: null,
  lessons: [],
  chapters: [],
  currentLesson: null,
  loading: false,
  error: null,
};

const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {
    setCurrentCourse: (state, action) => {
      state.currentCourseId = action.payload;
    },
    setLessons: (state, action) => {
      state.lessons = action.payload;
    },
    setChapters: (state, action) => {
      state.chapters = action.payload;
    },
    addLesson: (state, action) => {
      state.lessons.push(action.payload);
    },
    addChapter: (state, action) => {
      state.chapters.push(action.payload);
    },
    updateLesson: (state, action) => {
      const index = state.lessons.findIndex(
        (l) => l._id === action.payload._id
      );
      if (index !== -1) state.lessons[index] = action.payload;
    },
    updateChapter: (state, action) => {
      const index = state.chapters.findIndex(
        (c) => c._id === action.payload._id
      );
      if (index !== -1) state.chapters[index] = action.payload;
    },
    deleteLesson: (state, action) => {
      state.lessons = state.lessons.filter((l) => l._id !== action.payload);
    },
    deleteChapter: (state, action) => {
      state.chapters = state.chapters.filter((c) => c._id !== action.payload);
    },
    setCurrentLesson: (state, action) => {
      state.currentLesson = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearLessonData: (state) => {
      state.lessons = [];
      state.chapters = [];
      state.currentLesson = null;
      // Keep currentCourseId to maintain course context across sections
    },
    clearAllData: (state) => {
      state.lessons = [];
      state.chapters = [];
      state.currentLesson = null;
      state.currentCourseId = null;
    },
  },
});

export const {
  setCurrentCourse,
  setLessons,
  setChapters,
  addLesson,
  addChapter,
  updateLesson,
  updateChapter,
  deleteLesson,
  deleteChapter,
  setCurrentLesson,
  setLoading,
  setError,
  clearLessonData,
} = lessonSlice.actions;

export default lessonSlice.reducer;

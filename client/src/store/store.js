import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import courseReducer from "./slices/courseSlice";
import lessonReducer from "./slices/lessonSlice";
import teamReducer from "./slices/teamSlice";
import departmentReducer from "./slices/departmentSlice";
import eventReducer from "./slices/eventSlice";
import enrollmentReducer from "./slices/enrollmentSlice";
import progressReducer from "./slices/progressSlice";
import classroomReducer from "./slices/classroomSlice";
import certificateReducer from "./slices/certificateSlice";
import navigationReducer from "./slices/navigationSlice";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // uses localStorage by default

// Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  course: courseReducer,
  lesson: lessonReducer,
  team: teamReducer,
  department: departmentReducer,
  event: eventReducer,
  enrollment: enrollmentReducer,
  progress: progressReducer,
  classroom: classroomReducer,
  certificate: certificateReducer,
  navigation: navigationReducer,
});

// Persist everything by not using whitelist or blacklist
const persistConfig = {
  key: "root",
  storage,
  migrate: (state) => {
    // Handle migration for corrupted or missing classroom state
    if (state && typeof state === 'object') {
      // Ensure classroom state has proper structure
      if (!state.classroom || typeof state.classroom !== 'object') {
        state.classroom = {
          classrooms: [],
          currentClassroom: null,
          currentClassroomId: null,
          currentSession: null,
          loading: false,
          error: null,
        };
      } else {
        // Ensure classrooms is always an array
        if (!Array.isArray(state.classroom.classrooms)) {
          state.classroom.classrooms = [];
        }
      }
    }
    return Promise.resolve(state);
  },
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;

import { setCurrentClassroom, setCurrentClassroomData, clearClassroom } from '../store/slices/classroomSlice';

/**
 * Helper function to set classroom data in Redux store when navigating to a classroom
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} classroom - Classroom object with _id and other data
 * @param {Function} navigate - React Router navigate function
 * @param {string} path - Optional path to navigate to (default: /classroom/:id)
 */
export const navigateToClassroom = (dispatch, classroom, navigate, path = null) => {
  // Store the classroom data in Redux
  dispatch(setCurrentClassroom(classroom._id));
  dispatch(setCurrentClassroomData(classroom));
  
  // Navigate to the specified path or default classroom path
  const targetPath = path || `/classroom/${classroom._id}`;
  navigate(targetPath);
};

/**
 * Helper function to clear classroom data when navigating away from classroom context
 * @param {Function} dispatch - Redux dispatch function
 */
export const clearClassroomContext = (dispatch) => {
  dispatch(clearClassroom());
};

/**
 * Helper function to set classroom data in Redux from classroom ID and data
 * Used when you already have the classroom information but need to update the store
 * @param {Function} dispatch - Redux dispatch function
 * @param {string} classroomId - The classroom ID
 * @param {Object} classroomData - Optional classroom data object
 */
export const setClassroomContext = (dispatch, classroomId, classroomData = null) => {
  dispatch(setCurrentClassroom(classroomId));
  if (classroomData) {
    dispatch(setCurrentClassroomData(classroomData));
  }
};

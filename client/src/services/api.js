import axios from "axios";
import store from "../store/store";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = store.getState().user.token;
    console.log("API Request - Token:", token ? "Present" : "Missing");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Check if server explicitly requests session clearing
      const shouldClearSession = error.response.data?.clearSession;

      if (shouldClearSession || error.response.status === 401) {
        // Clear user session from store
        store.dispatch({ type: "user/logout" });
        console.log("Session cleared due to authentication failure");

        // Redirect to auth page
        if (
          window.location.pathname !== "/auth" &&
          window.location.pathname !== "/" &&
          window.location.pathname !== "/all-courses" &&
          window.location.pathname !== "/all-classrooms" &&
          !window.location.pathname.startsWith("/course-preview/")
        ) {
          window.location.href = "/auth";
        }
      }
    }
    return Promise.reject(error);
  },
);

export const courseAPI = {
  getAllCourses: () => api.get("/api/courses/all"),
  getMyCourses: () => api.get("/api/courses/my-courses"),
  getEnrolledCourses: () => api.get("/api/courses/enrolled"),
  syncInstituteEnrollments: () => api.post("/api/auth/sync-enrollments"),
  createCourse: (data) => api.post("/api/courses/create", data),
  getBySlug: (slug) => api.get(`/api/courses/slug/${slug}`),
  update: (slug, data) =>
    api.put(`/api/courses/slug/${slug}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (slug) => api.delete(`/api/courses/slug/${slug}`),
  addComment: (slug, data) =>
    api.post(`/api/courses/slug/${slug}/comments`, data),
  deleteComment: (slug, commentId) =>
    api.delete(`/api/courses/slug/${slug}/comments/${commentId}`),
  addReview: (slug, data) =>
    api.post(`/api/courses/slug/${slug}/reviews`, data),
  addFaq: (slug, data) => api.post(`/api/courses/slug/${slug}/faqs`, data),
  answerFaq: (slug, faqId, data) =>
    api.put(`/api/courses/slug/${slug}/faqs/${faqId}/answer`, data),
  deleteFaq: (slug, faqId) =>
    api.delete(`/api/courses/slug/${slug}/faqs/${faqId}`),
};

export const settingsAPI = {
  getSettings: () => api.get("/api/settings"),
  updateSettings: (data) => api.put("/api/settings", data),
  initializeDefaults: () => api.post("/api/settings/init"),
};

export const categoriesAPI = {
  list: () => api.get("/api/categories"),
  create: (data) => api.post("/api/categories/create", data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

export const teamAPI = {
  getTeams: () => api.get("/api/teams"),
  getTeamsLeaderboard: () => api.get("/api/teams/leaderboard"),
  getTeamStats: (teamId) => api.get(`/api/teams/${teamId}/stats`),
  createTeam: (teamData) => api.post("/api/teams", teamData),
  updateTeam: (teamId, teamData) => api.put(`/api/teams/${teamId}`, teamData),
  updateTeamSettings: (teamId, settings) =>
    api.put(`/api/teams/${teamId}/settings`, settings),
  addMember: (teamId, memberData) =>
    api.post(`/api/teams/${teamId}/members`, memberData),
  removeMember: (teamId, userId) =>
    api.delete(`/api/teams/${teamId}/members/${userId}`),
  updateMemberRole: (teamId, userId, roleData) =>
    api.put(`/api/teams/${teamId}/members/${userId}/role`, roleData),
  updateTrackedCourses: (teamId, courseIds) =>
    api.put(`/api/teams/${teamId}/tracked-courses`, { courseIds }),
  addGoal: (teamId, goalData) =>
    api.post(`/api/teams/${teamId}/goals`, goalData),
  updateGoal: (teamId, goalId, goalData) =>
    api.put(`/api/teams/${teamId}/goals/${goalId}`, goalData),
  deleteGoal: (teamId, goalId) =>
    api.delete(`/api/teams/${teamId}/goals/${goalId}`),
  deleteTeam: (teamId) => api.delete(`/api/teams/${teamId}`),
  getMessages: (teamId) => api.get(`/api/team-messages/${teamId}`),
  sendMessage: (teamId, data) => api.post(`/api/team-messages/${teamId}`, data),
};

export const departmentAPI = {
  getDepartments: () => api.get("/api/departments"),
  createDepartment: (departmentData) =>
    api.post("/api/departments", departmentData),
  updateDepartment: (departmentId, departmentData) =>
    api.put(`/api/departments/${departmentId}`, departmentData),
  addMember: (departmentId, memberData) =>
    api.post(`/api/departments/${departmentId}/members`, memberData),
  removeMember: (departmentId, userId) =>
    api.delete(`/api/departments/${departmentId}/members/${userId}`),
  updateMemberRole: (departmentId, userId, roleData) =>
    api.put(
      `/api/departments/${departmentId}/members/${userId}/role`,
      roleData,
    ),
  deleteDepartment: (departmentId) =>
    api.delete(`/api/departments/${departmentId}`),
};

export const eventAPI = {
  getEvents: () => api.get("/api/events"),
  createEvent: (eventData) => api.post("/api/events", eventData),
  updateEvent: (eventId, eventData) =>
    api.put(`/api/events/${eventId}`, eventData),
  deleteEvent: (eventId) => api.delete(`/api/events/${eventId}`),
  registerForEvent: (eventId, userData) =>
    api.post(`/api/events/${eventId}/register`, userData),
  unregisterFromEvent: (eventId, userId) =>
    api.delete(`/api/events/${eventId}/attendees/${userId}`),
};

export const enrollmentAPI = {
  getCourseEnrollments: (courseSlug) =>
    api.get(`/api/enrollments?courseSlug=${courseSlug}`),
  getEnrollments: (params) => api.get("/api/enrollments", { params }),
  getEnrollmentById: (id) => api.get(`/api/enrollments/${id}`),
  getTeamEnrollmentDetails: (courseSlug, teamId) =>
    api.get(`/api/enrollments/team/${teamId}/course/${courseSlug}/details`),
  createEnrollment: (enrollmentData) =>
    api.post("/api/enrollments", enrollmentData),
  updateEnrollment: (id, enrollmentData) =>
    api.put(`/api/enrollments/${id}`, enrollmentData),
  deleteEnrollment: (id) => api.delete(`/api/enrollments/${id}`),
  getUserEnrollments: (userId, params) =>
    api.get(`/api/enrollments/user/${userId}`, { params }),
  getTeamEnrollments: (teamId, params) =>
    api.get(`/api/enrollments/team/${teamId}`, { params }),
  bulkEnroll: (enrollmentsData) =>
    api.post("/api/enrollments/bulk", enrollmentsData),
  updateProgress: (id, progressData) =>
    api.put(`/api/enrollments/${id}`, progressData),
  getGlobalReports: () => api.get("/api/enrollments/global-reports"),
  getCourseEnrollmentDetails: (courseId) =>
    api.get(`/api/enrollments/course/${courseId}/details`),
  getUserEnrollmentDetails: (userId) =>
    api.get(`/api/enrollments/user/${userId}/details`),
};

export const lessonAPI = {
  getLessons: (courseId) => api.get(`/api/lessons/course/${courseId}`),
  getLessonsForCourse: (courseId) => api.get(`/api/lessons/course/${courseId}`),
  createLesson: (data) => api.post("/api/lessons/create", data),
  createChapter: (data) => api.post("/api/lessons/chapter/create", data),
  updateLesson: (id, data) => api.put(`/api/lessons/${id}`, data),
  updateChapter: (id, data) => api.put(`/api/lessons/chapter/${id}`, data),
  deleteLesson: (id) => api.delete(`/api/lessons/${id}`),
  deleteChapter: (id) => api.delete(`/api/lessons/chapter/${id}`),
  // Separate lesson type APIs
  getTextActivity: (lessonId) => api.get(`/api/text-lessons/${lessonId}`),
  updateTextActivity: (lessonId, data) =>
    api.put(`/api/text-lessons/${lessonId}`, data),

  getVideoActivity: (lessonId) => api.get(`/api/video-lessons/${lessonId}`),
  updateVideoActivity: (lessonId, data) =>
    api.put(`/api/video-lessons/${lessonId}`, data),

  getBlockActivity: (lessonId) => api.get(`/api/block-lessons/${lessonId}`),
  updateBlockActivity: (lessonId, data) =>
    api.put(`/api/block-lessons/${lessonId}`, data),

  getScormActivity: (lessonId) => api.get(`/api/scorm-lessons/${lessonId}`),
  updateScormActivity: (lessonId, data) =>
    api.put(`/api/scorm-lessons/${lessonId}`, data),

  getAssignmentActivity: (lessonId) =>
    api.get(`/api/assignment-lessons/${lessonId}`),
  updateAssignmentActivity: (lessonId, data) =>
    api.put(`/api/assignment-lessons/${lessonId}`, data),

  getQuizActivity: (lessonId) => api.get(`/api/quiz-lessons/${lessonId}`),
  updateQuizActivity: (lessonId, data) =>
    api.put(`/api/quiz-lessons/${lessonId}`, data),

  getDocumentActivity: (lessonId) =>
    api.get(`/api/document-lessons/${lessonId}`),
  updateDocumentActivity: (lessonId, data) =>
    api.put(`/api/document-lessons/${lessonId}`, data),

  uploadVideo: (formData) =>
    api.post("/api/upload/video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadScorm: (formData) => {
    return api.post("/api/upload/scorm", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadAssignmentFile: (formData) => {
    return api.post("/api/upload/assignment", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadResourceFile: (formData) => {
    return api.post("/api/upload/resource", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadDocument: (formData) => {
    return api.post("/api/upload/document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getQuestions: (lessonId, params) =>
    api.get(`/api/quiz-lessons/${lessonId}/questions`, { params }),
  getLessonStats: (courseSlug) => api.get(`/api/lessons/stats/${courseSlug}`),
  getAssignmentSubmissions: (lessonId) =>
    api.get(`/api/assignment-lessons/${lessonId}/submissions`),
  gradeAssignment: (lessonId, submissionId, gradeData) =>
    api.put(
      `/api/assignment-lessons/${lessonId}/submissions/${submissionId}/grade`,
      gradeData,
    ),
  uploadAttachment: (lessonId, formData) =>
    api.post(`/api/lessons/${lessonId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteAttachment: (lessonId, attachmentId) =>
    api.delete(`/api/lessons/${lessonId}/attachments/${attachmentId}`),
  reorderItems: (courseId, items) =>
    api.post("/api/lessons/reorder", { courseId, items }),
};

export const userAPI = {
  getUsers: (role = "") => api.get(`/api/users${role ? `?role=${role}` : ""}`),
  getUserDetails: (userId) => api.get(`/api/users/${userId}`),
  createUser: (userData) => api.post("/api/users", userData),
  updateUser: (id, userData) => api.put(`/api/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  getCurrentProfile: () => api.get("/api/users/profile/me"),
  getProfileStats: () => api.get("/api/users/profile/stats"),
  updateProfile: (profileData) => api.put("/api/users/profile/me", profileData),
  changePassword: (passwordData) =>
    api.put("/api/users/profile/password", passwordData),
  updateProfilePicture: (pictureData) =>
    api.put("/api/users/profile/picture", pictureData),
  resetProfilePicture: () => api.post("/api/users/profile/picture/reset"),
};

export const instituteAPI = {
  getAll: () => api.get("/api/institutes"),
  create: (data) => api.post("/api/institutes", data),
  update: (id, data) => api.put(`/api/institutes/${id}`, data),
  delete: (id) => api.delete(`/api/institutes/${id}`),
  getAnalytics: (id) => api.get(`/api/institutes/${id}/analytics`),
  getAllAnalytics: () => api.get("/api/institutes/analytics/all"),
  updateBranding: (id, data) => api.put(`/api/institutes/${id}/branding`, data),
  updateSettings: (id, data) => api.put(`/api/institutes/${id}/settings`, data),
  updateLimits: (id, data) => api.put(`/api/institutes/${id}/limits`, data),
  updateSubscription: (id, data) =>
    api.put(`/api/institutes/${id}/subscription`, data),
};

export const classroomManagementAPI = {
  getAll: () => api.get("/api/classroom-management"),
  getAllPublic: () => api.get("/api/classroom-management/public"),
  getMyClassrooms: () => api.get("/api/classroom-management/my-classrooms"),
  create: (data) => api.post("/api/classroom-management", data),
  update: (id, data) => api.put(`/api/classroom-management/${id}`, data),
  delete: (id) => api.delete(`/api/classroom-management/${id}`),
  enroll: (id, data) =>
    api.post(`/api/classroom-management/${id}/enroll`, data),
  unenroll: (classroomId, studentId) =>
    api.delete(
      `/api/classroom-management/${classroomId}/unenroll/${studentId}`,
    ),
  enrollTeam: (id, data) =>
    api.post(`/api/classroom-management/${id}/enroll-team`, data),
  unenrollTeam: (classroomId, teamId) =>
    api.delete(
      `/api/classroom-management/${classroomId}/unenroll-team/${teamId}`,
    ),
};

export const classroomAPI = {
  getSessions: (params) => api.get("/api/classrooms", { params }),
  getSessionById: (id) => api.get(`/api/classrooms/${id}`),
  createSession: (data) => api.post("/api/classrooms", data),
  updateSession: (id, data) => api.put(`/api/classrooms/${id}`, data),
  deleteSession: (id) => api.delete(`/api/classrooms/${id}`),
  joinSession: (id, data) => api.post(`/api/classrooms/${id}/join`, data),
  leaveSession: (id) => api.post(`/api/classrooms/${id}/leave`),
  uploadResource: (id, data) =>
    api.post(`/api/classrooms/${id}/resources`, data),
  getSessionAnalytics: (id) => api.get(`/api/classrooms/${id}/analytics`),
  removeParticipant: (sessionId, userId) =>
    api.delete(`/api/classrooms/${sessionId}/participants/${userId}`),
};

export const playlistAPI = {
  getPlaylists: () => api.get("/api/playlists"),
  getDefaultPlaylist: () => api.get("/api/playlists/default"),
  getPlaylistById: (id) => api.get(`/api/playlists/${id}`),
  createPlaylist: (data) => api.post("/api/playlists", data),
  updatePlaylist: (id, data) => api.put(`/api/playlists/${id}`, data),
  deletePlaylist: (id) => api.delete(`/api/playlists/${id}`),
  addCourse: (playlistId, courseId) =>
    api.post(`/api/playlists/${playlistId}/courses`, { courseId }),
  removeCourse: (playlistId, courseId) =>
    api.delete(`/api/playlists/${playlistId}/courses/${courseId}`),
  copyPlaylist: (id) => api.post(`/api/playlists/${id}/copy`),
};

export const recordingAPI = {
  uploadRecording: (formData) =>
    api.post("/api/recordings/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getRecordings: () => api.get("/api/recordings"),
  getRecordingsByClassroom: (classroomId) =>
    api.get(`/api/recordings/classroom/${classroomId}`),
  deleteRecording: (id) => api.delete(`/api/recordings/${id}`),
  downloadRecording: (id) =>
    api.get(`/api/recordings/download/${id}`, { responseType: "blob" }),
};

export const dashboardAPI = {
  getStats: () => api.get("/api/dashboard/stats"),
};

export const gamificationAPI = {
  getMyGamification: () => api.get("/api/gamification/me"),
  getLeaderboard: (params) =>
    api.get("/api/gamification/leaderboard", { params }),
  updateStreak: () => api.post("/api/gamification/streak"),
  recordActivity: (data) => api.post("/api/gamification/activity", data),
  getActivities: () => api.get("/api/gamification/activities"),
};

export const progressAPI = {
  getUserLessonProgress: (userId, courseSlug) =>
    api.get(`/api/progress/user/${userId}/course/${courseSlug}`),
  getLessonDetails: (courseSlug, lessonId) =>
    api.get(`/api/progress/lesson/${lessonId}/course/${courseSlug}/details`),
  updateTextProgress: (lessonId, data) =>
    api.put(`/api/progress/lesson/${lessonId}/text`, data),
  updateVideoProgress: (lessonId, data) =>
    api.put(`/api/progress/lesson/${lessonId}/video`, data),
  updateBlockProgress: (lessonId, data) =>
    api.put(`/api/progress/lesson/${lessonId}/block`, data),
  markLessonComplete: (lessonId) =>
    api.put(`/api/progress/lesson/${lessonId}/complete`),
  getCourseProgress: (courseId) => api.get(`/api/progress/course/${courseId}`),
  getTextLessonProgress: (lessonId) =>
    api.get(`/api/progress/lesson/${lessonId}/text`),
  getVideoLessonProgress: (lessonId) =>
    api.get(`/api/progress/lesson/${lessonId}/video`),
  getBlockLessonProgress: (lessonId) =>
    api.get(`/api/progress/lesson/${lessonId}/block`),
  initializeScormSession: (lessonId) =>
    api.post(`/api/progress/lesson/${lessonId}/scorm/initialize`),
  getScormCMIValue: (lessonId, element) =>
    api.get(`/api/progress/lesson/${lessonId}/scorm/cmi?element=${element}`),
  setScormCMIValue: (lessonId, element, value) =>
    api.put(`/api/progress/lesson/${lessonId}/scorm/cmi`, { element, value }),
  commitScormData: (lessonId) =>
    api.post(`/api/progress/lesson/${lessonId}/scorm/commit`),
  getScormLessonProgress: (lessonId) =>
    api.get(`/api/progress/lesson/${lessonId}/scorm`),
  addScormInteraction: (lessonId, interactionData) =>
    api.post(
      `/api/progress/lesson/${lessonId}/scorm/interaction`,
      interactionData,
    ),
  setScormObjective: (lessonId, objectiveData) =>
    api.post(`/api/progress/lesson/${lessonId}/scorm/objective`, objectiveData),
  updateScormProgress: (lessonId, progressData) =>
    api.put(`/api/progress/lesson/${lessonId}/scorm`, progressData),
  submitQuiz: (lessonId, answers) =>
    api.post(`/api/quiz-lessons/${lessonId}/submit`, { answers }),
  getQuizProgress: (lessonId) =>
    api.get(`/api/quiz-lessons/${lessonId}/progress`),
  submitAssignment: (lessonId, submittedFile) =>
    api.post(`/api/assignment-lessons/${lessonId}/submit`, { submittedFile }),
  getAssignmentProgress: (lessonId) =>
    api.get(`/api/assignment-lessons/${lessonId}/progress`),
  markDocumentViewed: (lessonId) =>
    api.post(`/api/document-lessons/${lessonId}/viewed`),
  getDocumentProgress: (lessonId) =>
    api.get(`/api/document-lessons/${lessonId}/progress`),
};

export const chatbotAPI = {
  generateContent: (data) =>
    api.post("http://localhost:8000/api/generate-content", data),
  processContent: (data) =>
    api.post("http://localhost:8000/api/process-content", data),
  generateQuestions: (data) =>
    api.post("http://localhost:8000/api/generate-questions", data),
};

export const notificationAPI = {
  getNotifications: (params) => api.get("/api/notifications", { params }),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/api/notifications/read-all"),
  deleteNotification: (id) => api.delete(`/api/notifications/${id}`),
};

export { api as default };

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Lesson from "./pages/LessonPage";
import AuthForm from "./pages/AuthForm";

import AllCoursesPage from "./pages/AllCoursesPage";
import CreateCoursePage from "./pages/CreateCoursePage";
import ShowCoursePage from "./pages/ShowCoursePage";
import LessonPages_All from "./pages/LessonPages_All";
import CategoryManagement from "./pages/CategoryManagement";
import CourseOverviewPage from "./pages/CourseOverviewPage";
import CourseLearningPage from "./pages/CourseLearningPage";
import UserManagementPage from "./pages/UserManagementPage";
import TeamManagementPage from "./pages/TeamManagementPage";
import TeamDetailsPage from "./pages/TeamDetailsPage";
import TeamChatPage from "./pages/TeamChatPage";
import TeamMeetingPage from "./pages/TeamMeetingPage";
import DepartmentManagementPage from "./pages/DepartmentManagementPage";
import EventManagementPage from "./pages/EventManagementPage";
import UserEnrollmentsPage from "./pages/UserEnrollmentsPage";
import TeamEnrollmentsPage from "./pages/TeamEnrollmentsPage";

import TextLessonEditor from "./components/lessonComponent/TextLessonEditor";
import VideoLessonEditor from "./components/lessonComponent/VideoLessonEditor";
import BlockLessonEditor from "./components/lessonComponent/BlockLessonEditor";
import ScormLessonEditor from "./components/lessonComponent/ScormLessonEditor";
import QuizLessonEditor from "./components/lessonComponent/QuizLessonEditor";
import AssignmentLessonEditor from "./components/lessonComponent/AssignmentLessonEditor";
import DocumentLessonEditor from "./components/lessonComponent/DocumentLessonEditor";
import UserReportsPage from "./pages/UserReportsPage";
import UserDetailReportPage from "./pages/UserDetailReportPage";
import TeamReportsPage from "./pages/TeamReportsPage";
import TeamDetailReportPage from "./pages/TeamDetailReportPage";
import CourseReportsPage from "./pages/CourseReportsPage";
import LessonDetailReportPage from "./pages/LessonDetailReportPage";
import GlobalReportsPage from "./pages/GlobalReportsPage";
import GlobalCourseDetailPage from "./pages/GlobalCourseDetailPage";
import GlobalUserDetailPage from "./pages/GlobalUserDetailPage";
import AssignmentSubmissionsPage from "./pages/AssignmentSubmissionsPage";
import AssignmentGradingPage from "./pages/AssignmentGradingPage";
import AssignmentsListPage from "./pages/AssignmentsListPage";
import InstitutesPage from "./pages/institutes/InstitutesPage";
import InstituteAnalyticsPage from "./pages/institutes/InstituteAnalyticsPage";
import InstitutesDashboard from "./pages/institutes/InstitutesDashboard";
import ClassroomsPage from "./pages/classrooms/ClassroomsPage";
import ProfileSettings from "./pages/ProfileSettings";
import ProfilePage from "./pages/ProfilePage";
import StudentCoursesPage from "./pages/student/StudentCoursesPage";
import StudentClassroomsPage from "./pages/student/StudentClassroomsPage";
import BrowseCoursesPage from "./pages/student/BrowseCoursesPage";
import BrowseClassroomsPage from "./pages/student/BrowseClassroomsPage";
import ClassroomPreviewPage from "./pages/student/ClassroomPreviewPage";
import StudentSessionPage from "./pages/student/StudentSessionPage";
import StudentReportsPage from "./pages/student/StudentReportsPage";
import StudentInstitutePage from "./pages/student/StudentInstitutePage";
import PlaylistsPage from "./pages/student/PlaylistsPage";
import PlaylistDetailPage from "./pages/student/PlaylistDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ClassroomDetailPage from "./pages/classrooms/ClassroomDetailPage";
import ClassroomSessionsPage from "./pages/classrooms/ClassroomSessionsPage";
import ClassroomEnrollmentsPage from "./pages/classrooms/ClassroomEnrollmentsPage";
import ClassroomTeamEnrollmentsPage from "./pages/classrooms/ClassroomTeamEnrollmentsPage";
import ClassroomAttendanceReportPage from "./pages/classrooms/ClassroomAttendanceReportPage";
import SessionAttendanceDetailPage from "./pages/classrooms/SessionAttendanceDetailPage";
import ClassroomEngagementReportPage from "./pages/classrooms/ClassroomEngagementReportPage";
import ClassroomSettingsPage from "./pages/classrooms/ClassroomSettingsPage";
import SessionDetailsPage from "./pages/classrooms/SessionDetailsPage";
import LiveClassroom from "./pages/classrooms/LiveClassroom";
import RecordingsPage from "./pages/RecordingsPage";
import ClassroomRecordingsPage from "./pages/classrooms/ClassroomRecordingsPage";
import TeamRecordingsPage from "./pages/TeamRecordingsPage";
import CertificateDesignerPage from "./pages/CertificateDesignerPage";
import CourseSettingsPage from "./pages/CourseSettingsPage";
import GeneralSettingsPage from "./pages/courseSettings/GeneralSettingsPage";
import CourseResourcesPage from "./pages/courses/CourseResourcesPage";
import AccessSettingsPage from "./pages/courseSettings/AccessSettingsPage";
import CompletionSettingsPage from "./pages/courseSettings/CompletionSettingsPage";
import NotificationsSettingsPage from "./pages/courseSettings/NotificationsSettingsPage";
import GradingSettingsPage from "./pages/courseSettings/GradingSettingsPage";
import AdvancedSettingsPage from "./pages/courseSettings/AdvancedSettingsPage";
import DashboardPage from "./pages/DashboardPage";
import GamificationPage from "./pages/GamificationPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import InstructorRequestsPage from "./pages/InstructorRequestsPage";
import AdminRegistrationPage from "./pages/AdminRegistrationPage";
import AdminInstitutePage from "./pages/AdminInstitutePage";
import { clearLessonData } from "./store/slices/lessonSlice";
import { useSelector } from "react-redux";
import { useNotificationSocket } from "./hooks/useNotificationSocket";

function AppContent() {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUser = useSelector((state) => state.user.user);
  
  useNotificationSocket();

  useEffect(() => {
    const lessonRoutes = ["/course-overview/", "-lesson/"];
    const enrollmentRoutes = ["/enrollments/"];
    const isLessonRoute = lessonRoutes.some((route) =>
      location.pathname.includes(route)
    );
    const isEnrollmentRoute = enrollmentRoutes.some((route) =>
      location.pathname.includes(route)
    );

    if (!isLessonRoute && !isEnrollmentRoute) {
      dispatch(clearLessonData());
    }
  }, [location.pathname, dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/join-admin" element={<AdminRegistrationPage />} />
      <Route path="/auth" element={<AuthForm />} />
      <Route path="/all-courses" element={<BrowseCoursesPage />} />
      <Route path="/all-classrooms" element={<BrowseClassroomsPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
      <Route path="/course-preview/:slug" element={<ShowCoursePage />} />
      <Route path="/learn/:courseId" element={<ProtectedRoute><CourseLearningPage /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'instructor']}><CategoryManagement /></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute><CreateCoursePage /></ProtectedRoute>} />
      <Route path="/my-courses" element={<ProtectedRoute><StudentCoursesPage /></ProtectedRoute>} />
      <Route path="/my-reports" element={<ProtectedRoute><StudentReportsPage /></ProtectedRoute>} />
      <Route path="/my-institute" element={<ProtectedRoute><StudentInstitutePage /></ProtectedRoute>} />
      <Route path="/admin/institute" element={<ProtectedRoute allowedRoles={['admin']}><AdminInstitutePage /></ProtectedRoute>} />
      <Route path="/playlists" element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>} />
      <Route path="/playlists/:playlistId" element={<ProtectedRoute><PlaylistDetailPage /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'instructor', 'student']}><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/settings" element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'instructor', 'student']}><ProfileSettings /></ProtectedRoute>} />
      <Route path="/course-overview/settings" element={<ProtectedRoute><CourseOverviewPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/settings/general" element={<ProtectedRoute><GeneralSettingsPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/settings/access" element={<ProtectedRoute><AccessSettingsPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/settings/completion" element={<ProtectedRoute><CompletionSettingsPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/settings/certificate" element={<ProtectedRoute><CourseSettingsPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/settings/notifications" element={<ProtectedRoute><NotificationsSettingsPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/settings/grading" element={<ProtectedRoute><GradingSettingsPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/settings/advanced" element={<ProtectedRoute><AdvancedSettingsPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/resources" element={<ProtectedRoute><CourseResourcesPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/enrollments/users" element={<ProtectedRoute><UserEnrollmentsPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/enrollments/teams" element={<ProtectedRoute><TeamEnrollmentsPage /></ProtectedRoute>} />

      <Route path="/users" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><UserManagementPage /></ProtectedRoute>} />
      <Route path="/users/:role" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><UserManagementPage /></ProtectedRoute>} />
      <Route path="/instructors" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><UserManagementPage /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><UserManagementPage /></ProtectedRoute>} />
      <Route path="/teams" element={<ProtectedRoute><TeamManagementPage /></ProtectedRoute>} />
      <Route path="/teams/:teamId" element={<ProtectedRoute><TeamChatPage /></ProtectedRoute>} />
      <Route path="/teams/:teamId/settings" element={<ProtectedRoute><TeamDetailsPage /></ProtectedRoute>} />
      <Route path="/teams/:teamId/meeting" element={<ProtectedRoute><TeamMeetingPage /></ProtectedRoute>} />
      <Route path="/teams/:teamId/recordings" element={<ProtectedRoute><TeamRecordingsPage /></ProtectedRoute>} />
      <Route path="/departments" element={<ProtectedRoute><DepartmentManagementPage /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><EventManagementPage /></ProtectedRoute>} />
      <Route path="/admin/instructor-requests" element={<ProtectedRoute allowedRoles={['superadmin']}><InstructorRequestsPage /></ProtectedRoute>} />

      <Route path="/enrollments/learners" element={<ProtectedRoute><UserEnrollmentsPage /></ProtectedRoute>} />
      <Route path="/enrollments/teams" element={<ProtectedRoute><TeamEnrollmentsPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/reports/users" element={<ProtectedRoute><UserReportsPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/reports/users/:userId" element={<ProtectedRoute><UserDetailReportPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/reports/teams" element={<ProtectedRoute><TeamReportsPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/reports/teams/:teamId" element={<ProtectedRoute><TeamDetailReportPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/reports/course" element={<ProtectedRoute><CourseReportsPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/reports/lesson/:lessonId" element={<ProtectedRoute><LessonDetailReportPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'instructor']}><GlobalReportsPage /></ProtectedRoute>} />
      <Route path="/reports/course/:courseId" element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'instructor']}><GlobalCourseDetailPage /></ProtectedRoute>} />
      <Route path="/reports/user/:userId" element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'instructor']}><GlobalUserDetailPage /></ProtectedRoute>} />
      <Route path="/institutes" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><InstitutesPage /></ProtectedRoute>} />
      <Route path="/institutes/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><InstitutesDashboard /></ProtectedRoute>} />
      <Route path="/institutes/:id/analytics" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><InstituteAnalyticsPage /></ProtectedRoute>} />
      <Route path="/classrooms" element={<ProtectedRoute><ClassroomsPage /></ProtectedRoute>} />
      <Route path="/my-classrooms" element={<ProtectedRoute><StudentClassroomsPage /></ProtectedRoute>} />
      <Route path="/classroom-preview/:classroomId" element={<ProtectedRoute><ClassroomPreviewPage /></ProtectedRoute>} />
      <Route path="/classroom/:classroomId" element={<ProtectedRoute><ClassroomDetailPage /></ProtectedRoute>} />
      <Route path="/classroom/:classroomId/session/:sessionId" element={<ProtectedRoute><StudentSessionPage /></ProtectedRoute>} />
      <Route path="/classroom/:classroomId/sessions" element={<ProtectedRoute><ClassroomSessionsPage /></ProtectedRoute>} />
      <Route path="/classroom/:classroomId/enrollments/students" element={<ProtectedRoute><ClassroomEnrollmentsPage /></ProtectedRoute>} />
      <Route path="/classroom/:classroomId/enrollments/teams" element={<ProtectedRoute><ClassroomTeamEnrollmentsPage /></ProtectedRoute>} />
      <Route path="/classroom/:classroomId/reports/attendance" element={<ProtectedRoute><ClassroomAttendanceReportPage /></ProtectedRoute>} />
      <Route path="/classroom/:classroomId/session/:sessionId/attendance" element={<ProtectedRoute><SessionAttendanceDetailPage /></ProtectedRoute>} />
      <Route path="/sessions/:sessionId/attendance" element={<ProtectedRoute><SessionAttendanceDetailPage /></ProtectedRoute>} />
      <Route path="/classroom/:classroomId/reports/engagement" element={<ProtectedRoute><ClassroomEngagementReportPage /></ProtectedRoute>} />
      <Route path="/classroom/:classroomId/recordings" element={<ProtectedRoute><ClassroomRecordingsPage /></ProtectedRoute>} />
      <Route path="/classroom/:classroomId/settings" element={<ProtectedRoute><ClassroomSettingsPage /></ProtectedRoute>} />
      <Route path="/classrooms/:sessionId" element={<ProtectedRoute><SessionDetailsPage /></ProtectedRoute>} />
      <Route path="/classrooms/:sessionId/live" element={<ProtectedRoute><LiveClassroom /></ProtectedRoute>} />
      <Route path="/recordings" element={<ProtectedRoute><RecordingsPage /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute><CertificateDesignerPage /></ProtectedRoute>} />
      <Route path="/assignment-lesson/:lessonId/submissions" element={<ProtectedRoute><AssignmentSubmissionsPage /></ProtectedRoute>} />

      <Route path="/course-overview/:slug/assignments" element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'instructor']}><AssignmentsListPage /></ProtectedRoute>} />
      <Route path="/course-overview/:slug/assignment/:lessonId/grade" element={<ProtectedRoute allowedRoles={['admin', 'superadmin', 'instructor']}><AssignmentGradingPage /></ProtectedRoute>} />

      <Route path="/text-lesson/:lessonId" element={<ProtectedRoute><TextLessonEditor /></ProtectedRoute>} />
      <Route path="/video-lesson/:lessonId" element={<ProtectedRoute><VideoLessonEditor /></ProtectedRoute>} />
      <Route path="/block-lesson/:lessonId" element={<ProtectedRoute><BlockLessonEditor /></ProtectedRoute>} />
      <Route path="/scorm-lesson/:lessonId" element={<ProtectedRoute><ScormLessonEditor /></ProtectedRoute>} />
      <Route path="/quiz-lesson/:lessonId" element={<ProtectedRoute><QuizLessonEditor /></ProtectedRoute>} />
      <Route path="/assignment-lesson/:lessonId" element={<ProtectedRoute><AssignmentLessonEditor /></ProtectedRoute>} />
      <Route path="/document-lesson/:lessonId" element={<ProtectedRoute><DocumentLessonEditor /></ProtectedRoute>} />
    </Routes>
  );
}

const App = () => {
  return (
    <div>
      <Router>
        <AppContent />
      </Router>
    </div>
  );
};
export default App;

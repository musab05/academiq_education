import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  Video,
  Users,
  Calendar,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { classroomManagementAPI, classroomAPI } from "../../services/api";
import {
  setCurrentClassroom,
  setCurrentClassroomData,
} from "../../store/slices/classroomSlice";
import CreateSessionModal from "./CreateSessionModal";
import EditSessionModal from "./EditSessionModal";
import { useNotification } from "../../context/NotificationContext";

const ClassroomDetailPage = () => {
  const { classroomId } = useParams();
  const dispatch = useDispatch();
  const [classroom, setClassroom] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const currentUser = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Check if current user can manage this classroom (context-specific role)
  const canManageClassroom = () => {
    if (!currentUser || !classroom) return false;
    // Superadmin can manage any classroom
    if (currentUser.role === "superadmin") return true;
    // Check if user is the instructor of this classroom
    if (
      classroom.instructor?._id === currentUser._id ||
      classroom.instructor === currentUser._id
    )
      return true;
    // Check if user is the creator of this classroom
    if (
      classroom.createdBy?._id === currentUser._id ||
      classroom.createdBy === currentUser._id
    )
      return true;
    // Check if user is the institute admin (if classroom belongs to an institute)
    if (
      classroom.institute?.admin === currentUser._id ||
      classroom.institute?.admin?._id === currentUser._id
    )
      return true;
    return false;
  };

  // Check if user is a student of this classroom (enrolled)
  const isStudentOfClassroom = () => {
    if (!currentUser || !classroom) return false;
    return classroom.enrolledStudents?.some(
      (id) => id === currentUser._id || id?._id === currentUser._id,
    );
  };

  useEffect(() => {
    // Set the current classroom ID in Redux store immediately
    dispatch(setCurrentClassroom(classroomId));
    fetchClassroom();
    fetchSessions();
  }, [classroomId, dispatch]);

  const fetchClassroom = async () => {
    try {
      // Try to find the classroom in both enrolled and managed classrooms
      let found = null;

      // First check enrolled classrooms (my-classrooms)
      try {
        const enrolledResponse = await classroomManagementAPI.getMyClassrooms();
        found = enrolledResponse.data.find((c) => c._id === classroomId);
      } catch (err) {
        console.error("Error fetching enrolled classrooms:", err);
      }

      // If not found in enrolled, check managed classrooms (for instructors/admins)
      if (!found && currentUser?.role !== "student") {
        try {
          const managedResponse = await classroomManagementAPI.getAll();
          found = managedResponse.data.find((c) => c._id === classroomId);
        } catch (err) {
          console.error("Error fetching managed classrooms:", err);
        }
      }

      if (!found) {
        showNotification({
          type: "error",
          message: "Classroom not found or you do not have access",
        });
        navigate(
          currentUser?.role === "student" ? "/my-classrooms" : "/classrooms",
        );
        return;
      }

      setClassroom(found);
      dispatch(setCurrentClassroomData(found));
    } catch (error) {
      console.error("Error fetching classroom:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await classroomAPI.getSessions({ classroomId });
      setSessions(response.data);

      if (currentUser?.role === "student") {
        const now = new Date();

        const attendance = response.data.map((session) => {
          const userAttendance = session.attendance?.find(
            (a) =>
              a.user?._id === currentUser._id || a.user === currentUser._id,
          );
          const isEnded = new Date(session.endTime) < now;
          return {
            sessionId: session._id,
            sessionTitle: session.title,
            sessionDate: session.startTime,
            attended: !!userAttendance,
            duration: userAttendance?.duration || 0,
            joinTime: userAttendance?.joinTime,
            leaveTime: userAttendance?.leaveTime,
            isEnded,
          };
        });
        setStudentAttendance(attendance);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const handleEditSession = (session, e) => {
    e.stopPropagation(); // Prevent navigation to session details
    setEditingSession(session);
    setShowEditModal(true);
  };

  const handleUpdateSession = async (updateData) => {
    try {
      await classroomAPI.updateSession(editingSession._id, updateData);
      fetchSessions(); // Refresh the sessions list
      setShowEditModal(false);
      setEditingSession(null);
    } catch (error) {
      console.error("Error updating session:", error);
      throw error; // Re-throw to handle in the modal
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation(); // Prevent navigation to session details

    if (
      !window.confirm(
        "Are you sure you want to delete this session? This action cannot be undone. Note: Attendance records will be preserved for reporting purposes.",
      )
    ) {
      return;
    }

    setDeleting(sessionId);
    try {
      await classroomAPI.deleteSession(sessionId);
      showNotification({
        type: "success",
        message: "Session deleted successfully",
      });
      fetchSessions(); // Refresh the sessions list
    } catch (error) {
      console.error("Error deleting session:", error);
      showNotification({
        type: "error",
        message: error.response?.data?.error || "Failed to delete session",
      });
    } finally {
      setDeleting(null);
    }
  };

  // Check if current user can edit/delete sessions
  const canModifySession = (session) => {
    if (!currentUser || !session) return false;

    return (
      currentUser.role === "superadmin" ||
      session.instructor?._id === currentUser._id ||
      (currentUser.role === "admin" &&
        session.institute?.toString() === currentUser.institute?.toString())
    );
  };

  // Check if session has ended
  const isSessionEnded = (session) => {
    const now = new Date();
    const endTime = new Date(session.endTime);
    return endTime < now;
  };

  // Handle session navigation with access control
  const handleSessionClick = (session) => {
    if (isSessionEnded(session)) {
      showNotification({
        type: "warning",
        message: "This session has ended and is no longer accessible",
      });
      return;
    }
    navigate(`/classrooms/${session._id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!classroom) {
    return <div>Classroom not found</div>;
  }

  const totalSessions = sessions.length;
  const attendedSessions = studentAttendance.filter((a) => a.attended).length;
  const attendanceRate =
    totalSessions > 0
      ? Math.round((attendedSessions / totalSessions) * 100)
      : 0;
  const totalMinutes = studentAttendance.reduce(
    (sum, a) => sum + a.duration,
    0,
  );
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {canManageClassroom() && (
        <Sidebar
          collapsed={sidebarCollapsed}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {canManageClassroom() ? (
          <Header
            onMenuClick={() => {
              setSidebarCollapsed(!sidebarCollapsed);
              setSidebarOpen(!sidebarOpen);
            }}
          />
        ) : (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 sm:px-6 py-4 sm:py-6">
            <button
              onClick={() => navigate("/my-classrooms")}
              className="tap-target flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-3 sm:mb-4"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">
                Back to My Classrooms
              </span>
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              {classroom.title}
            </h1>
            <p className="text-white/90 text-sm sm:text-base">
              {classroom.description}
            </p>
          </div>
        )}

        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {canManageClassroom() && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col lg:flex-row items-start gap-4 lg:justify-between">
                  <div className="flex-1 w-full lg:w-auto">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {classroom.title}
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {classroom.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>
                          {classroom.enrolledStudents?.length || 0} enrolled
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                        <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{sessions.length} sessions</span>
                      </div>
                      {classroom.institute && (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                          {classroom.institute.name}
                        </span>
                      )}
                      {classroom.department && (
                        <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium">
                          {classroom.department.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="tap-target w-full lg:w-auto px-4 py-2.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Schedule Session
                  </button>
                </div>
              </div>
            )}

            {!canManageClassroom() && isStudentOfClassroom() && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 -mt-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {totalSessions}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Total Sessions
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {attendedSessions}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Attended</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {attendanceRate}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Attendance Rate
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {totalHours}h {remainingMinutes}m
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Total Time</p>
                </motion.div>
              </div>
            )}

            {!canManageClassroom() && isStudentOfClassroom() ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  My Attendance
                </h2>
                {studentAttendance.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">
                      No sessions scheduled yet
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">
                            Session
                          </th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">
                            Date
                          </th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">
                            Status
                          </th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">
                            Duration
                          </th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 hidden xl:table-cell">
                            Join Time
                          </th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700 hidden xl:table-cell">
                            Leave Time
                          </th>
                          <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentAttendance.map((attendance, index) => (
                          <motion.tr
                            key={attendance.sessionId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 sm:py-4 px-2 sm:px-4">
                              <p
                                className="font-medium text-gray-900 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none"
                                title={attendance.sessionTitle}
                              >
                                {attendance.sessionTitle}
                              </p>
                              <p className="text-xs text-gray-500 md:hidden mt-1">
                                {new Date(
                                  attendance.sessionDate,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                              {new Date(
                                attendance.sessionDate,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4">
                              {attendance.attended ? (
                                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                                  <span className="hidden sm:inline">
                                    Attended
                                  </span>
                                  <span className="sm:hidden">✓</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></div>
                                  <span className="hidden sm:inline">
                                    Absent
                                  </span>
                                  <span className="sm:hidden">✗</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 hidden lg:table-cell">
                              {attendance.attended ? (
                                <span className="font-medium">
                                  {Math.floor(attendance.duration / 60)}h{" "}
                                  {attendance.duration % 60}m
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 hidden xl:table-cell">
                              {attendance.joinTime ? (
                                new Date(
                                  attendance.joinTime,
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 hidden xl:table-cell">
                              {attendance.leaveTime ? (
                                new Date(
                                  attendance.leaveTime,
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4">
                              {!attendance.isEnded ? (
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/classroom/${classroomId}/session/${attendance.sessionId}`,
                                    )
                                  }
                                  className="tap-target px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium"
                                >
                                  View
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  Ended
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Sessions
                </h2>
                {sessions.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">
                      No sessions scheduled yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {sessions.map((session) => {
                      const sessionEnded = isSessionEnded(session);
                      return (
                        <div
                          key={session._id}
                          onClick={() => handleSessionClick(session)}
                          className={`p-3 sm:p-4 border border-gray-200 rounded-lg transition-all group ${
                            sessionEnded
                              ? "opacity-60 cursor-not-allowed bg-gray-50"
                              : "hover:border-orange-500 cursor-pointer"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start gap-3 sm:justify-between">
                            <div className="flex-1 w-full sm:w-auto min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3
                                  className={`font-semibold text-sm sm:text-base truncate ${sessionEnded ? "text-gray-500" : "text-gray-900"}`}
                                >
                                  {session.title}
                                </h3>
                                {sessionEnded && (
                                  <span className="px-2 py-0.5 sm:py-1 bg-red-100 text-red-600 text-xs font-medium rounded flex-shrink-0">
                                    ENDED
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-xs sm:text-sm mt-1 line-clamp-2 ${sessionEnded ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {session.description}
                              </p>
                              <div
                                className={`flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm ${sessionEnded ? "text-gray-400" : "text-gray-500"}`}
                              >
                                <span>
                                  {new Date(
                                    session.startTime,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                                <span>
                                  {new Date(
                                    session.startTime,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span className="hidden sm:inline">→</span>
                                <span>
                                  {new Date(session.endTime).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                                <span className="hidden md:inline">
                                  {session.attendance?.filter(
                                    (a) => !a.leaveTime,
                                  ).length || 0}{" "}
                                  / {session.maxParticipants} participants
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                              <span
                                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                                  sessionEnded
                                    ? "bg-red-100 text-red-800"
                                    : session.status === "live"
                                      ? "bg-green-100 text-green-800"
                                      : session.status === "upcoming"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {sessionEnded ? "ended" : session.status}
                              </span>

                              {canModifySession(session) && !sessionEnded && (
                                <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) =>
                                      handleEditSession(session, e)
                                    }
                                    className="tap-target p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                    title="Edit Session"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleDeleteSession(session._id, e)
                                    }
                                    disabled={deleting === session._id}
                                    className="tap-target p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Delete Session"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateSessionModal
          classroomId={classroomId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchSessions();
          }}
        />
      )}

      {showEditModal && editingSession && (
        <EditSessionModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingSession(null);
          }}
          session={editingSession}
          onUpdate={handleUpdateSession}
        />
      )}
    </div>
  );
};

export default ClassroomDetailPage;

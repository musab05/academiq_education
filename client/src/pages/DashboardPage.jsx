import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setCourseListSource } from "../store/slices/navigationSlice";
import {
  BookOpen,
  Users,
  Video,
  TrendingUp,
  Clock,
  Award,
  BarChart3,
  Calendar,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { dashboardAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrollments: [],
    teams: 0,
    classrooms: 0,
    recentActivity: [],
    roleStats: null,
    userRole: null,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      showNotification({ type: "error", message: "Failed to load dashboard" });
    } finally {
      setLoading(false);
    }
  };

  const colorStyles = {
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      border: "hover:border-orange-300",
      gradient: "from-orange-500 to-red-500",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "hover:border-blue-300",
      gradient: "from-blue-500 to-blue-600",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      border: "hover:border-purple-300",
      gradient: "from-purple-500 to-purple-600",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-600",
      border: "hover:border-green-300",
      gradient: "from-green-500 to-green-600",
    },
  };

  const StatCard = ({ icon: Icon, title, value, color, onClick, subtitle }) => {
    const styles = colorStyles[color] || colorStyles.orange;
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 cursor-pointer ${styles.border} transition-all shadow-sm hover:shadow-lg group`}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 ${styles.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
          >
            <Icon className={`w-6 h-6 ${styles.text}`} />
          </div>
          {onClick && (
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
        <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
          {value}
        </h3>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          onMenuClick={() => {
            setSidebarCollapsed(!sidebarCollapsed);
            setSidebarOpen(!sidebarOpen);
          }}
        />

        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative z-10">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                    Welcome back, {user?.firstName}! 👋
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base md:text-lg">
                    Here's your learning overview for today
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
            >
              <StatCard
                icon={BookOpen}
                title="Enrolled Courses"
                value={stats.enrollments.length}
                color="orange"
                onClick={() => navigate("/my-courses")}
                subtitle="Click to view all"
              />
              <StatCard
                icon={Users}
                title="My Teams"
                value={stats.teams}
                color="blue"
                onClick={() => navigate("/teams")}
                subtitle="Collaborate together"
              />
              <StatCard
                icon={Video}
                title="Classrooms"
                value={stats.classrooms}
                color="purple"
                onClick={() => navigate("/my-classrooms")}
                subtitle="Live sessions"
              />
              <StatCard
                icon={TrendingUp}
                title="Avg Progress"
                value={`${Math.round(stats.enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / (stats.enrollments.length || 1))}%`}
                color="green"
                subtitle="Keep learning!"
              />
            </motion.div>

            {/* Role-Specific Stats */}
            {(user?.role === "admin" || user?.role === "superadmin") &&
              stats.roleStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 mb-6 sm:mb-8 shadow-sm"
                >
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Platform Overview
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg sm:rounded-xl">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                        {stats.roleStats.totalUsers}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">
                        Total Users
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                        {stats.roleStats.totalCourses}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">
                        Total Courses
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl">
                      <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                        {stats.roleStats.totalEnrollments}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">
                        Enrollments
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600">
                        {stats.roleStats.totalTeams}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">
                        Teams
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            {/* Instructor Stats */}
            {user?.role === "instructor" && stats.roleStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 mb-6 sm:mb-8 shadow-sm"
              >
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Teaching Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg sm:rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                      {stats.roleStats.myCourses}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      My Courses
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                      {stats.roleStats.totalStudents}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      Total Students
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                      {stats.roleStats.totalEnrollments}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      Enrollments
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">
                      {stats.roleStats.myClassrooms}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      My Classrooms
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Progress */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">
                        My Courses
                      </h2>
                    </div>
                    <button
                      onClick={() => navigate("/my-courses")}
                      className="text-orange-500 hover:text-orange-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      View All
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {stats.enrollments.slice(0, 5).map((course, index) => (
                      <motion.div
                        key={course.courseId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.01 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all cursor-pointer group"
                        onClick={() => {
                          dispatch(setCourseListSource("/dashboard"));
                          navigate(`/learn/${course.courseId}`);
                        }}
                      >
                        <div className="relative w-full sm:w-20 h-32 sm:h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={course.thumbnail || "/placeholder-course.jpg"}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {course.progress === 100 && (
                            <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                              <Award className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                          <h3 className="font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                            {course.title}
                          </h3>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>
                                {course.completed || 0} of {course.total || 0}{" "}
                                lessons
                              </span>
                              <span className="font-bold text-gray-700">
                                {course.progress || 0}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress || 0}%` }}
                                transition={{
                                  duration: 0.5,
                                  delay: 0.2 + index * 0.1,
                                }}
                                className={`h-2 rounded-full ${course.progress === 100 ? "bg-green-500" : "bg-gradient-to-r from-orange-500 to-red-500"}`}
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setCourseListSource("/dashboard"));
                            navigate(`/learn/${course.courseId}`);
                          }}
                          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm flex-shrink-0 transition-all ${
                            course.progress === 100
                              ? "bg-green-500 hover:bg-green-600 text-white"
                              : course.hasStarted
                                ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
                                : "bg-gray-900 hover:bg-gray-800 text-white"
                          }`}
                        >
                          {course.progress === 100
                            ? "Review"
                            : course.hasStarted
                              ? "Continue"
                              : "Start"}
                        </button>
                      </motion.div>
                    ))}
                    {stats.enrollments.length === 0 && (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          No courses yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Start your learning journey today!
                        </p>
                        <button
                          onClick={() => navigate("/all-courses")}
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 font-semibold shadow-lg shadow-orange-500/25 transition-all"
                        >
                          Browse Courses
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Recent Activity
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer"
                        onClick={() =>
                          activity.course &&
                          navigate(`/learn/${activity.course._id}`)
                        }
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {activity.lesson?.title || "Unknown lesson"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.course?.title && (
                              <span className="text-orange-500">
                                {activity.course.title}
                              </span>
                            )}
                            {activity.course?.title && " • "}
                            {new Date(activity.updatedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {stats.recentActivity.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Clock className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">
                          No recent activity
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Start a course to see your progress here
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

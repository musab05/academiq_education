import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  Star,
  BookOpen,
  Clock,
  Play,
  CheckCircle2,
  Filter,
  X,
  GraduationCap,
  Trophy,
} from "lucide-react";
import AddToPlaylistButton from "../../components/playlist/AddToPlaylistButton";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { courseAPI } from "../../services/api";
import { setCurrentCourse } from "../../store/slices/lessonSlice";
import { pushNavigation } from "../../store/slices/navigationSlice";
import thumbnail from "../../public/images/thumbnail.jpg";

const StudentCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await courseAPI.getEnrolledCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncEnrollments = async () => {
    setSyncing(true);
    try {
      await courseAPI.syncInstituteEnrollments();
      await fetchEnrolledCourses();
    } catch (error) {
      console.error("Error syncing enrollments:", error);
    } finally {
      setSyncing(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        !searchTerm ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "in-progress" &&
          course.progress > 0 &&
          course.progress < 100) ||
        (activeFilter === "completed" && course.progress === 100) ||
        (activeFilter === "not-started" &&
          (!course.progress || course.progress === 0));

      return matchesSearch && matchesFilter;
    });
  }, [courses, searchTerm, activeFilter]);

  const stats = useMemo(
    () => ({
      total: courses.length,
      completed: courses.filter((c) => c.progress === 100).length,
      inProgress: courses.filter((c) => c.progress > 0 && c.progress < 100)
        .length,
      notStarted: courses.filter((c) => !c.progress || c.progress === 0).length,
    }),
    [courses],
  );

  const filterTabs = [
    { id: "all", label: "All Courses", count: stats.total, icon: BookOpen },
    {
      id: "in-progress",
      label: "In Progress",
      count: stats.inProgress,
      icon: Clock,
    },
    {
      id: "completed",
      label: "Completed",
      count: stats.completed,
      icon: CheckCircle2,
    },
    {
      id: "not-started",
      label: "Not Started",
      count: stats.notStarted,
      icon: Play,
    },
  ];

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-orange-50/30 min-h-screen">
      <Sidebar
        collapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header
          onMenuClick={() => {
            setSidebarCollapsed(!sidebarCollapsed);
            setSidebarOpen(!sidebarOpen);
          }}
        />

        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white">
                      <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    My Courses
                  </h1>
                  <p className="mt-1 text-gray-600 text-sm sm:text-base">
                    Track your learning progress and continue where you left off
                  </p>
                </div>
                {user?.institute && (
                  <button
                    onClick={handleSyncEnrollments}
                    disabled={syncing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-sm font-medium shadow-lg shadow-orange-500/25 transition-all tap-target"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
                    />
                    Sync Institute Courses
                  </button>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {[
                {
                  label: "Total Enrolled",
                  value: stats.total,
                  icon: BookOpen,
                  color: "from-blue-500 to-blue-600",
                },
                {
                  label: "In Progress",
                  value: stats.inProgress,
                  icon: Clock,
                  color: "from-orange-500 to-red-500",
                },
                {
                  label: "Completed",
                  value: stats.completed,
                  icon: Trophy,
                  color: "from-green-500 to-emerald-600",
                },
                {
                  label: "Not Started",
                  value: stats.notStarted,
                  icon: Play,
                  color: "from-gray-500 to-gray-600",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}
                    >
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search your courses..."
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeFilter === tab.id
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs ${
                          activeFilter === tab.id
                            ? "bg-white/20"
                            : "bg-gray-200"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredCourses.length}
                </span>{" "}
                course{filteredCourses.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Course Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500">Loading your courses...</p>
                </div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-16 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || activeFilter !== "all"
                    ? "No courses found"
                    : "No enrolled courses yet"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm || activeFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Start your learning journey by enrolling in courses or contact your instructor"}
                </p>
                {(searchTerm || activeFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setActiveFilter("all");
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredCourses.map((course, index) => (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        dispatch(setCurrentCourse(course._id));
                        dispatch(pushNavigation("/my-courses"));
                        navigate(`/course-preview/${course.slug}`);
                      }}
                    >
                      <div className="relative">
                        <img
                          src={course.thumbnail || thumbnail}
                          alt={course.title}
                          className="w-full h-40 sm:h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = thumbnail;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Completion Badge */}
                        {course.progress === 100 && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-2 shadow-lg"
                          >
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </motion.div>
                        )}

                        {/* Playlist Button */}
                        <div
                          className="absolute top-3 right-3 z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AddToPlaylistButton
                            courseId={course._id}
                            compact={true}
                          />
                        </div>

                        {/* Progress Overlay */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex items-center justify-between text-white text-xs mb-1.5">
                            <span className="font-medium">
                              {course.progress === 100
                                ? "Completed!"
                                : "Progress"}
                            </span>
                            <span className="font-bold">
                              {Math.round(course.progress || 0)}%
                            </span>
                          </div>
                          <div className="w-full bg-white/30 rounded-full h-1.5 backdrop-blur-sm">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${course.progress || 0}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className={`h-1.5 rounded-full ${
                                course.progress === 100
                                  ? "bg-gradient-to-r from-green-400 to-emerald-400"
                                  : "bg-gradient-to-r from-orange-400 to-red-400"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              course.level === "beginner"
                                ? "bg-green-100 text-green-700"
                                : course.level === "intermediate"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {course.level || "All Levels"}
                          </span>
                          {course.categories?.[0] && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 truncate max-w-24">
                              {course.categories[0].name ||
                                course.categories[0]}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {course.title}
                        </h3>

                        <p className="text-xs text-gray-500 mb-3">
                          by{" "}
                          <span className="font-medium text-gray-700">
                            {course.author?.firstName} {course.author?.lastName}
                          </span>
                        </p>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {course.description || "No description available"}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium text-gray-700">
                              {course.rating || "4.5"}
                            </span>
                          </div>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-xs font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-sm">
                            <Play className="w-3.5 h-3.5" />
                            {course.progress > 0 ? "Continue" : "Start"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCoursesPage;

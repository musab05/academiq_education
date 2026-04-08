import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Calendar,
  Users,
  Play,
  Search,
  X,
  Monitor,
  Clock,
  Radio,
  CheckCircle2,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { classroomManagementAPI } from "../../services/api";
import {
  setCurrentClassroom,
  setCurrentClassroomData,
} from "../../store/slices/classroomSlice";

const StudentClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledClassrooms();
  }, []);

  const fetchEnrolledClassrooms = async () => {
    try {
      const response = await classroomManagementAPI.getMyClassrooms();
      setClassrooms(response.data || []);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClassroom = (classroom) => {
    dispatch(setCurrentClassroom(classroom._id));
    dispatch(setCurrentClassroomData(classroom));
    navigate(`/classroom/${classroom._id}`);
  };

  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((classroom) => {
      const matchesSearch =
        !searchTerm ||
        classroom.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classroom.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "active" && classroom.status === "active") ||
        (activeFilter === "live" && classroom.isLive);

      return matchesSearch && matchesFilter;
    });
  }, [classrooms, searchTerm, activeFilter]);

  const stats = useMemo(
    () => ({
      total: classrooms.length,
      active: classrooms.filter((c) => c.status === "active").length,
      live: classrooms.filter((c) => c.isLive).length,
    }),
    [classrooms],
  );

  const filterTabs = [
    { id: "all", label: "All", count: stats.total, icon: Video },
    { id: "active", label: "Active", count: stats.active, icon: CheckCircle2 },
    { id: "live", label: "Live Now", count: stats.live, icon: Radio },
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white">
                  <Monitor className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                My Classrooms
              </h1>
              <p className="mt-1 text-gray-600 text-sm sm:text-base">
                Join live sessions and interact with your instructors
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
              {[
                {
                  label: "Total Enrolled",
                  value: stats.total,
                  icon: Video,
                  color: "from-blue-500 to-blue-600",
                },
                {
                  label: "Active",
                  value: stats.active,
                  icon: CheckCircle2,
                  color: "from-green-500 to-emerald-600",
                },
                {
                  label: "Live Now",
                  value: stats.live,
                  icon: Radio,
                  color: "from-red-500 to-pink-600",
                  pulse: stats.live > 0,
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${stat.pulse ? "ring-2 ring-red-500/20" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white ${stat.pulse ? "animate-pulse" : ""}`}
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
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search classrooms..."
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
                <div className="flex gap-2">
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
                      <tab.icon
                        className={`w-4 h-4 ${tab.id === "live" && stats.live > 0 ? "animate-pulse" : ""}`}
                      />
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
                  {filteredClassrooms.length}
                </span>{" "}
                classroom{filteredClassrooms.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Classrooms Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500">Loading your classrooms...</p>
                </div>
              </div>
            ) : filteredClassrooms.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-16 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                  <Video className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || activeFilter !== "all"
                    ? "No classrooms found"
                    : "No enrolled classrooms yet"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm || activeFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Contact your instructor to get enrolled in live sessions"}
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
                  {filteredClassrooms.map((classroom, index) => (
                    <motion.div
                      key={classroom._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300"
                    >
                      {/* Header with gradient */}
                      <div className="relative h-32 bg-gradient-to-br from-orange-500 to-red-600 p-4">
                        <div className="absolute inset-0 bg-black/10" />

                        {/* Live Badge */}
                        {classroom.isLive && (
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white rounded-full text-xs font-medium animate-pulse">
                            <Radio className="w-3 h-3" />
                            LIVE
                          </div>
                        )}

                        {/* Status Badge */}
                        <div
                          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                            classroom.status === "active"
                              ? "bg-green-500 text-white"
                              : "bg-gray-500 text-white"
                          }`}
                        >
                          {classroom.status || "Active"}
                        </div>

                        {/* Icon */}
                        <div className="absolute bottom-4 left-4">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Video className="w-7 h-7 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                          {classroom.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {classroom.description || "No description available"}
                        </p>

                        {/* Info Row */}
                        <div className="flex flex-wrap gap-3 mb-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>
                              {classroom.enrolledStudents?.length || 0} students
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {classroom.sessions?.length || 0} sessions
                            </span>
                          </div>
                        </div>

                        {/* Instructor Info */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {classroom.instructor?.firstName?.[0]}
                            {classroom.instructor?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {classroom.instructor?.firstName}{" "}
                              {classroom.instructor?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">Instructor</p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => handleOpenClassroom(classroom)}
                          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                            classroom.isLive
                              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-pink-600"
                              : "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-red-600"
                          }`}
                        >
                          {classroom.isLive ? (
                            <>
                              <Radio className="w-4 h-4 animate-pulse" />
                              Join Live Session
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              View Sessions
                            </>
                          )}
                        </button>
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

export default StudentClassroomsPage;

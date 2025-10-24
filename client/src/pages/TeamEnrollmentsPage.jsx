import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  UserPlus,
  ChevronRight,
  User,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import CustomEnrollmentModal from "../components/enrollment/CustomEnrollmentModal";
import { enrollmentAPI, teamAPI, courseAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import {
  setTeamEnrollments,
  setLoading,
  setError,
  setPagination,
  setFilters,
  clearFilters,
} from "../store/slices/enrollmentSlice";
import { setCurrentCourse } from "../store/slices/lessonSlice";

const statusConfig = {
  active: {
    icon: <PlayCircle className="w-4 h-4" />,
    label: "Active",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  completed: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Completed",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  suspended: {
    icon: <Clock className="w-4 h-4" />,
    label: "Suspended",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  cancelled: {
    icon: <XCircle className="w-4 h-4" />,
    label: "Cancelled",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

const sourceConfig = {
  self: { label: "Self Enrolled", color: "text-blue-600" },
  admin: { label: "Admin Enrolled", color: "text-purple-600" },
  instructor: { label: "Instructor Enrolled", color: "text-orange-600" },
  manager: { label: "Team Manager", color: "text-green-600" },
};

const TeamEnrollmentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();
  const { user } = useSelector((state) => state.user);
  const { teamEnrollments, loading, pagination, filters } = useSelector(
    (state) => state.enrollment
  );
  const { currentCourseId } = useSelector((state) => state.lesson);
  const { showNotification } = useNotification();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEnrollments, setSelectedEnrollments] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState({});

  // Load course from slug if provided
  useEffect(() => {
    if (slug && !currentCourseId) {
      loadCourseFromSlug();
    }
  }, [slug, currentCourseId]);

  const loadCourseFromSlug = async () => {
    try {
      const response = await courseAPI.getBySlug(slug);
      dispatch(setCurrentCourse(response.data._id));
    } catch (error) {
      console.error("Error loading course from slug:", error);
      showNotification("Failed to load course information", "error");
    }
  };

  useEffect(() => {
    if (!currentCourseId) {
      showNotification(
        "No course selected. Please select a course first.",
        "warning"
      );
      return;
    }
    fetchTeamEnrollments();
    fetchTeams();
  }, [filters, pagination.page, currentCourseId]);

  const fetchTeamEnrollments = async () => {
    try {
      dispatch(setLoading(true));
      const params = {
        enrolleeType: "team",
        courseId: currentCourseId, // Add courseId filter
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await enrollmentAPI.getEnrollments(params);
      dispatch(setTeamEnrollments(response.data.data));
      dispatch(setPagination(response.data.pagination));
    } catch (error) {
      console.error("Error fetching team enrollments:", error);
      dispatch(setError("Failed to fetch team enrollments"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await teamAPI.getTeams();
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleCreateEnrollment = () => {
    if (!currentCourseId) {
      showNotification(
        "No course selected. Please select a course first.",
        "warning"
      );
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    fetchTeamEnrollments();
    setShowCreateModal(false);
    showNotification("Team enrollments created successfully!", "success");
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    dispatch(setFilters({ ...filters, search: searchTerm }));
  };

  const handleStatusFilter = (status) => {
    dispatch(setFilters({ ...filters, status }));
  };

  const handlePageChange = (page) => {
    dispatch(setPagination({ ...pagination, page }));
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (
      window.confirm("Are you sure you want to delete this team enrollment?")
    ) {
      try {
        await enrollmentAPI.deleteEnrollment(enrollmentId);
        fetchTeamEnrollments();
        showNotification("Team enrollment deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting enrollment:", error);
        showNotification("Failed to delete enrollment", "error");
      }
    }
  };

  const toggleTeamExpansion = (teamId) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  const filteredEnrollments = teamEnrollments.filter((enrollment) => {
    const searchTerm = filters.search?.toLowerCase() || "";
    return (
      enrollment.enrolleeId?.name?.toLowerCase().includes(searchTerm) ||
      enrollment.course?.title?.toLowerCase().includes(searchTerm)
    );
  });
  console.log("Filtered Enrollments:", filteredEnrollments);

  const stats = {
    total: teamEnrollments.length,
    active: teamEnrollments.filter((e) => e.status === "active").length,
    completed: teamEnrollments.filter((e) => e.status === "completed").length,
    suspended: teamEnrollments.filter((e) => e.status === "suspended").length,
    totalMembers: teamEnrollments.reduce((sum, enrollment) => {
      return sum + (enrollment.enrolleeId?.members?.length || 0);
    }, 0),
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar
          role={user?.role}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(true); }} />

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
                Team Enrollments
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage team-based course enrollments and track progress
              </p>
              {!currentCourseId && (
                <div className="mt-4 flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    No course selected. Please navigate to a course to manage
                    enrollments.
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by team name or course..."
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-80 text-sm sm:text-base"
                    onChange={handleSearch}
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 tap-target text-sm sm:text-base"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>

              <button
                onClick={handleCreateEnrollment}
                disabled={!currentCourseId}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed tap-target text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll Teams</span>
              </button>
            </div>

            {/* Team Enrollments Table */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Team Enrollments ({filteredEnrollments.length})
                </h3>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="ml-2 text-gray-600">
                    Loading enrollments...
                  </span>
                </div>
              ) : filteredEnrollments.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No team enrollments found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by enrolling teams in courses.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Team
                        </th>
                        <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Members
                        </th>
                        <th className="hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrolled
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEnrollments.map((enrollment) => (
                        <React.Fragment key={enrollment._id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-3 sm:px-6 py-3 sm:py-4">
                              <div className="min-w-0">
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/teams/${enrollment.enrolleeId?._id}`
                                    )
                                  }
                                  className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left truncate block"
                                >
                                  {enrollment.enrolleeId?.name}
                                </button>
                                <div className="text-xs sm:text-sm text-gray-500 truncate">
                                  {enrollment.enrollee?.description}
                                </div>
                                <div className="md:hidden text-xs text-gray-500 mt-1 truncate">
                                  {enrollment.course?.title}
                                </div>
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <div className="text-xs sm:text-sm text-gray-900">
                                {enrollment.course?.title}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500">
                                {enrollment.course?.level}
                              </div>
                            </td>
                            <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  statusConfig[enrollment.status]?.bgColor ||
                                  "bg-gray-100"
                                } ${
                                  statusConfig[enrollment.status]?.color ||
                                  "text-gray-800"
                                }`}
                              >
                                {statusConfig[enrollment.status]?.icon}
                                <span className="ml-1">
                                  {statusConfig[enrollment.status]?.label ||
                                    enrollment.status}
                                </span>
                              </span>
                            </td>
                            <td className="hidden xl:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-orange-500 h-2 rounded-full"
                                  style={{
                                    width: `${enrollment.progress || 0}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 mt-1 block">
                                {enrollment.progress || 0}% complete
                              </span>
                            </td>
                            <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span className="text-xs sm:text-sm text-gray-900">
                                  {enrollment.enrollee?.members?.length || 0}{" "}
                                  members
                                </span>
                              </div>
                            </td>
                            <td className="hidden xl:table-cell px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                              {new Date(
                                enrollment.enrolledAt
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-1 sm:gap-2">
                                <button className="text-orange-600 hover:text-orange-900 p-1 tap-target">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteEnrollment(enrollment._id)
                                  }
                                  className="text-red-600 hover:text-red-900 p-1 tap-target"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>

                          {/* Expanded team members */}
                          {expandedTeams[enrollment._id] &&
                            enrollment.enrollee?.members && (
                              <tr>
                                <td
                                  colSpan="7"
                                  className="px-6 py-4 bg-gray-50"
                                >
                                  <div className="max-w-4xl">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                                      Team Members (
                                      {enrollment.enrollee.members.length})
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {enrollment.enrollee.members.map(
                                        (member, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200"
                                          >
                                            <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                              {member.firstName?.[0] ||
                                                member.email?.[0] ||
                                                "M"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-gray-900 truncate">
                                                {member.firstName}{" "}
                                                {member.lastName}
                                              </div>
                                              <div className="text-xs text-gray-500 truncate">
                                                {member.email}
                                              </div>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                              {member.role || "Member"}
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.pages} (
                  {pagination.total} total enrollments)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 tap-target text-xs sm:text-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 tap-target text-xs sm:text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Enrollment Modal */}
      <CustomEnrollmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        enrollmentType="team"
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default TeamEnrollmentsPage;

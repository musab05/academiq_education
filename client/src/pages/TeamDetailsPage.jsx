import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Crown,
  User,
  Trash2,
  Settings,
  Edit,
  UserPlus,
  Save,
  X,
  BookOpen,
  Plus,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AddMemberModal from "../components/team/AddMemberModal";
import { teamAPI, userAPI, courseAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";
import {
  setCurrentTeam,
  updateTeam,
  clearCurrentTeam,
} from "../store/slices/teamSlice";

const TeamDetailsPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { currentTeam } = useSelector((state) => state.team);
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [team, setTeam] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showCourseSelector, setShowCourseSelector] = useState(false);

  useEffect(() => {
    fetchTeamDetails();
    fetchUsers();
    fetchCourses();

    // Cleanup function to clear current team when component unmounts
    return () => {
      dispatch(clearCurrentTeam());
    };
  }, [teamId, dispatch]);

  useEffect(() => {
    if (team && team.members) {
      team.members.forEach((member, index) => {
        console.log(`Member ${index}:`, member.user);
      });
    }
  }, [user, team]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getTeams();
      const foundTeam = response.data.find((t) => t._id === teamId);
      setTeam(foundTeam);
      if (foundTeam) {
        setEditForm({
          name: foundTeam.name,
          description: foundTeam.description,
        });
        setSelectedCourses(
          foundTeam.trackedCourses?.map((c) => c._id || c) || [],
        );
        // Set current team in Redux store
        dispatch(setCurrentTeam(foundTeam));
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
      showNotification({
        type: "error",
        message: "Failed to fetch team details",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleAddMember = async (userId, role = "member") => {
    try {
      setAddingMember(true);
      const response = await teamAPI.addMember(teamId, { userId, role });
      setTeam(response.data);
      setShowAddMemberModal(false);
      showNotification({
        type: "success",
        message: "Member added successfully",
      });
    } catch (error) {
      console.error("Error adding member:", error);
      showNotification({
        type: "error",
        message: error.response?.data?.error || "Failed to add member",
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the team?")) return;

    try {
      const response = await teamAPI.removeMember(teamId, userId);
      setTeam(response.data);
      showNotification({
        type: "success",
        message: "Member removed successfully",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      showNotification({
        type: "error",
        message: error.response?.data?.error || "Failed to remove member",
      });
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "manager" ? "member" : "manager";
    try {
      await teamAPI.updateMemberRole(teamId, userId, {
        role: newRole,
      });
      await fetchTeamDetails();
      showNotification({
        type: "success",
        message: "Role updated successfully",
      });
    } catch (error) {
      console.error("Error updating role:", error);
      showNotification({
        type: "error",
        message: error.response?.data?.error || "Failed to update role",
      });
    }
  };

  const handleDeleteTeam = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this team? This action cannot be undone.",
      )
    )
      return;

    try {
      await teamAPI.deleteTeam(teamId);
      showNotification({
        type: "success",
        message: "Team deleted successfully",
      });
      navigate("/teams");
    } catch (error) {
      console.error("Error deleting team:", error);
      showNotification({
        type: "error",
        message: error.response?.data?.error || "Failed to delete team",
      });
    }
  };

  const handleSaveTeam = async () => {
    try {
      setSaving(true);
      const response = await teamAPI.updateTeam(teamId, editForm);
      setTeam(response.data);
      setIsEditing(false);
      // Update both current team and teams list in Redux store
      dispatch(setCurrentTeam(response.data));
      dispatch(updateTeam(response.data));
      showNotification({
        type: "success",
        message: "Team updated successfully",
      });
    } catch (error) {
      console.error("Error updating team:", error);
      showNotification({
        type: "error",
        message: error.response?.data?.error || "Failed to update team",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({ name: team.name, description: team.description });
    setIsEditing(false);
  };

  const handleToggleCourse = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  const handleSaveCourses = async () => {
    try {
      await teamAPI.updateTrackedCourses(teamId, selectedCourses);
      setShowCourseSelector(false);
      fetchTeamDetails();
      showNotification({
        type: "success",
        message: "Tracked courses updated successfully",
      });
    } catch (error) {
      console.error("Error updating tracked courses:", error);
      showNotification({
        type: "error",
        message: "Failed to update tracked courses",
      });
    }
  };

  const getAvailableUsers = () => {
    const teamMemberIds = team?.members.map((m) => m.user._id) || [];
    return users.filter((u) => !teamMemberIds.includes(u._id));
  };

  const canEditTeam = () => {
    if (!team || !user) {
      console.log("canEditTeam: false - missing data", {
        team: !!team,
        user: !!user,
      });
      return false;
    }
    const userId = user._id || user.id;
    const member = team.members.find((m) => m.user._id === userId);
    const canEdit = member?.role === "manager" || team.createdBy._id === userId;
    console.log("canEditTeam:", canEdit, {
      userId,
      member,
      memberRole: member?.role,
      createdBy: team.createdBy._id,
      isManager: member?.role === "manager",
      isCreator: team.createdBy._id === userId,
    });
    return canEdit;
  };

  const canManageMembers = () => {
    if (!team || !user) return false;
    const userId = user._id || user.id;
    const canManage = team.createdBy._id === userId;
    return canManage;
  };

  const isCreator = () => {
    if (!team || !user) return false;
    const userId = user._id || user.id;
    const creator = team.createdBy._id === userId;
    return creator;
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Team not found
            </h2>
            <button
              onClick={() => navigate("/teams")}
              className="text-orange-500 hover:text-orange-600"
            >
              Back to Teams
            </button>
          </div>
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
            setSidebarOpen(true);
          }}
        />

        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <button
                onClick={() => navigate("/teams")}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Teams
              </button>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                        Team Settings
                      </h1>
                    </div>
                    <p className="text-orange-100 text-sm sm:text-base md:text-lg">
                      Manage your learning team, members, and course tracking
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {canEditTeam() && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveTeam}
                        disabled={saving || !editForm.name.trim()}
                        className="bg-white text-orange-600 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg transition-all tap-target text-sm sm:text-base"
                      >
                        <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                        {saving ? "Saving..." : "Save Changes"}
                      </motion.button>
                    )}
                    {isCreator() && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDeleteTeam}
                        className="bg-red-500/90 backdrop-blur-sm text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-red-600 flex items-center justify-center gap-2 font-semibold shadow-lg transition-all tap-target text-sm sm:text-base"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        Delete Team
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Team Information Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-4 sm:mb-6 overflow-hidden"
            >
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">
                      Team Information
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Basic details about your learning team
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 font-medium text-sm sm:text-base"
                      placeholder="e.g., Computer Science 101 Study Group"
                      disabled={!canEditTeam()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 text-sm sm:text-base"
                      placeholder="Describe the purpose and goals of this learning team..."
                      rows={4}
                      disabled={!canEditTeam()}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Help members understand what this team is about
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tracked Courses Card */}
            {canEditTeam() && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 mb-4 sm:mb-6 overflow-hidden"
              >
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Course Tracking
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selectedCourses.length} course
                          {selectedCourses.length !== 1 ? "s" : ""} being
                          tracked
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCourseSelector(!showCourseSelector)}
                      className="bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 flex items-center gap-2 transition-colors shadow-sm font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      {showCourseSelector ? "Close" : "Manage Courses"}
                    </motion.button>
                  </div>
                </div>

                {showCourseSelector && (
                  <div className="p-6">
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-orange-900 mb-1">
                            Track Team Learning Progress
                          </p>
                          <p className="text-sm text-orange-800">
                            Select courses to monitor team member progress,
                            compare performance, and identify learning
                            opportunities
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                      {courses.map((course) => (
                        <motion.label
                          key={course._id}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-400 cursor-pointer transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course._id)}
                            onChange={() => handleToggleCourse(course._id)}
                            className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 mt-1 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 mb-1">
                              {course.title}
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-2">
                              {course.description || "No description available"}
                            </div>
                          </div>
                        </motion.label>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={() => setShowCourseSelector(false)}
                        className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                      >
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveCourses}
                        className="bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-sm font-semibold"
                      >
                        Save Courses
                      </motion.button>
                    </div>
                  </div>
                )}

                {!showCourseSelector && selectedCourses.length > 0 && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {team.trackedCourses?.map((course) => (
                        <motion.div
                          key={course._id}
                          whileHover={{ y: -2 }}
                          className="flex items-center gap-4 p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 truncate mb-1">
                              {course.title}
                            </div>
                            <div className="text-xs text-orange-700 font-medium">
                              📊 Progress Tracking Enabled
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {!showCourseSelector && selectedCourses.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      No Courses Tracked
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                      Start tracking courses to monitor team learning progress
                      and identify areas for improvement
                    </p>
                    <button
                      onClick={() => setShowCourseSelector(true)}
                      className="bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-colors font-semibold inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Courses
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Team Members Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Team Members
                      </h2>
                      <p className="text-sm text-gray-500">
                        {team.members.length} member
                        {team.members.length !== 1 ? "s" : ""} in this learning
                        team
                      </p>
                    </div>
                  </div>
                  {canManageMembers() && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAddMemberModal(true)}
                      className="bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 flex items-center gap-2 transition-colors shadow-sm font-semibold"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Member
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="space-y-3">
                  {team.members.map((member, index) => (
                    <motion.div
                      key={member.user._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
                        <div className="relative">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md flex-shrink-0">
                            {member.user.firstName?.[0]}
                            {member.user.lastName?.[0]}
                          </div>
                          {member.role === "manager" && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-lg flex items-center justify-center border-2 border-white shadow-sm">
                              <Crown className="w-3.5 h-3.5 text-yellow-800" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-bold text-gray-900 text-base sm:text-lg truncate">
                              {member.user.firstName} {member.user.lastName}
                            </span>
                            {team.createdBy._id === member.user._id && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg font-bold">
                                Team Creator
                              </span>
                            )}
                            <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-bold capitalize">
                              {member.role}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600">
                            <span className="font-medium truncate">
                              {member.user.email}
                            </span>
                            <span className="hidden sm:inline text-gray-400">
                              •
                            </span>
                            <span>
                              Joined{" "}
                              {new Date(member.joinedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      {canManageMembers() && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleToggleRole(member.user._id, member.role)
                            }
                            className="p-2 sm:p-2.5 text-gray-500 hover:text-orange-600 hover:bg-orange-100 rounded-xl transition-all border-2 border-transparent hover:border-orange-300 tap-target"
                            title={`Make ${
                              member.role === "manager" ? "member" : "manager"
                            }`}
                          >
                            <Settings className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveMember(member.user._id)}
                            className="p-2 sm:p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border-2 border-transparent hover:border-red-300 tap-target"
                            title="Remove member"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        availableUsers={getAvailableUsers()}
        onAddMember={handleAddMember}
        loading={addingMember}
      />
    </div>
  );
};

export default TeamDetailsPage;

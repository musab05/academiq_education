import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Users,
  Crown,
  Trash2,
  UserPlus,
  Settings,
  MessageCircle,
  Video,
  TrendingUp,
  Award,
  Trophy,
  Target,
  Zap,
  Star,
  ArrowRight,
  BookOpen,
  Clock,
  Medal,
  ChevronRight,
  X,
  Filter,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import CreateTeamModal from "../components/team/CreateTeamModal";
import AddMemberModal from "../components/team/AddMemberModal";
import { teamAPI, userAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";

const TeamManagementPage = () => {
  const { user } = useSelector((state) => state.user);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamsLeaderboard, setTeamsLeaderboard] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(null);
  const [addingMember, setAddingMember] = useState(false);
  const [activeTab, setActiveTab] = useState("my-teams");

  useEffect(() => {
    fetchTeams();
    fetchTeamsLeaderboard();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getTeams();
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      showNotification({ type: "error", message: "Failed to fetch teams" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamsLeaderboard = async () => {
    try {
      const response = await teamAPI.getTeamsLeaderboard();
      setTeamsLeaderboard(response.data);
    } catch (error) {
      console.error("Error fetching teams leaderboard:", error);
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

  const handleCreateTeam = async (teamData) => {
    try {
      setCreating(true);
      const response = await teamAPI.createTeam(teamData);
      setTeams((prev) => [response.data, ...prev]);
      setIsModalOpen(false);
      showNotification({
        type: "success",
        message: "Team created successfully",
      });
      fetchTeamsLeaderboard();
    } catch (error) {
      console.error("Error creating team:", error);
      showNotification({
        type: "error",
        message: error.response?.data?.error || "Failed to create team",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (userId, role = "member") => {
    if (!showAddMemberModal) return;

    try {
      setAddingMember(true);
      const response = await teamAPI.addMember(showAddMemberModal, {
        userId,
        role,
      });
      setTeams((prev) =>
        prev.map((t) => (t._id === showAddMemberModal ? response.data : t)),
      );
      setShowAddMemberModal(null);
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

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getAvailableUsers = (teamId) => {
    const team = teams.find((t) => t._id === teamId);
    const teamMemberIds = team?.members.map((m) => m.user._id) || [];
    return users.filter((u) => !teamMemberIds.includes(u._id));
  };

  const canManageTeam = (team) => {
    const member = team.members.find((m) => m.user._id === user._id);
    return member?.role === "manager" || team.createdBy._id === user._id;
  };

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalXP = teamsLeaderboard.reduce(
      (sum, t) => sum + (t.totalXP || 0),
      0,
    );
    const totalMembers = teams.reduce((sum, t) => sum + t.members.length, 0);
    return {
      totalTeams: teams.length,
      totalXP,
      totalMembers,
      avgXP: teams.length > 0 ? Math.round(totalXP / teams.length) : 0,
    };
  }, [teams, teamsLeaderboard]);

  const tabs = [
    { id: "my-teams", label: "My Teams", icon: Users },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
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
            setSidebarOpen(true);
          }}
        />

        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 sm:p-8 mb-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                    <Users className="w-8 h-8 sm:w-10 sm:h-10" />
                    Teams & Collaboration
                  </h1>
                  <p className="text-orange-100 text-sm sm:text-base max-w-xl">
                    Join forces with your peers, compete on the leaderboard, and
                    achieve learning goals together
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all shadow-lg tap-target"
                >
                  <Plus className="w-5 h-5" />
                  Create New Team
                </button>
              </div>

              {/* Stats Row */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
                {[
                  {
                    label: "Total Teams",
                    value: overallStats.totalTeams,
                    icon: Users,
                  },
                  {
                    label: "Total XP",
                    value: overallStats.totalXP.toLocaleString(),
                    icon: Zap,
                  },
                  {
                    label: "Total Members",
                    value: overallStats.totalMembers,
                    icon: Star,
                  },
                  {
                    label: "Avg Team XP",
                    value: overallStats.avgXP.toLocaleString(),
                    icon: TrendingUp,
                  },
                ].map((stat, i) => (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <stat.icon className="w-4 h-4 text-white/70" />
                      <span className="text-2xl sm:text-3xl font-bold">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/70">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "my-teams" && (
              <>
                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search teams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Teams Grid */}
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-gray-500">Loading teams...</p>
                    </div>
                  </div>
                ) : filteredTeams.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-16 text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center">
                      <Users className="w-10 h-10 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchQuery ? "No teams found" : "No teams yet"}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchQuery
                        ? "Try adjusting your search query"
                        : "Create your first team and start collaborating!"}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
                      >
                        Create Team
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    <AnimatePresence mode="popLayout">
                      {filteredTeams.map((team, index) => {
                        const isManager = canManageTeam(team);
                        const teamData = teamsLeaderboard.find(
                          (t) => t._id === team._id,
                        );

                        return (
                          <motion.div
                            key={team._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5 }}
                            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-300"
                          >
                            {/* Team Header */}
                            <div className="relative h-24 p-4 bg-gradient-to-r from-orange-500 to-red-500">
                              <div className="absolute inset-0 bg-black/10" />

                              {isManager && (
                                <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-1">
                                  <Crown className="w-3 h-3" />
                                  Manager
                                </div>
                              )}

                              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                  {team.avatar ||
                                    team.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            </div>

                            <div className="p-4">
                              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                                {team.name}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                {team.description || "No description"}
                              </p>

                              {/* Stats Row */}
                              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 text-orange-500 mb-0.5">
                                    <Zap className="w-4 h-4" />
                                    <span className="font-bold text-gray-900">
                                      {(
                                        teamData?.totalXP || 0
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">XP</p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 text-blue-500 mb-0.5">
                                    <Users className="w-4 h-4" />
                                    <span className="font-bold text-gray-900">
                                      {team.members.length}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Members
                                  </p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 text-green-500 mb-0.5">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="font-bold text-gray-900">
                                      {team.trackedCourses?.length || 0}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    Courses
                                  </p>
                                </div>
                              </div>

                              {/* Members Preview */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex -space-x-2">
                                  {team.members.slice(0, 4).map((member, i) => (
                                    <div
                                      key={member.user._id}
                                      className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-orange-400 to-red-500"
                                      style={{ zIndex: 4 - i }}
                                    >
                                      {member.user.profilePicture ? (
                                        <img
                                          src={member.user.profilePicture}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium">
                                          {member.user.firstName?.[0]}
                                          {member.user.lastName?.[0]}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {team.members.length > 4 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                      +{team.members.length - 4}
                                    </div>
                                  )}
                                </div>
                                {teamData?.topMembers?.[0] && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Medal className="w-3 h-3 text-yellow-500" />
                                    Top: {teamData.topMembers[0].user.firstName}
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  onClick={() => navigate(`/teams/${team._id}`)}
                                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all text-sm font-medium shadow-lg shadow-orange-500/25"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="hidden sm:inline">Chat</span>
                                </button>
                                <button
                                  onClick={() =>
                                    navigate(`/teams/${team._id}/meeting`)
                                  }
                                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all text-sm font-medium"
                                >
                                  <Video className="w-4 h-4" />
                                  <span className="hidden sm:inline">Meet</span>
                                </button>
                                <button
                                  onClick={() =>
                                    navigate(`/teams/${team._id}/settings`)
                                  }
                                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {isManager && (
                              <div className="px-4 pb-4">
                                <button
                                  onClick={() =>
                                    setShowAddMemberModal(team._id)
                                  }
                                  className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all text-sm font-medium"
                                >
                                  <UserPlus className="w-4 h-4" />
                                  Add Member
                                </button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}

            {activeTab === "leaderboard" && (
              <div className="space-y-4">
                {teamsLeaderboard.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No teams on the leaderboard yet
                    </p>
                  </div>
                ) : (
                  teamsLeaderboard.map((team, index) => (
                    <motion.div
                      key={team._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
                        index === 0
                          ? "border-yellow-300 ring-2 ring-yellow-100"
                          : index === 1
                            ? "border-gray-300"
                            : index === 2
                              ? "border-orange-300"
                              : "border-gray-100"
                      }`}
                      onClick={() => navigate(`/teams/${team._id}`)}
                    >
                      <div className="flex items-center gap-4 p-4 sm:p-6">
                        {/* Rank */}
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-bold text-xl ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
                              : index === 1
                                ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                                : index === 2
                                  ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index === 0 ? (
                            <Trophy className="w-6 h-6" />
                          ) : (
                            `#${index + 1}`
                          )}
                        </div>

                        {/* Team Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                              style={{
                                backgroundColor: team.color || "#f97316",
                              }}
                            >
                              {team.avatar ||
                                team.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {team.name}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {team.memberCount} members
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden sm:flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">
                              {team.totalXP.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">Total XP</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">
                              {team.avgXP.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">Avg XP</p>
                          </div>
                        </div>

                        {/* Top Members */}
                        <div className="hidden md:flex -space-x-2">
                          {team.topMembers?.slice(0, 3).map((member, i) => (
                            <div
                              key={member.user._id}
                              className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-orange-400 to-red-500"
                              style={{ zIndex: 3 - i }}
                              title={`${member.user.firstName} - ${member.xp} XP`}
                            >
                              {member.user.profilePicture ? (
                                <img
                                  src={member.user.profilePicture}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium">
                                  {member.user.firstName?.[0]}
                                  {member.user.lastName?.[0]}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>

                      {/* Mobile Stats */}
                      <div className="sm:hidden flex items-center justify-around px-4 pb-4 pt-0">
                        <div className="text-center">
                          <p className="text-lg font-bold text-orange-600">
                            {team.totalXP.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Total XP</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">
                            {team.avgXP.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Avg XP</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <CreateTeamModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreateTeam={handleCreateTeam}
          loading={creating}
        />

        <AddMemberModal
          isOpen={!!showAddMemberModal}
          onClose={() => setShowAddMemberModal(null)}
          availableUsers={
            showAddMemberModal ? getAvailableUsers(showAddMemberModal) : []
          }
          onAddMember={handleAddMember}
          loading={addingMember}
        />
      </div>
    </div>
  );
};

export default TeamManagementPage;

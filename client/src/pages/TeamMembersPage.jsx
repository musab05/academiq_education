import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Crown,
  Shield,
  Trash2,
  Search,
  Mail,
  MoreVertical,
  ArrowLeft,
  Zap,
  BookOpen,
  CheckCircle,
  X,
  ChevronDown,
} from "lucide-react";
import TeamSidebar from "../components/team/TeamSidebar";
import Header from "../components/Header";
import AddMemberModal from "../components/team/AddMemberModal";
import { teamAPI, userAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";

const TeamMembersPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { showNotification } = useNotification();
  const [team, setTeam] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchTeamData();
    fetchUsers();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [teamsRes, statsRes] = await Promise.all([
        teamAPI.getTeams(),
        teamAPI.getTeamStats(teamId),
      ]);

      const foundTeam = teamsRes.data.find((t) => t._id === teamId);
      setTeam(foundTeam);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching team data:", error);
      showNotification({
        type: "error",
        message: "Failed to load team members",
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

  const isManager =
    team?.members.find((m) => m.user._id === user._id)?.role === "manager" ||
    team?.createdBy?._id === user._id;

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
      fetchTeamData();
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

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the team?")) return;

    try {
      const response = await teamAPI.removeMember(teamId, memberId);
      setTeam(response.data);
      setSelectedMember(null);
      showNotification({
        type: "success",
        message: "Member removed successfully",
      });
      fetchTeamData();
    } catch (error) {
      console.error("Error removing member:", error);
      showNotification({
        type: "error",
        message: error.response?.data?.error || "Failed to remove member",
      });
    }
  };

  const handleToggleRole = async (memberId, currentRole) => {
    const newRole = currentRole === "manager" ? "member" : "manager";
    try {
      const response = await teamAPI.updateMemberRole(teamId, memberId, {
        role: newRole,
      });
      setTeam(response.data);
      setSelectedMember(null);
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

  const getAvailableUsers = () => {
    const teamMemberIds = team?.members.map((m) => m.user._id) || [];
    return users.filter((u) => !teamMemberIds.includes(u._id));
  };

  const filteredMembers =
    team?.members.filter(
      (member) =>
        `${member.user.firstName} ${member.user.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        member.user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const getMemberStats = (memberId) => {
    return (
      stats?.leaderboard?.find((m) => m.user._id === memberId) || {
        xp: 0,
        lessonsCompleted: 0,
        coursesCompleted: 0,
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading members...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Team not found
          </h2>
          <button
            onClick={() => navigate("/teams")}
            className="text-orange-600 hover:text-orange-700"
          >
            Go back to teams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-orange-50/30 min-h-screen">
      <TeamSidebar
        team={team}
        isManager={isManager}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/teams/${teamId}`)}
                  className="p-2 hover:bg-white rounded-lg transition-colors lg:hidden"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Users className="w-8 h-8 text-orange-500" />
                    Team Members
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {team.members.length} members in {team.name}
                  </p>
                </div>
              </div>
              {isManager && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/25"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Member</span>
                </button>
              )}
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members by name or email..."
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

            {/* Members Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredMembers.map((member, index) => {
                  const memberStats = getMemberStats(member.user._id);
                  const isCreator = team.createdBy._id === member.user._id;
                  const isSelf = member.user._id === user._id;

                  return (
                    <motion.div
                      key={member.user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {member.user.profilePicture ? (
                            <img
                              src={member.user.profilePicture}
                              alt=""
                              className="w-14 h-14 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                              {member.user.firstName?.[0]}
                              {member.user.lastName?.[0]}
                            </div>
                          )}
                          {member.role === "manager" && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Crown className="w-3.5 h-3.5 text-yellow-900" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {member.user.firstName} {member.user.lastName}
                            </h3>
                            {isSelf && (
                              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {member.user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                member.role === "manager"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {member.role === "manager" ? "Manager" : "Member"}
                            </span>
                            {isCreator && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                Creator
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {isManager && !isSelf && !isCreator && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setSelectedMember(
                                  selectedMember === member.user._id
                                    ? null
                                    : member.user._id,
                                )
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-400" />
                            </button>

                            {selectedMember === member.user._id && (
                              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-48 z-10">
                                <button
                                  onClick={() =>
                                    handleToggleRole(
                                      member.user._id,
                                      member.role,
                                    )
                                  }
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                                >
                                  <Shield className="w-4 h-4" />
                                  {member.role === "manager"
                                    ? "Remove Manager"
                                    : "Make Manager"}
                                </button>
                                <button
                                  onClick={() =>
                                    handleRemoveMember(member.user._id)
                                  }
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove from Team
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-orange-500">
                            <Zap className="w-4 h-4" />
                            <span className="font-bold text-gray-900">
                              {memberStats.xp}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">XP</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-blue-500">
                            <BookOpen className="w-4 h-4" />
                            <span className="font-bold text-gray-900">
                              {memberStats.lessonsCompleted}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Lessons</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-green-500">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-bold text-gray-900">
                              {memberStats.coursesCompleted}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Courses</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredMembers.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No members found</p>
              </div>
            )}
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

export default TeamMembersPage;

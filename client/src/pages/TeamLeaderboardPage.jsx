import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Medal,
  Zap,
  Star,
  Crown,
  TrendingUp,
  BookOpen,
  Target,
  ArrowLeft,
  Award,
  Users,
  ChevronUp,
  ChevronDown,
  Minus,
  Clock,
} from "lucide-react";
import TeamSidebar from "../components/team/TeamSidebar";
import Header from "../components/Header";
import { teamAPI } from "../services/api";
import { useNotification } from "../context/NotificationContext";

const TeamLeaderboardPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { showNotification } = useNotification();
  const [team, setTeam] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("all-time");

  useEffect(() => {
    fetchTeamData();
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
        message: "Failed to load leaderboard",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMemberRank = (index) => {
    if (index === 0)
      return {
        icon: Trophy,
        color: "text-yellow-500",
        bg: "from-yellow-400 to-yellow-600",
      };
    if (index === 1)
      return {
        icon: Medal,
        color: "text-gray-400",
        bg: "from-gray-300 to-gray-500",
      };
    if (index === 2)
      return {
        icon: Medal,
        color: "text-orange-500",
        bg: "from-orange-400 to-orange-600",
      };
    return { icon: null, color: "text-gray-600", bg: "bg-gray-100" };
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ChevronUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <ChevronDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const isManager =
    team?.members.find((m) => m.user._id === user._id)?.role === "manager" ||
    team?.createdBy?._id === user._id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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

  const sortedMembers = stats?.leaderboard?.sort((a, b) => b.xp - a.xp) || [];
  const currentUserRank =
    sortedMembers.findIndex((m) => m.user._id === user._id) + 1;
  const avgXP =
    sortedMembers.length > 0
      ? Math.round((stats?.teamTotals?.totalXP || 0) / sortedMembers.length)
      : 0;

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
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(`/teams/${teamId}`)}
                className="p-2 hover:bg-white rounded-lg transition-colors lg:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-orange-500" />
                  Team Leaderboard
                </h1>
                <p className="text-gray-600 mt-1">
                  See how your team members are performing
                </p>
              </div>
            </div>

            {/* Your Rank Card */}
            {currentUserRank > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 mb-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm mb-1">Your Rank</p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold">
                        #{currentUserRank}
                      </span>
                      <span className="text-orange-100">
                        of {sortedMembers.length} members
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-100 text-sm mb-1">Your XP</p>
                    <div className="flex items-center gap-2">
                      <Zap className="w-6 h-6" />
                      <span className="text-3xl font-bold">
                        {sortedMembers[
                          currentUserRank - 1
                        ]?.xp.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Team Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                {
                  label: "Total XP",
                  value: stats?.teamTotals?.totalXP || 0,
                  icon: Zap,
                  color: "orange",
                },
                {
                  label: "Avg XP",
                  value: avgXP,
                  icon: TrendingUp,
                  color: "blue",
                },
                {
                  label: "Lessons Done",
                  value: stats?.teamTotals?.totalLessons || 0,
                  icon: BookOpen,
                  color: "green",
                },
                {
                  label: "Courses Done",
                  value: stats?.teamTotals?.totalCourses || 0,
                  icon: Clock,
                  color: "purple",
                },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center mb-3`}
                  >
                    <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Leaderboard List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Rankings
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                <AnimatePresence>
                  {sortedMembers.map((member, index) => {
                    const rank = getMemberRank(index);
                    const isCurrentUser = member.user._id === user._id;

                    return (
                      <motion.div
                        key={member.user._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                          isCurrentUser ? "bg-orange-50" : ""
                        }`}
                      >
                        {/* Rank */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            rank.icon
                              ? `bg-gradient-to-br ${rank.bg} text-white`
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {rank.icon ? (
                            <rank.icon className="w-5 h-5" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        {/* Avatar */}
                        <div className="relative">
                          {member.user.profilePicture ? (
                            <img
                              src={member.user.profilePicture}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                              {member.user.firstName?.[0]}
                              {member.user.lastName?.[0]}
                            </div>
                          )}
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Crown className="w-3 h-3 text-yellow-900" />
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">
                            {member.user.firstName} {member.user.lastName}
                            {isCurrentUser && (
                              <span className="text-orange-500 ml-2">
                                (You)
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {member.lessonsCompleted || 0} lessons
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {member.coursesCompleted || 0} courses
                            </span>
                          </div>
                        </div>

                        {/* XP */}
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Zap className="w-5 h-5 text-orange-500" />
                            <span className="text-xl font-bold text-gray-900">
                              {member.xp.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">XP Points</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {sortedMembers.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No members to rank yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamLeaderboardPage;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Award,
  Zap,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  ExternalLink,
  Star,
  Flame,
  CheckCircle,
  Clock,
  Medal,
  Crown,
  Sparkles,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { gamificationAPI } from "../services/api";

const TIER_COLORS = {
  bronze: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-300",
    gradient: "from-amber-400 to-amber-600",
  },
  silver: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-300",
    gradient: "from-gray-400 to-gray-500",
  },
  gold: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-400",
    gradient: "from-yellow-400 to-yellow-600",
  },
  diamond: {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-400",
    gradient: "from-cyan-400 to-blue-500",
  },
};

const GamificationPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [gamification, setGamification] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gamifRes, leaderRes, activityRes] = await Promise.all([
        gamificationAPI.getMyGamification(),
        gamificationAPI.getLeaderboard({ type: "global" }),
        gamificationAPI.getActivities().catch(() => ({ data: [] })),
      ]);
      setGamification(gamifRes.data);
      setLeaderboard(leaderRes.data);
      setActivities(activityRes.data || []);
    } catch (error) {
      console.error("Failed to fetch gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const xpForCurrentLevel = gamification ? (gamification.level - 1) * 100 : 0;
  const xpForNextLevel = gamification ? gamification.level * 100 : 100;
  const currentLevelXP = gamification
    ? gamification.totalXP - xpForCurrentLevel
    : 0;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = gamification ? (currentLevelXP / xpNeeded) * 100 : 0;
  const xpToNextLevel = xpNeeded - currentLevelXP;

  const badgesByTier = {
    diamond: gamification?.badges?.filter((b) => b.tier === "diamond") || [],
    gold: gamification?.badges?.filter((b) => b.tier === "gold") || [],
    silver: gamification?.badges?.filter((b) => b.tier === "silver") || [],
    bronze: gamification?.badges?.filter((b) => b.tier === "bronze") || [],
  };

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading achievements...</p>
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => {
            setSidebarCollapsed(!sidebarCollapsed);
            setSidebarOpen(!sidebarOpen);
          }}
        />

        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header with Level */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="absolute top-4 right-4 opacity-20">
                  <Trophy className="w-32 h-32" />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-8 h-8" />
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                        Achievements
                      </h1>
                    </div>
                    <p className="text-white/80 text-sm sm:text-base mb-4">
                      Track your progress, earn badges, and compete!
                    </p>

                    {/* XP Progress Bar */}
                    <div className="max-w-md">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-semibold">
                          {gamification?.totalXP || 0} XP
                        </span>
                        <span className="text-white/80">
                          {xpToNextLevel} XP to Level{" "}
                          {(gamification?.level || 1) + 1}
                        </span>
                      </div>
                      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${xpProgress}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-white rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className="flex-shrink-0">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-24 h-24 sm:w-28 sm:h-28 bg-white/20 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center border border-white/30"
                    >
                      <Crown className="w-8 h-8 mb-1" />
                      <span className="text-4xl sm:text-5xl font-bold">
                        {gamification?.level || 1}
                      </span>
                      <span className="text-xs text-white/80">LEVEL</span>
                    </motion.div>
                  </div>
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
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                    +{currentLevelXP}
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {gamification?.totalXP || 0}
                </h3>
                <p className="text-sm text-gray-600">Total XP</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {gamification?.badges?.length || 0}
                </h3>
                <p className="text-sm text-gray-600">Badges Earned</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6 text-red-600" />
                  </div>
                  {gamification?.streak?.current > 0 && (
                    <div className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">
                      🔥 Active
                    </div>
                  )}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {gamification?.streak?.current || 0}
                </h3>
                <p className="text-sm text-gray-600">Day Streak</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {gamification?.streak?.longest || 0}
                </h3>
                <p className="text-sm text-gray-600">Longest Streak</p>
              </motion.div>
            </motion.div>

            {/* Learning Stats Mini Grid */}
            {gamification?.stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Learning Statistics
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">
                      {gamification.stats.lessonsCompleted || 0}
                    </div>
                    <div className="text-xs text-gray-500">Lessons</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">
                      {gamification.stats.coursesCompleted || 0}
                    </div>
                    <div className="text-xs text-gray-500">Courses</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">
                      {gamification.stats.quizzesCompleted || 0}
                    </div>
                    <div className="text-xs text-gray-500">Quizzes</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">
                      {gamification.stats.perfectQuizzes || 0}
                    </div>
                    <div className="text-xs text-gray-500">Perfect</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">
                      {gamification.stats.videosWatched || 0}
                    </div>
                    <div className="text-xs text-gray-500">Videos</div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Badges Section */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <Medal className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      My Badges
                    </h2>
                  </div>

                  {gamification?.badges?.length > 0 ? (
                    <div className="space-y-4">
                      {/* Badges by Tier */}
                      {["diamond", "gold", "silver", "bronze"].map(
                        (tier) =>
                          badgesByTier[tier].length > 0 && (
                            <div key={tier}>
                              <div
                                className={`text-xs font-bold uppercase tracking-wider mb-2 ${TIER_COLORS[tier].text}`}
                              >
                                {tier} ({badgesByTier[tier].length})
                              </div>
                              <div className="space-y-2">
                                {badgesByTier[tier].map((badge, index) => (
                                  <motion.div
                                    key={badge.badgeId || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    className={`flex items-center gap-3 p-3 ${TIER_COLORS[tier].bg} border ${TIER_COLORS[tier].border} rounded-xl`}
                                  >
                                    <div className="text-2xl">{badge.icon}</div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-bold text-gray-900 text-sm truncate">
                                        {badge.name}
                                      </div>
                                      <div className="text-xs text-gray-600 truncate">
                                        {badge.description}
                                      </div>
                                    </div>
                                    <div className="text-xs font-bold text-orange-500">
                                      +{badge.xp} XP
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          ),
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        No badges yet
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Complete lessons and courses to earn badges!
                      </p>
                      <button
                        onClick={() => navigate("/all-courses")}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/25"
                      >
                        Start Learning
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Leaderboard */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Global Leaderboard
                      </h2>
                    </div>
                    <button
                      onClick={() => navigate("/leaderboard")}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all text-sm font-semibold shadow-lg shadow-orange-500/25"
                    >
                      View All
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(Array.isArray(leaderboard) ? leaderboard : [])
                      .slice(0, 10)
                      .map((entry, index) => {
                        const isCurrentUser = entry.user?._id === user?.id;
                        const isTopThree = index < 3;

                        return (
                          <motion.div
                            key={entry.user?._id || index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.01, x: 4 }}
                            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                              isCurrentUser
                                ? "bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300"
                                : "bg-gray-50 border border-gray-100 hover:border-orange-200"
                            }`}
                          >
                            {/* Rank */}
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                index === 0
                                  ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-400/30"
                                  : index === 1
                                    ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                                    : index === 2
                                      ? "bg-gradient-to-br from-amber-500 to-amber-700 text-white"
                                      : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {index === 0 ? "👑" : index + 1}
                            </div>

                            {/* Avatar */}
                            {entry.user?.profilePicture ? (
                              <img
                                src={entry.user.profilePicture}
                                alt={`${entry.user?.firstName} ${entry.user?.lastName}`}
                                className="w-12 h-12 rounded-xl object-cover shadow-md flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                                {entry.user?.firstName?.[0]}
                                {entry.user?.lastName?.[0]}
                              </div>
                            )}

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 truncate flex items-center gap-2">
                                {entry.user?.firstName} {entry.user?.lastName}
                                {isCurrentUser && (
                                  <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <Crown className="w-3 h-3" /> Level{" "}
                                  {entry.level}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1">
                                  <Medal className="w-3 h-3" /> {entry.badges}{" "}
                                  badges
                                </span>
                              </div>
                            </div>

                            {/* XP */}
                            <div className="text-right flex-shrink-0">
                              <div className="font-bold text-orange-600 text-lg">
                                {entry.xp?.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">XP</div>
                            </div>
                          </motion.div>
                        );
                      })}

                    {leaderboard.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Trophy className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No leaderboard data yet</p>
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

export default GamificationPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Zap, TrendingUp, Users, BookOpen, Target, ExternalLink } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { gamificationAPI } from '../services/api';

const GamificationPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [gamification, setGamification] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [gamifRes, leaderRes] = await Promise.all([
        gamificationAPI.getMyGamification(),
        gamificationAPI.getLeaderboard({ type: activeTab === 'global' ? 'global' : 'global' })
      ]);
      setGamification(gamifRes.data);
      setLeaderboard(leaderRes.data);
    } catch (error) {
      console.error('Failed to fetch gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const xpToNextLevel = gamification ? (gamification.level * 100) - gamification.totalXP : 100;
  const xpProgress = gamification ? ((gamification.totalXP % 100) / 100) * 100 : 0;

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
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />

        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">🎮 Achievements & Leaderboard</h1>
                    <p className="text-sm sm:text-base text-orange-100">Track your progress and compete with others!</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold">{gamification?.level || 1}</div>
                    <div className="text-xs sm:text-sm text-orange-100">Level</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{gamification?.totalXP || 0}</h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Total XP</p>
                <div className="mt-2 sm:mt-3 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{xpToNextLevel} XP to next level</p>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{gamification?.badges?.length || 0}</h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Badges Earned</p>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{gamification?.streak?.current || 0}</h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Day Streak 🔥</p>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{gamification?.streak?.longest || 0}</h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Longest Streak</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Badges */}
              <div className="lg:col-span-1">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 shadow-sm">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                    My Badges
                  </h2>
                  <div className="space-y-2 sm:space-y-3">
                    {gamification?.badges?.length > 0 ? (
                      gamification.badges.map((badge, index) => (
                        <motion.div key={index} whileHover={{ x: 2 }} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-orange-50 border-2 border-orange-200 rounded-lg sm:rounded-xl">
                          <div className="text-2xl sm:text-3xl flex-shrink-0">{badge.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 text-sm sm:text-base truncate">{badge.name}</div>
                            <div className="text-xs text-gray-600 line-clamp-1">{badge.description}</div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <Award className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm sm:text-base text-gray-500">No badges yet</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">Complete lessons to earn badges!</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Leaderboard */}
              <div className="lg:col-span-2">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                      Global Leaderboard
                    </h2>
                    <button
                      onClick={() => navigate('/leaderboard')}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold tap-target"
                    >
                      View All
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(Array.isArray(leaderboard) ? leaderboard : []).slice(0, 10).map((entry, index) => (
                      <motion.div key={index} whileHover={{ x: 2 }} className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all ${entry.user?._id === user?.id ? 'bg-orange-100 border-2 border-orange-300' : 'bg-gray-50 border-2 border-gray-200'}`}>
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${index < 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                          {index + 1}
                        </div>
                        {entry.user?.profilePicture ? (
                          <img
                            src={entry.user.profilePicture}
                            alt={`${entry.user?.firstName} ${entry.user?.lastName}`}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-md flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {entry.user?.firstName?.[0]}{entry.user?.lastName?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 text-sm sm:text-base truncate">{entry.user?.firstName} {entry.user?.lastName}</div>
                          <div className="text-xs sm:text-sm text-gray-600">Level {entry.level} • {entry.badges} badges</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-orange-600 text-sm sm:text-base">{entry.xp} XP</div>
                        </div>
                      </motion.div>
                    ))}
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

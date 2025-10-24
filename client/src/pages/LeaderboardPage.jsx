import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Users, BookOpen, TrendingUp } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { gamificationAPI, courseAPI, teamAPI } from '../services/api';

const LeaderboardPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeScope, setActiveScope] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const { user } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchCourses();
    fetchTeams();
    const scope = searchParams.get('scope') || 'global';
    const courseId = searchParams.get('courseId');
    const teamId = searchParams.get('teamId');
    
    setActiveScope(scope);
    if (courseId) setSelectedCourse(courseId);
    if (teamId) setSelectedTeam(teamId);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeScope, selectedCourse, selectedTeam]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getEnrolledCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await teamAPI.getTeams();
      setTeams(response.data || []);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = { type: activeScope };
      if (activeScope === 'course' && selectedCourse) params.courseId = selectedCourse;
      if (activeScope === 'team' && selectedTeam) params.teamId = selectedTeam;
      
      const response = await gamificationAPI.getLeaderboard(params);
      setLeaderboard(response.data.leaderboard || []);
      setUserRank(response.data.userRank);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-gray-200 to-gray-400';
  };

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />

        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                      <Trophy className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
                      <span className="truncate">Leaderboard</span>
                    </h1>
                    <p className="text-sm sm:text-base text-orange-100">Compete and see where you rank!</p>
                  </div>
                  {userRank && (
                    <div className="text-right bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 flex-shrink-0">
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold">{userRank}</div>
                      <div className="text-orange-100 text-xs sm:text-sm">Your Rank</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Scope Tabs */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-1.5 sm:p-2 mb-4 sm:mb-6 flex gap-1 sm:gap-2">
              <button
                onClick={() => setActiveScope('global')}
                className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base tap-target ${
                  activeScope === 'global'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Global</span>
              </button>
              <button
                onClick={() => setActiveScope('course')}
                className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base tap-target ${
                  activeScope === 'course'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Course</span>
              </button>
              <button
                onClick={() => setActiveScope('team')}
                className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-md sm:rounded-lg font-semibold transition-all flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base tap-target ${
                  activeScope === 'team'
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Team</span>
              </button>
            </div>

            {/* Filters */}
            {activeScope === 'course' && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
                <CustomSelect
                  label="Select Course"
                  value={selectedCourse || ''}
                  onChange={setSelectedCourse}
                  options={[
                    { value: '', label: 'Choose a course...' },
                    ...courses.map(course => ({ value: course._id, label: course.title }))
                  ]}
                  placeholder="Choose a course..."
                  icon={BookOpen}
                />
              </div>
            )}

            {activeScope === 'team' && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
                <CustomSelect
                  label="Select Team"
                  value={selectedTeam || ''}
                  onChange={setSelectedTeam}
                  options={[
                    { value: '', label: 'Choose a team...' },
                    ...teams.map(team => ({ value: team._id, label: team.name }))
                  ]}
                  placeholder="Choose a team..."
                  icon={Users}
                />
              </div>
            )}

            {/* Leaderboard */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500 font-medium">No data available</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    {activeScope === 'course' && !selectedCourse && 'Please select a course'}
                    {activeScope === 'team' && !selectedTeam && 'Please select a team'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {leaderboard.map((entry, index) => {
                    const rank = entry.rank || index + 1;
                    const isCurrentUser = entry.user?._id === user?.id || entry.user?.uuid === user?.uuid;
                    
                    return (
                      <motion.div
                        key={entry.user?._id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition-all ${
                          isCurrentUser ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                        }`}
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg bg-gradient-to-br ${getRankColor(rank)} text-white shadow-md flex-shrink-0`}>
                          {getRankIcon(rank)}
                        </div>
                        {entry.user?.profilePicture ? (
                          <img
                            src={entry.user.profilePicture}
                            alt={`${entry.user?.firstName} ${entry.user?.lastName}`}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md flex-shrink-0">
                            {entry.user?.firstName?.[0]}{entry.user?.lastName?.[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                            <span className="truncate">{entry.user?.firstName} {entry.user?.lastName}</span>
                            {isCurrentUser && (
                              <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">You</span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            Level {entry.level} • {entry.badges} badge{entry.badges !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg sm:text-2xl font-bold text-orange-600">{entry.xp}</div>
                          <div className="text-xs text-gray-500">XP</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;

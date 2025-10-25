import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCourseListSource } from '../store/slices/navigationSlice';
import { BookOpen, Users, Video, TrendingUp, Clock, Award, BarChart3, Calendar } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { dashboardAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrollments: [],
    teams: 0,
    classrooms: 0,
    recentActivity: [],
    roleStats: null,
    userRole: null
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to load dashboard' });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, onClick }) => (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 cursor-pointer hover:border-${color}-300 transition-all shadow-sm hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${color}-100 rounded-lg sm:rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-600`} />
        </div>
      </div>
      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-xs sm:text-sm text-gray-600 font-medium">{title}</p>
    </motion.div>
  );

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

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />

        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-lg">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.firstName}! 👋</h1>
                <p className="text-orange-100 text-sm sm:text-base md:text-lg">Here's your learning overview</p>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                icon={BookOpen}
                title="Enrolled Courses"
                value={stats.enrollments.length}
                color="orange"
                onClick={() => navigate('/my-courses')}
              />
              <StatCard
                icon={Users}
                title="My Teams"
                value={stats.teams}
                color="blue"
                onClick={() => navigate('/teams')}
              />
              <StatCard
                icon={Video}
                title="Classrooms"
                value={stats.classrooms}
                color="purple"
                onClick={() => navigate('/my-classrooms')}
              />
              <StatCard
                icon={TrendingUp}
                title="Avg Progress"
                value={`${Math.round(stats.enrollments.reduce((acc, e) => acc + e.progress, 0) / (stats.enrollments.length || 1))}%`}
                color="green"
              />
            </div>

            {/* Role-Specific Stats */}
            {(user?.role === 'admin' || user?.role === 'superadmin') && stats.roleStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 mb-6 sm:mb-8 shadow-sm"
              >
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Platform Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg sm:rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.roleStats.totalUsers}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Users</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.roleStats.totalCourses}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Courses</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.roleStats.totalEnrollments}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Enrollments</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.roleStats.totalTeams}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Teams</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Instructor Stats */}
            {user?.role === 'instructor' && stats.roleStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 mb-6 sm:mb-8 shadow-sm"
              >
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Teaching Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg sm:rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.roleStats.myCourses}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">My Courses</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.roleStats.totalStudents}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Students</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.roleStats.totalEnrollments}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">Enrollments</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl">
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.roleStats.myClassrooms}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">My Classrooms</div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Course Progress */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">My Courses</h2>
                    <button
                      onClick={() => navigate('/my-courses')}
                      className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {stats.enrollments.slice(0, 5).map((course) => (
                      <motion.div
                        key={course.courseId}
                        whileHover={{ x: 4 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-gray-100 rounded-lg sm:rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all"
                      >
                        <img
                          src={course.thumbnail || '/placeholder-course.jpg'}
                          alt={course.title}
                          className="w-full sm:w-16 h-32 sm:h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 w-full">
                          <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">{course.title}</h3>
                          {course.hasStarted ? (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-orange-500 h-2 rounded-full transition-all"
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-700">{course.progress}%</span>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <span className="text-sm text-gray-500">Not started • {course.total} lessons</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            dispatch(setCourseListSource('/dashboard'));
                            navigate(`/learn/${course.courseId}`);
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold text-sm flex-shrink-0"
                        >
                          {course.hasStarted ? 'Continue' : 'Start'}
                        </button>
                      </motion.div>
                    ))}
                    {stats.enrollments.length === 0 && (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No courses enrolled yet</p>
                        <button
                          onClick={() => navigate('/all-courses')}
                          className="bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 font-semibold"
                        >
                          Browse Courses
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Activity</h2>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {stats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{activity.lesson?.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {stats.recentActivity.length === 0 && (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No recent activity</p>
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

export default DashboardPage;

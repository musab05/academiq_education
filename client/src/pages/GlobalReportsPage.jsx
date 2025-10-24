import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, Users, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { enrollmentAPI } from '../services/api';

const GlobalReportsPage = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    fetchGlobalReports();
  }, []);

  const fetchGlobalReports = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getGlobalReports();
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching global reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!reportData) {
    return <div>No data available</div>;
  }

  const { stats, courseStats, userStats } = reportData;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Global Reports</h1>
              <p className="text-sm sm:text-base text-gray-600">System-wide analytics and performance metrics</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Courses</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900">{stats.totalCourses}</div>
                <div className="text-xs sm:text-sm text-blue-600 mt-2">Active courses</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-purple-700 uppercase tracking-wide">Total Users</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-900">{stats.totalUsers}</div>
                <div className="text-xs sm:text-sm text-purple-600 mt-2">Enrolled learners</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-orange-200 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-orange-700 uppercase tracking-wide">Total Enrollments</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-900">{stats.totalEnrollments}</div>
                <div className="text-xs sm:text-sm text-orange-600 mt-2">Active enrollments</div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 mb-6 sm:mb-8">
              <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex min-w-max">
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-colors tap-target ${
                      activeTab === 'courses'
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Courses Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-colors tap-target ${
                      activeTab === 'users'
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Users Overview
                  </button>
                </div>
              </div>

              {activeTab === 'courses' && (
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Course Enrollment Statistics</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Click on any course to view detailed reports</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Course</th>
                          <th className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Enrolled Users</th>
                          <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                          <th className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {courseStats.map((course) => (
                          <tr
                            key={course.courseId}
                            onClick={() => navigate(`/reports/course/${course.courseId}`)}
                            className="hover:bg-orange-50 transition-colors cursor-pointer tap-target"
                          >
                            <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{course.courseTitle}</div>
                                <div className="sm:hidden mt-1 text-xs text-gray-600">
                                  {course.enrolledUsers} users • {course.completionRate || 0}% complete
                                </div>
                              </div>
                            </td>
                            <td className="hidden sm:table-cell px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                              <div className="flex items-center">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <span className="text-xs sm:text-sm font-bold text-blue-700">{course.enrolledUsers}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                              <div className="flex items-center">
                                <div className="w-16 sm:w-24 md:w-32 bg-gray-200 rounded-full h-2 sm:h-2.5 mr-2 sm:mr-3 flex-shrink-0">
                                  <div
                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 sm:h-2.5 rounded-full transition-all"
                                    style={{ width: `${course.avgProgress || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">{course.avgProgress || 0}%</span>
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                              <span className="text-xs sm:text-sm font-semibold text-gray-900">{course.completionRate || 0}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">User Enrollment Statistics</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Click on any user to view their progress</p>
                  </div>
                  {userStats.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                      <p className="text-gray-500">There are no enrolled users yet</p>
                    </div>
                  ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                          <th className="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Enrolled</th>
                          <th className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Completed</th>
                          <th className="hidden xl:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">In Progress</th>
                          <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {userStats.map((user) => (
                          <tr
                            key={user.userId}
                            onClick={() => navigate(`/reports/user/${user.userId}`)}
                            className="hover:bg-orange-50 transition-colors cursor-pointer tap-target"
                          >
                            <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                              <div className="flex items-center min-w-0">
                                {user.profilePicture ? (
                                  <img src={user.profilePicture} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 flex-shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold mr-2 sm:mr-3 flex-shrink-0 text-xs sm:text-sm">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</div>
                                  <div className="md:hidden mt-1 flex items-center gap-2 text-xs text-gray-600">
                                    <span>{user.completedCourses}/{user.enrolledCourses} courses</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                              <div className="flex items-center">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                  <span className="text-xs sm:text-sm font-bold text-purple-700">{user.enrolledCourses}</span>
                                </div>
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                              <div className="flex items-center">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                  <span className="text-xs sm:text-sm font-bold text-green-700">{user.completedCourses}</span>
                                </div>
                              </div>
                            </td>
                            <td className="hidden xl:table-cell px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                              <div className="flex items-center">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                                  <span className="text-xs sm:text-sm font-bold text-yellow-700">{user.inProgressCourses}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 md:px-6 py-4 sm:py-5">
                              <div className="flex items-center">
                                <div className="w-16 sm:w-24 md:w-32 bg-gray-200 rounded-full h-2 sm:h-2.5 mr-2 sm:mr-3 flex-shrink-0">
                                  <div
                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 sm:h-2.5 rounded-full transition-all"
                                    style={{ width: `${user.avgProgress || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">{user.avgProgress || 0}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalReportsPage;

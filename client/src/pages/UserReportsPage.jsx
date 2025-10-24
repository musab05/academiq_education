import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { enrollmentAPI } from '../services/api';

const UserReportsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [slug]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getEnrollments({ courseSlug: slug, enrolleeType: 'user' });
      const enrollmentsData = response.data.data || response.data || [];
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const completionStats = {
    completed: enrollments.filter(e => e.progress?.status === 'completed').length,
    inProgress: enrollments.filter(e => e.progress?.status === 'in_progress').length,
    notStarted: enrollments.filter(e => !e.progress || e.progress.status === 'not_started').length
  };

  const pieData = [
    { name: 'Completed', value: completionStats.completed, color: '#10b981' },
    { name: 'In Progress', value: completionStats.inProgress, color: '#f59e0b' },
    { name: 'Not Started', value: completionStats.notStarted, color: '#6b7280' }
  ];

  const progressDistribution = enrollments.map(e => {
    const user = e.enrolleeId || e.user;
    return {
      name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unknown',
      progress: e.progress?.progress || 0
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => {
          if (window.innerWidth < 1024) setSidebarOpen(true);
          else setSidebarCollapsed(!sidebarCollapsed);
        }} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">User Progress Reports</h1>
              <p className="text-sm sm:text-base text-gray-600">Track learner progress and performance metrics</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Enrolled</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900">{enrollments.length}</div>
                <div className="text-xs sm:text-sm text-blue-600 mt-1 sm:mt-2">Active learners</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-green-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-green-700 uppercase tracking-wide">Completed</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-900">{completionStats.completed}</div>
                <div className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-2">Finished courses</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-orange-200 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-orange-700 uppercase tracking-wide">Success Rate</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-900">
                  {enrollments.length > 0 ? Math.round((completionStats.completed / enrollments.length) * 100) : 0}%
                </div>
                <div className="text-xs sm:text-sm text-orange-600 mt-1 sm:mt-2">Completion rate</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Completion Status</h2>
                  <div className="text-xs sm:text-sm text-gray-500">{enrollments.length} users</div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Progress Distribution</h2>
                  <div className="text-xs sm:text-sm text-gray-500">Individual progress</div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={progressDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="progress" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Learner Details</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Click on any row to view detailed progress</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                      <th className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                      <th className="hidden sm:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Accessed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrollments.map((enrollment) => {
                      const enrolledUser = enrollment.enrolleeId || enrollment.user;
                      return (
                        <tr key={enrollment._id} onClick={() => navigate(`/course-overview/${slug}/reports/users/${enrolledUser?._id}`)} className="cursor-pointer hover:bg-orange-50 transition-colors tap-target">
                          <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {enrolledUser?.profilePicture ? (
                                <img
                                  src={enrolledUser.profilePicture}
                                  alt={`${enrolledUser?.firstName} ${enrolledUser?.lastName}`}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                                  {enrolledUser?.firstName?.[0]}{enrolledUser?.lastName?.[0]}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                                  {enrolledUser?.firstName} {enrolledUser?.lastName}
                                </div>
                                <div className="md:hidden text-xs text-gray-500 truncate">
                                  {enrolledUser?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-5 text-xs sm:text-sm text-gray-600">
                            <div className="truncate max-w-xs">{enrolledUser?.email}</div>
                          </td>
                          <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 sm:w-24 md:w-32 bg-gray-200 rounded-full h-2 sm:h-2.5">
                                <div
                                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 sm:h-2.5 rounded-full transition-all"
                                  style={{ width: `${enrollment.progress?.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">{enrollment.progress?.progress || 0}%</span>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-5">
                            <span className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${
                              enrollment.progress?.status === 'completed' ? 'bg-green-100 text-green-700' :
                              enrollment.progress?.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {enrollment.progress?.status === 'completed' ? 'Completed' :
                               enrollment.progress?.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                            </span>
                          </td>
                          <td className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-5 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                            {enrollment.progress?.lastAccessed ? new Date(enrollment.progress.lastAccessed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReportsPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, User } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { progressAPI } from '../services/api';

const LessonDetailReportPage = () => {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonDetails();
  }, [lessonId, slug]);

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);
      const response = await progressAPI.getLessonDetails(slug, lessonId);
      setLessonData(response.data);
    } catch (error) {
      console.error('Error fetching lesson details:', error);
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

  if (!lessonData) {
    return <div>No data available</div>;
  }

  const { lesson, userProgress } = lessonData;
  const completedCount = userProgress.filter(p => p.isCompleted).length;
  const inProgressCount = userProgress.filter(p => !p.isCompleted && p.progress > 0).length;
  const notStartedCount = userProgress.filter(p => p.progress === 0).length;
  const avgScore = userProgress.length > 0
    ? Math.round(userProgress.reduce((sum, p) => sum + (p.score || 0), 0) / userProgress.length)
    : 0;

  const statusData = [
    { name: 'Completed', value: completedCount, color: '#10b981' },
    { name: 'In Progress', value: inProgressCount, color: '#f59e0b' },
    { name: 'Not Started', value: notStartedCount, color: '#6b7280' }
  ];

  const progressData = userProgress.map(p => ({
    name: `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim(),
    progress: p.progress || 0,
    score: p.score || 0
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <button
              onClick={() => navigate(`/course-overview/${slug}/reports/course`)}
              className="flex items-center text-gray-600 hover:text-orange-600 mb-4 sm:mb-6 transition-colors tap-target"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Back to Course Reports</span>
            </button>

            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 truncate">{lesson?.title}</h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold capitalize">
                      {lesson?.type}
                    </span>
                    <span className="text-blue-100 text-xs sm:text-sm">{userProgress.length} enrolled users</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-green-700 uppercase tracking-wide">Completed</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-900">{completedCount}</div>
                <div className="text-xs sm:text-sm text-green-600 mt-2">Users finished</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-yellow-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-yellow-700 uppercase tracking-wide">In Progress</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-900">{inProgressCount}</div>
                <div className="text-xs sm:text-sm text-yellow-600 mt-2">Users learning</div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">Not Started</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{notStartedCount}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-2">Yet to begin</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-orange-700 uppercase tracking-wide">Avg Score</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-900">{avgScore}%</div>
                <div className="text-xs sm:text-sm text-orange-600 mt-2">Average performance</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Status Distribution</h2>
                  <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">{userProgress.length} users</div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {statusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">User Progress</h2>
                  <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">Individual scores</div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={progressData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="progress" fill="#10b981" name="Progress %" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="score" fill="#f97316" name="Score %" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">User Details</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Individual user progress for this lesson</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                      <th className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Score</th>
                      <th className="hidden sm:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Accessed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {userProgress.map((progress) => (
                      <tr key={progress.user?._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 md:px-8 py-4 sm:py-5">
                          <div className="flex items-center min-w-0">
                            {progress.user?.profilePicture ? (
                              <img src={progress.user.profilePicture} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold mr-2 sm:mr-3 flex-shrink-0 text-xs sm:text-sm">
                                {progress.user?.firstName?.[0]}{progress.user?.lastName?.[0]}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                                {progress.user?.firstName} {progress.user?.lastName}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 truncate">{progress.user?.email}</div>
                              <div className="sm:hidden mt-1">
                                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  progress.isCompleted ? 'bg-green-100 text-green-700' :
                                  progress.progress > 0 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {progress.isCompleted ? 'Completed' : progress.progress > 0 ? 'In Progress' : 'Not Started'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-8 py-4 sm:py-5">
                          <div className="flex items-center">
                            <div className="w-16 sm:w-24 md:w-28 bg-gray-200 rounded-full h-2 sm:h-2.5 mr-2 sm:mr-3 flex-shrink-0">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 sm:h-2.5 rounded-full transition-all"
                                style={{ width: `${progress.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">{progress.progress || 0}%</span>
                          </div>
                          <div className="md:hidden mt-1 text-xs text-gray-600">
                            Score: {progress.score !== null && progress.score !== undefined ? `${progress.score}%` : 'N/A'}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-4 sm:py-5 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {progress.score !== null && progress.score !== undefined ? `${progress.score}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-4 md:px-8 py-4 sm:py-5 whitespace-nowrap">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                            progress.isCompleted ? 'bg-green-100 text-green-700' :
                            progress.progress > 0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {progress.isCompleted ? 'Completed' : progress.progress > 0 ? 'In Progress' : 'Not Started'}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-4 sm:py-5 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                          {progress.lastAccessed ? new Date(progress.lastAccessed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                        </td>
                      </tr>
                    ))}
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

export default LessonDetailReportPage;

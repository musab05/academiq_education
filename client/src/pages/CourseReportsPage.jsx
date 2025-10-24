import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { lessonAPI } from '../services/api';

const CourseReportsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lessonStats, setLessonStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [slug]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await lessonAPI.getLessonStats(slug);
      setLessonStats(response.data.stats || []);
    } catch (error) {
      console.error('Error fetching course reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = lessonStats.map(stat => ({
    name: stat.lessonTitle,
    completed: stat.completedCount,
    inProgress: stat.inProgressCount,
    avgScore: stat.averageScore || 0
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Course Lesson Reports</h1>
              <p className="text-sm sm:text-base text-gray-600">Analyze lesson-wise completion and performance data</p>
            </div>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Lesson Completion Overview</h2>
                <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">{lessonStats.length} lessons</div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Average Scores by Lesson</h2>
                <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">Performance metrics</div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData.filter(d => d.avgScore > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="avgScore" stroke="#f97316" strokeWidth={3} name="Average Score" dot={{ r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Lesson Details</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Click on any lesson to view detailed progress</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Lesson</th>
                      <th className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                      <th className="hidden sm:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Completed</th>
                      <th className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">In Progress</th>
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                      <th className="hidden xl:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lessonStats.map((stat) => (
                      <tr key={stat.lessonId} onClick={() => navigate(`/course-overview/${slug}/reports/lesson/${stat.lessonId}`)} className="hover:bg-orange-50 transition-colors cursor-pointer tap-target">
                        <td className="px-3 sm:px-4 md:px-8 py-4 sm:py-5">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{stat.lessonTitle}</div>
                            <div className="md:hidden mt-1">
                              <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 capitalize">
                                {stat.lessonType}
                              </span>
                            </div>
                            <div className="sm:hidden mt-1 flex items-center gap-2 text-xs text-gray-600">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                                {stat.completedCount}
                              </span>
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                                {stat.inProgressCount}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-4 sm:py-5 whitespace-nowrap">
                          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 capitalize">
                            {stat.lessonType}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-4 md:px-8 py-4 sm:py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-100 flex items-center justify-center">
                              <span className="text-xs sm:text-sm font-bold text-green-700">{stat.completedCount}</span>
                            </div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-4 sm:py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                              <span className="text-xs sm:text-sm font-bold text-yellow-700">{stat.inProgressCount}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-8 py-4 sm:py-5">
                          <div className="flex items-center">
                            <div className="w-16 sm:w-24 md:w-28 bg-gray-200 rounded-full h-2 sm:h-2.5 mr-2 sm:mr-3 flex-shrink-0">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 sm:h-2.5 rounded-full transition-all"
                                style={{ width: `${stat.completionPercentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">{stat.completionPercentage || 0}%</span>
                          </div>
                        </td>
                        <td className="hidden xl:table-cell px-3 sm:px-4 md:px-8 py-4 sm:py-5 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {stat.averageScore ? `${stat.averageScore.toFixed(1)}%` : 'N/A'}
                          </span>
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

export default CourseReportsPage;

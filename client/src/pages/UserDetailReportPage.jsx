import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { progressAPI, userAPI } from '../services/api';

const UserDetailReportPage = () => {
  const { slug, userId } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId, slug]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const userResponse = await userAPI.getUserDetails(userId);
      setUserData(userResponse.data);
      
      const progressResponse = await progressAPI.getUserLessonProgress(userId, slug);
      setLessonProgress(progressResponse.data || []);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedLessons = lessonProgress.filter(l => l.isCompleted).length;
  const totalLessons = lessonProgress.length;
  const avgScore = lessonProgress.length > 0
    ? Math.round(lessonProgress.reduce((sum, l) => sum + (l.score || 0), 0) / lessonProgress.length)
    : 0;

  const chartData = lessonProgress.map(lesson => ({
    name: lesson.lessonTitle,
    score: lesson.score || 0,
    progress: lesson.progress || 0
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
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 text-white shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold border-2 border-white/30 flex-shrink-0">
                  {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 truncate">
                    {userData?.firstName} {userData?.lastName}
                  </h1>
                  <p className="text-orange-100 flex items-center text-xs sm:text-sm md:text-base">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{userData?.email}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-green-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-green-700 uppercase tracking-wide">Lessons Completed</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-900">
                  {completedLessons}<span className="text-lg sm:text-xl md:text-2xl text-green-600">/{totalLessons}</span>
                </div>
                <div className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-2">Total lessons</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-orange-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-orange-700 uppercase tracking-wide">Average Score</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-900">{avgScore}%</div>
                <div className="text-xs sm:text-sm text-orange-600 mt-1 sm:mt-2">Performance score</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-200 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wide">Completion Rate</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900">
                  {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%
                </div>
                <div className="text-xs sm:text-sm text-blue-600 mt-1 sm:mt-2">Overall progress</div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Lesson Performance</h2>
                <div className="text-xs sm:text-sm text-gray-500">Score vs Progress comparison</div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="score" fill="#f97316" name="Score %" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="progress" fill="#10b981" name="Progress %" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Lesson Details</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Comprehensive breakdown of lesson progress</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Lesson</th>
                      <th className="hidden sm:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                      <th className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Score</th>
                      <th className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="hidden xl:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Accessed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lessonProgress.map((lesson) => (
                      <tr key={lesson.lessonId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5">
                          <div className="font-semibold text-gray-900 text-xs sm:text-sm">{lesson.lessonTitle}</div>
                          <div className="sm:hidden text-xs text-gray-500 mt-1 capitalize">{lesson.lessonType}</div>
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-5 whitespace-nowrap">
                          <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 capitalize">
                            {lesson.lessonType}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 sm:w-20 md:w-28 bg-gray-200 rounded-full h-2 sm:h-2.5">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 sm:h-2.5 rounded-full transition-all"
                                style={{ width: `${lesson.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">{lesson.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-5 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {lesson.score !== null && lesson.score !== undefined ? `${lesson.score}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-5 whitespace-nowrap">
                          <span className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full ${
                            lesson.isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {lesson.isCompleted ? 'Completed' : 'In Progress'}
                          </span>
                        </td>
                        <td className="hidden xl:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-5 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                          {lesson.lastAccessed ? new Date(lesson.lastAccessed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
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

export default UserDetailReportPage;

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BookOpen, TrendingUp, Award, Clock } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { enrollmentAPI } from '../../services/api';

const StudentReportsPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector(state => state.user);

  useEffect(() => {
    fetchStudentReports();
  }, []);

  const fetchStudentReports = async () => {
    try {
      setLoading(true);
      const userId = user?.uuid;
      
      if (!userId) {
        setReportData({ stats: { totalEnrollments: 0, completedCourses: 0, inProgressCourses: 0, avgProgress: 0 }, enrollments: [] });
        setLoading(false);
        return;
      }
      
      const response = await enrollmentAPI.getUserEnrollments(userId, { limit: 100 });
      const enrollments = response.data?.data || [];
      
      const stats = {
        totalEnrollments: enrollments.length,
        completedCourses: enrollments.filter(e => e.status === 'completed').length,
        inProgressCourses: enrollments.filter(e => e.status === 'active').length,
        avgProgress: enrollments.length > 0 
          ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
          : 0
      };
      
      setReportData({ stats, enrollments });
    } catch (error) {
      console.error('Error fetching student reports:', error);
      setReportData({ stats: { totalEnrollments: 0, completedCourses: 0, inProgressCourses: 0, avgProgress: 0 }, enrollments: [] });
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

  const { stats, enrollments } = reportData;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Progress</h1>
              <p className="text-sm sm:text-base text-gray-600">Track your learning journey and achievements</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wide">Enrolled</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-blue-900">{stats.totalEnrollments}</div>
                <div className="text-xs sm:text-sm text-blue-600 mt-1 sm:mt-2">Total courses</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-green-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-green-700 uppercase tracking-wide">Completed</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-green-900">{stats.completedCourses}</div>
                <div className="text-xs sm:text-sm text-green-600 mt-1 sm:mt-2">Finished courses</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-yellow-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-yellow-700 uppercase tracking-wide">In Progress</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-yellow-900">{stats.inProgressCourses}</div>
                <div className="text-xs sm:text-sm text-yellow-600 mt-1 sm:mt-2">Active courses</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-orange-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-orange-700 uppercase tracking-wide">Avg Progress</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-orange-900">{stats.avgProgress}%</div>
                <div className="text-xs sm:text-sm text-orange-600 mt-1 sm:mt-2">Overall progress</div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6 md:p-8">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Course Progress</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Your progress in each enrolled course</p>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Course</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                        <th className="hidden md:table-cell px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Enrolled Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {enrollments.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                            No enrollments found. Enroll in courses to see your progress here.
                          </td>
                        </tr>
                      ) : (
                        enrollments.map((enrollment) => (
                          <tr key={enrollment._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 sm:px-6 py-4 sm:py-5">
                              <div className="font-semibold text-gray-900 text-sm sm:text-base">{enrollment.course?.title || 'Unknown Course'}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 sm:py-5">
                              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                                enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                enrollment.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {enrollment.status}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 sm:py-5">
                              <div className="flex items-center">
                                <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2 sm:h-2.5 mr-2 sm:mr-3">
                                  <div
                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 sm:h-2.5 rounded-full transition-all"
                                    style={{ width: `${enrollment.progress || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-700">{enrollment.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-3 sm:px-6 py-4 sm:py-5">
                              <span className="text-sm text-gray-600">
                                {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReportsPage;

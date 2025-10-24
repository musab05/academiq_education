import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { enrollmentAPI } from '../services/api';

const GlobalCourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getCourseEnrollmentDetails(courseId);
      setCourseData(response.data);
    } catch (error) {
      console.error('Error fetching course details:', error);
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

  if (!courseData) {
    return <div>No data available</div>;
  }

  const { course, enrollments } = courseData;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <button
              onClick={() => navigate('/reports')}
              className="flex items-center text-gray-600 hover:text-orange-600 mb-4 sm:mb-6 transition-colors tap-target"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Back to Global Reports</span>
            </button>

            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-white shadow-lg">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 truncate">{course.title}</h1>
              <p className="text-blue-100 text-sm sm:text-base">{enrollments.length} enrolled users</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Enrolled Users Progress</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Individual user progress for this course</p>
              </div>
              {enrollments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Enrolled</h3>
                  <p className="text-gray-500">This course doesn't have any enrolled users yet</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                      <th className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 md:px-8 py-4 sm:py-5">
                          <div className="flex items-center min-w-0">
                            {enrollment.user?.profilePicture ? (
                              <img src={enrollment.user.profilePicture} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold mr-2 sm:mr-3 flex-shrink-0 text-xs sm:text-sm">
                                {enrollment.user?.firstName?.[0]}{enrollment.user?.lastName?.[0]}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                                {enrollment.user?.firstName} {enrollment.user?.lastName}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 truncate">{enrollment.user?.email}</div>
                              <div className="md:hidden mt-1">
                                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  enrollment.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {enrollment.status === 'completed' ? 'Completed' :
                                   enrollment.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-8 py-4 sm:py-5">
                          <div className="flex items-center">
                            <div className="w-16 sm:w-24 md:w-32 bg-gray-200 rounded-full h-2 sm:h-2.5 mr-2 sm:mr-3 flex-shrink-0">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 sm:h-2.5 rounded-full transition-all"
                                style={{ width: `${enrollment.progress?.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">{enrollment.progress?.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-4 sm:py-5">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                            enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                            enrollment.status === 'active' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {enrollment.status === 'completed' ? 'Completed' :
                             enrollment.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-4 sm:py-5 text-xs sm:text-sm text-gray-600">
                          {new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalCourseDetailPage;

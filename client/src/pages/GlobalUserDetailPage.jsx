import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { enrollmentAPI } from '../services/api';

const GlobalUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getUserEnrollmentDetails(userId);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
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

  if (!userData) {
    return <div>No data available</div>;
  }

  const { user, enrollments } = userData;
  const completedCount = enrollments.filter(e => e.status === 'completed').length;
  const inProgressCount = enrollments.filter(e => e.status === 'active').length;

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

            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-white shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover border-2 border-white/30 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-2 border-white/30 flex-shrink-0">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 truncate">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-orange-100 flex items-center text-sm sm:text-base">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{user.email}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-200">
                <div className="text-xs sm:text-sm font-semibold text-purple-700 uppercase tracking-wide mb-3">Total Courses</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-900">{enrollments.length}</div>
                <div className="text-xs sm:text-sm text-purple-600 mt-2">Enrolled courses</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-green-200">
                <div className="text-xs sm:text-sm font-semibold text-green-700 uppercase tracking-wide mb-3">Completed</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-900">{completedCount}</div>
                <div className="text-xs sm:text-sm text-green-600 mt-2">Finished courses</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-yellow-200 sm:col-span-2 lg:col-span-1">
                <div className="text-xs sm:text-sm font-semibold text-yellow-700 uppercase tracking-wide mb-3">In Progress</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-900">{inProgressCount}</div>
                <div className="text-xs sm:text-sm text-yellow-600 mt-2">Active courses</div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Course Enrollments</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">All courses this user is enrolled in</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Course</th>
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                      <th className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 md:px-8 py-4 sm:py-5">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{enrollment.course?.title}</div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalUserDetailPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, BookOpen, UserCheck } from 'lucide-react';
import { instituteAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

const InstitutesDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await instituteAPI.getAllAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const totalStats = analytics.reduce(
    (acc, item) => ({
      users: acc.users + item.stats.users,
      courses: acc.courses + item.stats.courses,
      enrollments: acc.enrollments + item.stats.enrollments,
    }),
    { users: 0, courses: 0, enrollments: 0 }
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Institutes Overview</h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">System-wide institute analytics</p>
            </div>

            {/* Total Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Total Institutes</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{analytics.length}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{totalStats.users}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Total Courses</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{totalStats.courses}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">Total Enrollments</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{totalStats.enrollments}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Institute Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {analytics.map((item) => (
                <div
                  key={item.institute._id}
                  onClick={() => navigate(`/institutes/${item.institute._id}/analytics`)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-4 sm:p-6 border border-gray-200 cursor-pointer tap-target"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    </div>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        item.institute.subscription.plan === 'enterprise'
                          ? 'bg-purple-100 text-purple-600'
                          : item.institute.subscription.plan === 'premium'
                          ? 'bg-blue-100 text-blue-600'
                          : item.institute.subscription.plan === 'basic'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.institute.subscription.plan}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 truncate">{item.institute.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 font-mono truncate">{item.institute.domain}</p>

                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">{item.stats.users}</div>
                      <div className="text-xs text-gray-600">Users</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">{item.stats.courses}</div>
                      <div className="text-xs text-gray-600">Courses</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">{item.stats.enrollments}</div>
                      <div className="text-xs text-gray-600">Enrollments</div>
                    </div>
                  </div>

                  {/* Usage Bars */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Users</span>
                        <span>{item.usage.usersPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(item.usage.usersPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Courses</span>
                        <span>{item.usage.coursesPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(item.usage.coursesPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutesDashboard;

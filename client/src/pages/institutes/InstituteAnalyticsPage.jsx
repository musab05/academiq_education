import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, UserCheck } from 'lucide-react';
import { instituteAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';

const InstituteAnalyticsPage = () => {
  const { id } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      const response = await instituteAPI.getAnalytics(id);
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

  if (!analytics) return null;

  const { institute, stats, usage, recentActivity } = analytics;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{institute.name}</h1>
        <p className="text-gray-600 text-sm sm:text-base mt-1 truncate">{institute.domain}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-2">
                {usage.users.percentage.toFixed(1)}% of limit
              </p>
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
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
              <p className="text-xs text-gray-500 mt-2">
                {usage.courses.percentage.toFixed(1)}% of limit
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Total Enrollments</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.totalEnrollments}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Usage Bars */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Resource Usage</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span>Users</span>
              <span>{usage.users.current} / {usage.users.limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className="bg-blue-500 h-2 sm:h-3 rounded-full transition-all"
                style={{ width: `${Math.min(usage.users.percentage, 100)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span>Courses</span>
              <span>{usage.courses.current} / {usage.courses.limit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className="bg-green-500 h-2 sm:h-3 rounded-full transition-all"
                style={{ width: `${Math.min(usage.courses.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentActivity.users.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="text-sm sm:text-base font-medium truncate">{user.firstName} {user.lastName}</div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</div>
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded flex-shrink-0">{user.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Recent Courses</h2>
          <div className="space-y-3">
            {recentActivity.courses.map((course) => (
              <div key={course._id} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm sm:text-base font-medium truncate">{course.title}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                  by {course.author.firstName} {course.author.lastName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteAnalyticsPage;

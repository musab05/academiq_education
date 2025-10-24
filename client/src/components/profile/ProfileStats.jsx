import React from 'react';
import { BookOpen, Users, Award, TrendingUp, Building2 } from 'lucide-react';

const ProfileStats = ({ stats, role }) => {
  if (!stats) return null;

  const renderStudentStats = () => (
    <>
      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00] mx-auto mb-1 sm:mb-2" />
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.enrolledCourses || 0}</p>
        <p className="text-xs sm:text-sm text-gray-600">Enrolled Courses</p>
      </div>
      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
        <Award className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00] mx-auto mb-1 sm:mb-2" />
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completedCourses || 0}</p>
        <p className="text-xs sm:text-sm text-gray-600">Completed</p>
      </div>
      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00] mx-auto mb-1 sm:mb-2" />
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.teams || 0}</p>
        <p className="text-xs sm:text-sm text-gray-600">Teams</p>
      </div>
      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00] mx-auto mb-1 sm:mb-2" />
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.averageProgress || 0}%</p>
        <p className="text-xs sm:text-sm text-gray-600">Avg Progress</p>
      </div>
    </>
  );

  const renderInstructorStats = () => (
    <>
      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00] mx-auto mb-1 sm:mb-2" />
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.coursesCreated || 0}</p>
        <p className="text-xs sm:text-sm text-gray-600">Courses Created</p>
      </div>
      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00] mx-auto mb-1 sm:mb-2" />
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalStudents || 0}</p>
        <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
      </div>
      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
        <Award className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00] mx-auto mb-1 sm:mb-2" />
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.completionRate || 0}%</p>
        <p className="text-xs sm:text-sm text-gray-600">Completion Rate</p>
      </div>
      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00] mx-auto mb-1 sm:mb-2" />
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.averageRating || 0}</p>
        <p className="text-xs sm:text-sm text-gray-600">Avg Rating</p>
      </div>
    </>
  );

  const renderAdminStats = () => (
    <>
      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00] mx-auto mb-1 sm:mb-2" />
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
        <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
      </div>
      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00] mx-auto mb-1 sm:mb-2" />
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCourses || 0}</p>
        <p className="text-xs sm:text-sm text-gray-600">Total Courses</p>
      </div>
      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00] mx-auto mb-1 sm:mb-2" />
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activeEnrollments || 0}</p>
        <p className="text-xs sm:text-sm text-gray-600">Active Enrollments</p>
      </div>
      <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
        <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00] mx-auto mb-1 sm:mb-2" />
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.departments || 0}</p>
        <p className="text-xs sm:text-sm text-gray-600">Departments</p>
      </div>
    </>
  );

  return (
    <div className="mt-4 sm:mt-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Statistics</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {role === 'student' && renderStudentStats()}
        {role === 'instructor' && renderInstructorStats()}
        {(role === 'admin' || role === 'superadmin') && renderAdminStats()}
      </div>
    </div>
  );
};

export default ProfileStats;

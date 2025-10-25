import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { enrollmentAPI } from '../services/api';

const TeamReportsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teamEnrollments, setTeamEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [slug]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getEnrollments({ courseSlug: slug, enrolleeType: 'team' });
      const enrollmentsData = response.data.data || response.data || [];
      setTeamEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error fetching team report data:', error);
      setTeamEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const totalTeams = teamEnrollments.length;
  const totalMembers = teamEnrollments.reduce((sum, e) => sum + (e.teamMemberProgress?.length || 0), 0);
  const avgProgress = teamEnrollments.length > 0 
    ? Math.round(teamEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / teamEnrollments.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => {
          if (window.innerWidth < 1024) setSidebarOpen(true);
          else setSidebarCollapsed(!sidebarCollapsed);
        }} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">Team Progress Reports</h1>
              <p className="text-sm sm:text-base text-gray-600">Monitor team performance and member progress</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-purple-700 uppercase tracking-wide">Total Teams</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-900">{totalTeams}</div>
                <div className="text-xs sm:text-sm text-purple-600 mt-1 sm:mt-2">Active teams</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Members</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900">{totalMembers}</div>
                <div className="text-xs sm:text-sm text-blue-600 mt-1 sm:mt-2">Team members</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-orange-200 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-orange-700 uppercase tracking-wide">Avg Progress</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-900">{avgProgress}%</div>
                <div className="text-xs sm:text-sm text-orange-600 mt-1 sm:mt-2">Overall progress</div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4 sm:mb-6 md:mb-8">
              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Team Overview</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Click on any team to view detailed progress</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Team</th>
                      <th className="hidden sm:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Members</th>
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Avg Progress</th>
                      <th className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {teamEnrollments.map((enrollment) => {
                      const team = enrollment.enrolleeId;
                      const memberProgress = enrollment.teamMemberProgress || [];
                      const avgTeamProgress = memberProgress.length > 0
                        ? Math.round(memberProgress.reduce((sum, m) => sum + (m.progress || 0), 0) / memberProgress.length)
                        : 0;
                      
                      return (
                        <tr key={enrollment._id} onClick={() => navigate(`/course-overview/${slug}/reports/teams/${team?._id}`)} className="hover:bg-orange-50 transition-colors cursor-pointer tap-target">
                          <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5">
                            <div className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base truncate">{team?.name}</div>
                            <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{team?.description}</div>
                            <div className="sm:hidden text-xs text-gray-500 mt-1">{memberProgress.length} members</div>
                          </td>
                          <td className="hidden sm:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-2">
                                <span className="text-xs sm:text-sm font-bold text-blue-700">{memberProgress.length}</span>
                              </div>
                              <span className="text-xs sm:text-sm text-gray-600">members</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 sm:w-24 md:w-32 bg-gray-200 rounded-full h-2 sm:h-2.5">
                                <div
                                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 sm:h-2.5 rounded-full transition-all"
                                  style={{ width: `${avgTeamProgress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">{avgTeamProgress}%</span>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-5 whitespace-nowrap">
                            <span className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full ${
                              enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                              enrollment.status === 'active' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {enrollment.status === 'completed' ? 'Completed' :
                               enrollment.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {teamEnrollments.map((enrollment) => {
              const team = enrollment.enrolleeId;
              const memberProgress = enrollment.teamMemberProgress || [];
              
              if (memberProgress.length === 0) return null;

              return (
                <div key={enrollment._id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4 sm:mb-6 md:mb-8">
                  <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{team?.name}</h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Individual member progress breakdown</p>
                  </div>
                  <div className="p-4 sm:p-6 md:p-8">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={memberProgress.map(m => ({
                        name: `${m.user?.firstName || ''} ${m.user?.lastName || ''}`.trim(),
                        progress: m.progress || 0
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                        <Bar dataKey="progress" fill="#f97316" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Member</th>
                          <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                          <th className="hidden sm:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {memberProgress.map((member) => (
                          <tr key={member.user?._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                                  {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                                    {member.user?.firstName} {member.user?.lastName}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600 truncate">{member.user?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 md:px-8 py-3 sm:py-5">
                              <div className="flex items-center gap-2">
                                <div className="w-16 sm:w-24 md:w-32 bg-gray-200 rounded-full h-2 sm:h-2.5">
                                  <div
                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 sm:h-2.5 rounded-full transition-all"
                                    style={{ width: `${member.progress || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">{member.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="hidden sm:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-5 whitespace-nowrap">
                              <span className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full ${
                                member.status === 'completed' ? 'bg-green-100 text-green-700' :
                                member.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {member.status === 'completed' ? 'Completed' :
                                 member.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamReportsPage;

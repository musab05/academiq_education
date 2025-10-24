import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, User } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { enrollmentAPI } from '../services/api';

const TeamDetailReportPage = () => {
  const { slug, teamId } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId, slug]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getTeamEnrollmentDetails(slug, teamId);
      setTeamData(response.data);
    } catch (error) {
      console.error('Error fetching team details:', error);
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

  if (!teamData) {
    return <div>No data available</div>;
  }

  const { team, enrollment, memberProgress } = teamData;
  const completedCount = memberProgress.filter(m => m.status === 'completed').length;
  const activeCount = memberProgress.filter(m => m.status === 'active').length;
  const inactiveCount = memberProgress.filter(m => !m.status || m.status === 'inactive').length;
  const avgProgress = memberProgress.length > 0
    ? Math.round(memberProgress.reduce((sum, m) => sum + (m.progress || 0), 0) / memberProgress.length)
    : 0;

  const statusData = [
    { name: 'Completed', value: completedCount, color: '#10b981' },
    { name: 'Active', value: activeCount, color: '#3b82f6' },
    { name: 'Inactive', value: inactiveCount, color: '#6b7280' }
  ];

  const progressData = memberProgress.map(m => ({
    name: `${m.user?.firstName || ''} ${m.user?.lastName || ''}`.trim(),
    progress: m.progress || 0
  }));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <button
              onClick={() => navigate(`/course-overview/${slug}/reports/teams`)}
              className="flex items-center text-gray-600 hover:text-orange-600 mb-4 sm:mb-6 transition-colors tap-target"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Back to Team Reports</span>
            </button>

            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 truncate">{team?.name}</h1>
                  <p className="text-purple-100 mb-3 sm:mb-4 text-sm sm:text-base line-clamp-2">{team?.description}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold">
                      {memberProgress.length} Members
                    </span>
                    <span className="text-purple-100 text-xs sm:text-sm">Enrolled in course</span>
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
                <div className="text-xs sm:text-sm text-green-600 mt-2">Members finished</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wide">Active</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900">{activeCount}</div>
                <div className="text-xs sm:text-sm text-blue-600 mt-2">Members learning</div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">Inactive</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">{inactiveCount}</div>
                <div className="text-xs sm:text-sm text-gray-600 mt-2">Not started</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs sm:text-sm font-semibold text-orange-700 uppercase tracking-wide">Avg Progress</div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-900">{avgProgress}%</div>
                <div className="text-xs sm:text-sm text-orange-600 mt-2">Team average</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Status Distribution</h2>
                  <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">{memberProgress.length} members</div>
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
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Member Progress</h2>
                  <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">Individual progress</div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="progress" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Member Details</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Individual member progress and performance</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Member</th>
                      <th className="px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                      <th className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {memberProgress.map((member) => (
                      <tr key={member.user?._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 md:px-8 py-4 sm:py-5">
                          <div className="flex items-center min-w-0">
                            {member.user?.profilePicture ? (
                              <img src={member.user.profilePicture} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold mr-2 sm:mr-3 flex-shrink-0 text-xs sm:text-sm">
                                {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                                {member.user?.firstName} {member.user?.lastName}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 truncate">{member.user?.email}</div>
                              <div className="md:hidden mt-1">
                                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  member.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  member.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {member.status === 'completed' ? 'Completed' :
                                   member.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 md:px-8 py-4 sm:py-5">
                          <div className="flex items-center">
                            <div className="w-16 sm:w-24 md:w-28 bg-gray-200 rounded-full h-2 sm:h-2.5 mr-2 sm:mr-3 flex-shrink-0">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 sm:h-2.5 rounded-full transition-all"
                                style={{ width: `${member.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 flex-shrink-0">{member.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-4 md:px-8 py-4 sm:py-5 whitespace-nowrap">
                          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                            member.status === 'completed' ? 'bg-green-100 text-green-700' :
                            member.status === 'active' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {member.status === 'completed' ? 'Completed' :
                             member.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-4 md:px-8 py-4 sm:py-5 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                          {member.lastActive ? new Date(member.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
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

export default TeamDetailReportPage;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Hand, Video, BarChart3 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { classroomAPI } from '../../services/api';

const ClassroomEngagementReportPage = () => {
  const { classroomId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [classroomId]);

  const fetchSessions = async () => {
    try {
      const response = await classroomAPI.getSessions({ classroomId });
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSessions = sessions.length;
  const avgDuration = sessions.length > 0 
    ? (sessions.reduce((sum, s) => {
        const duration = s.endTime ? new Date(s.endTime) - new Date(s.startTime) : 0;
        return sum + duration;
      }, 0) / sessions.length / 60000).toFixed(0)
    : 0;

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => {
          setSidebarCollapsed(!sidebarCollapsed);
          setSidebarOpen(!sidebarOpen);
        }} />
        
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Engagement Report</h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  <span className="text-gray-600 text-xs sm:text-sm">Total Sessions</span>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{totalSessions}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="text-gray-600 text-xs sm:text-sm">Avg Duration</span>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{avgDuration}<span className="text-sm sm:text-base md:text-lg text-gray-500">min</span></p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span className="text-gray-600 text-xs sm:text-sm">Chat Messages</span>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">-</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Hand className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  <span className="text-gray-600 text-xs sm:text-sm">Interactions</span>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">-</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Session Engagement</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-600 font-semibold text-xs sm:text-sm">Session</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-600 font-semibold text-xs sm:text-sm hidden md:table-cell">Date</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-600 font-semibold text-xs sm:text-sm hidden lg:table-cell">Duration</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-600 font-semibold text-xs sm:text-sm">Participants</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => {
                        const duration = session.endTime 
                          ? ((new Date(session.endTime) - new Date(session.startTime)) / 60000).toFixed(0)
                          : '-';
                        return (
                          <tr key={session._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 text-xs sm:text-sm">
                              <div className="truncate max-w-[150px] sm:max-w-none" title={session.title}>{session.title}</div>
                              <div className="text-xs text-gray-500 md:hidden mt-1">{new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm hidden md:table-cell">{new Date(session.startTime).toLocaleDateString()}</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm hidden lg:table-cell">{duration} min</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm">{session.attendance?.length || 0}</td>
                          </tr>
                        );
                      })}
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

export default ClassroomEngagementReportPage;

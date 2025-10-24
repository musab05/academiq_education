import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Clock, Calendar } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { classroomAPI } from '../../services/api';
import { setCurrentClassroom, setCurrentClassroomData } from '../../store/slices/classroomSlice';

const SessionAttendanceDetailPage = () => {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [classroomId, setClassroomId] = useState(null);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      const response = await classroomAPI.getSessionAnalytics(sessionId);
      const sessionData = response.data.session;
      setSession(sessionData);
      setAnalytics(response.data.analytics);
      
      // Extract classroom ID and set it in Redux
      console.log('Session data:', sessionData); // Debug log
      if (sessionData?.classroom?._id) {
        console.log('Setting classroom ID:', sessionData.classroom._id); // Debug log
        setClassroomId(sessionData.classroom._id);
        dispatch(setCurrentClassroom(sessionData.classroom._id));
        dispatch(setCurrentClassroomData(sessionData.classroom));
      } else {
        console.warn('No classroom ID found in session data'); // Debug log
      }
    } catch (error) {
      console.error('Error fetching session details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
            <button
              onClick={() => navigate(-1)}
              className="tap-target flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Back to Attendance Report
            </button>

            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{session?.title}</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                {new Date(session?.startTime).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span className="text-gray-600 text-xs sm:text-sm">Unique Attendees</span>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{analytics?.uniqueAttendees || 0}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span className="text-gray-600 text-xs sm:text-sm">Total Sessions</span>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{analytics?.totalAttendanceRecords || 0}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  <span className="text-gray-600 text-xs sm:text-sm">Avg Duration</span>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{formatDuration(analytics?.avgDuration || 0)}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Detailed Attendance</h2>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-600 font-semibold text-xs sm:text-sm">Name</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-600 font-semibold text-xs sm:text-sm hidden md:table-cell">Email</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-600 font-semibold text-xs sm:text-sm hidden lg:table-cell">First Joined</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-600 font-semibold text-xs sm:text-sm hidden lg:table-cell">Last Left</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-600 font-semibold text-xs sm:text-sm">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.userAttendance?.map((attendance, index) => {
                      const firstJoin = attendance.sessions[0]?.joinTime;
                      const lastSession = attendance.sessions[attendance.sessions.length - 1];
                      const lastLeave = lastSession?.leaveTime;
                      
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 text-xs sm:text-sm">
                            <div>{attendance.user.firstName} {attendance.user.lastName}</div>
                            <div className="text-xs text-gray-500 md:hidden mt-1">{attendance.user.email}</div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm hidden md:table-cell">{attendance.user.email}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm hidden lg:table-cell">
                            {firstJoin ? new Date(firstJoin).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm hidden lg:table-cell">
                            {lastLeave ? new Date(lastLeave).toLocaleString() : 'Still in session'}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm font-medium">
                            {formatDuration(attendance.totalDuration)}
                          </td>
                        </tr>
                      );
                    })}
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

export default SessionAttendanceDetailPage;

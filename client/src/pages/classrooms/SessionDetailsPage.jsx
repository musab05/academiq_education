import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Video, Calendar, Clock, Users, FileText, Play, Download, Upload, Lock, Key, Edit, Trash2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { classroomAPI } from '../../services/api';
import { setCurrentClassroom, setCurrentClassroomData } from '../../store/slices/classroomSlice';
import EditSessionModal from './EditSessionModal';

const SessionDetailsPage = () => {
  const { sessionId } = useParams();
  const dispatch = useDispatch();
  const [session, setSession] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const currentUser = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const [classroomId, setClassroomId] = useState(null);

  useEffect(() => {
    fetchSession();
    fetchAnalytics();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await classroomAPI.getSessionById(sessionId);
      const sessionData = response.data;
      setSession(sessionData);
      
      // Extract classroom ID if available and set it in Redux
      if (sessionData?.classroom?._id) {
        setClassroomId(sessionData.classroom._id);
        dispatch(setCurrentClassroom(sessionData.classroom._id));
        dispatch(setCurrentClassroomData(sessionData.classroom));
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      // If session access is denied (403), redirect to classroom
      if (error.response?.status === 403) {
        navigate(`/dashboard/classrooms/${classroomId || session?.classroom?._id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await classroomAPI.getSessionAnalytics(sessionId);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleJoin = async () => {
    try {
      let accessCode = '';
      if (session.isPrivate && session.accessCode) {
        accessCode = prompt('Enter access code to join this private session:');
        if (!accessCode) return;
      }
      
      await classroomAPI.joinSession(sessionId, { accessCode });
      if (session.meetingLink) {
        window.open(session.meetingLink, '_blank');
      } else {
        navigate(`/classrooms/${sessionId}/live`);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to join session');
      console.error('Error joining session:', error);
    }
  };

  const handleUpdateSession = async (updateData) => {
    try {
      const response = await classroomAPI.updateSession(sessionId, updateData);
      setSession(response.data);
      // Refresh analytics as well
      fetchAnalytics();
    } catch (error) {
      console.error('Error updating session:', error);
      throw error; // Re-throw to handle in the modal
    }
  };

  const handleDeleteSession = async () => {
    if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone. Note: Attendance records will be preserved for reporting purposes.')) {
      return;
    }

    setDeleting(true);
    try {
      await classroomAPI.deleteSession(sessionId);
      alert('Session deleted successfully');
      // Navigate back to classroom or sessions list
      if (classroomId) {
        navigate(`/classroom/${classroomId}`);
      } else {
        navigate('/classrooms');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      alert(error.response?.data?.error || 'Failed to delete session');
    } finally {
      setDeleting(false);
    }
  };

  // Check if current user can edit/delete this session
  const canModifySession = () => {
    if (!currentUser || !session) return false;
    
    return currentUser.role === 'superadmin' ||
           session.instructor._id === currentUser._id ||
           (currentUser.role === 'admin' && session.institute?.toString() === currentUser.institute?.toString());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return <div>Session not found</div>;
  }

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} classroomId={classroomId} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />
        
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            {session?.classroom && (
              <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4 overflow-x-auto">
                <button
                  onClick={() => navigate(`/classroom/${session.classroom._id}`)}
                  className="tap-target hover:text-orange-600 transition-colors whitespace-nowrap"
                >
                  {session.classroom.title || 'Classroom'}
                </button>
                <span>/</span>
                <span className="text-gray-900 font-medium whitespace-nowrap">Session Details</span>
              </nav>
            )}
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{session.title}</h1>
                  <p className="text-sm sm:text-base text-gray-600 break-words">{session.description}</p>
                  {session.isPrivate && (
                    <div className="flex items-center gap-2 mt-2 text-orange-600">
                      <Lock className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">Private Session</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
                    session.status === 'live' ? 'bg-green-100 text-green-800' :
                    session.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {session.status}
                  </span>
                  
                  {canModifySession() && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="tap-target p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit Session"
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={handleDeleteSession}
                        disabled={deleting}
                        className="tap-target p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Date</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{new Date(session.startTime).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Time</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                      {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:col-span-2 md:col-span-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Participants</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                      {session.attendance?.filter(a => !a.leaveTime).length || 0} / {session.maxParticipants}
                    </p>
                  </div>
                </div>
              </div>

              {(session.status === 'live' || session.status === 'upcoming') && (
                <button
                  onClick={handleJoin}
                  className="tap-target w-full py-3 sm:py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all font-semibold flex items-center justify-center gap-2 mb-4 sm:mb-6 text-sm sm:text-base"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  Join Live Session
                </button>
              )}

              {session.recordingLink && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Recording</h3>
                  <a
                    href={session.recordingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-target flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm sm:text-base"
                  >
                    <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                    Watch Recording
                  </a>
                </div>
              )}

              {session.resources && session.resources.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Resources</h3>
                  <div className="space-y-2">
                    {session.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tap-target flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors min-w-0"
                      >
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-900 truncate flex-1">{resource.name}</span>
                        <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {analytics && (
                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Session Analytics</h3>
                    <button
                      onClick={() => navigate(`/sessions/${sessionId}/attendance`)}
                      className="tap-target w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">View Detailed Attendance</span>
                      <span className="sm:hidden">View Attendance</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Attendees</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.totalAttendees}</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Active Now</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.activeParticipants}</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Avg Duration</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.avgDuration} min</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Capacity</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics.maxParticipants}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Session Modal */}
      <EditSessionModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        session={session}
        onUpdate={handleUpdateSession}
      />
    </div>
  );
};

export default SessionDetailsPage;

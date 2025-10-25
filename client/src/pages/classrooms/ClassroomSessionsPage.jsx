import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Calendar, Plus, Video, Users, Clock } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { classroomAPI } from '../../services/api';
import CreateSessionModal from './CreateSessionModal';

const ClassroomSessionsPage = () => {
  const { classroomId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const currentUser = useSelector((state) => state.user.user);
  const navigate = useNavigate();

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

  const isInstructor = currentUser?.role !== 'student';

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => {
          setSidebarCollapsed(!sidebarCollapsed);
          setSidebarOpen(!sidebarOpen);
        }} />
        
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Sessions</h1>
              {currentUser?.role !== 'student' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="tap-target w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Schedule Session
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">No sessions scheduled yet</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() => navigate(`/classrooms/${session._id}`)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:border-orange-500 cursor-pointer transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:justify-between">
                      <div className="flex-1 w-full sm:w-auto min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <Video className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{session.title}</h3>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{session.description}</p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{new Date(session.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div 
                            className="tap-target flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:text-orange-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/sessions/${session._id}/attendance`);
                            }}
                          >
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>{session.attendance?.filter(a => !a.leaveTime).length || 0} / {session.maxParticipants}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0 self-start ${
                        session.status === 'live' ? 'bg-green-100 text-green-800' :
                        session.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateSessionModal
          classroomId={classroomId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchSessions();
          }}
        />
      )}
    </div>
  );
};

export default ClassroomSessionsPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Calendar, Clock, Users } from 'lucide-react';
import { classroomAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const StudentSessionPage = () => {
  const { sessionId, classroomId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await classroomAPI.getSessionById(sessionId);
      setSession(response.data);
    } catch (error) {
      console.error('Error fetching session:', error);
      showNotification({ type: 'error', message: 'Failed to load session' });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = () => {
    navigate(`/classrooms/${sessionId}/live`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session not found</h2>
          <button
            onClick={() => navigate(`/classroom/${classroomId}`)}
            className="text-orange-500 hover:text-orange-600"
          >
            Back to classroom
          </button>
        </div>
      </div>
    );
  }

  const isLive = session.status === 'live';
  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(`/classroom/${classroomId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Classroom</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              {isLive && (
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold animate-pulse">
                  LIVE
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{session.title}</h1>
            <p className="text-orange-100">{session.description}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {startTime.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">
                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Participants</p>
                  <p className="font-medium text-gray-900">
                    {session.attendance?.filter(a => !a.leaveTime).length || 0} / {session.maxParticipants}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-8">
              {isLive ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Video className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Session is Live!</h2>
                  <p className="text-gray-600 mb-6 text-center">Join now to participate in the live session</p>
                  <button
                    onClick={handleJoinSession}
                    className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-lg"
                  >
                    Join Session
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Video className="w-10 h-10 text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Not Started</h2>
                  <p className="text-gray-600 text-center">
                    This session will start on {startTime.toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })} at {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </>
              )}
            </div>

            {session.instructor && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
                <div className="flex items-center gap-3">
                  <img
                    src={session.instructor.profilePicture || `https://ui-avatars.com/api/?name=${session.instructor.firstName}+${session.instructor.lastName}&background=FF5A00&color=fff`}
                    alt={`${session.instructor.firstName} ${session.instructor.lastName}`}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.instructor.firstName} {session.instructor.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{session.instructor.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSessionPage;

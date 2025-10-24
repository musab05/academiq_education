import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Play, Download, Trash2, Clock, Calendar, User } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { recordingAPI } from '../../services/api';

const ClassroomRecordingsPage = () => {
  const { classroomId } = useParams();
  const currentClassroom = useSelector((state) => state.classroom.currentClassroom);
  const effectiveClassroomId = classroomId || currentClassroom?._id || currentClassroom;
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (effectiveClassroomId) {
      fetchRecordings();
    }
  }, [effectiveClassroomId]);

  const fetchRecordings = async () => {
    try {
      const response = await recordingAPI.getRecordingsByClassroom(effectiveClassroomId);
      setRecordings(response.data);
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatch = (id) => {
    const videoUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/recordings/watch/${id}`;
    window.open(videoUrl, '_blank');
  };

  const handleDownload = async (id, fileName) => {
    try {
      const response = await recordingAPI.downloadRecording(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading recording:', error);
      alert('Failed to download recording');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) return;
    
    try {
      await recordingAPI.deleteRecording(id);
      setRecordings(recordings.filter(r => r._id !== id));
    } catch (error) {
      console.error('Error deleting recording:', error);
      alert('Failed to delete recording');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => {
          setSidebarCollapsed(!sidebarCollapsed);
          setSidebarOpen(!sidebarOpen);
        }} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Session Recordings</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Recorded sessions for this classroom</p>
        </div>

              {recordings.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 sm:p-12 text-center">
                  <Play className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No recordings yet</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Recordings from live sessions will appear here</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {recordings.map((recording) => (
                    <div key={recording._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-0 sm:justify-between">
                        <div className="flex-1 w-full sm:w-auto min-w-0">
                          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 truncate" title={recording.title}>{recording.title}</h3>
                          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>{new Date(recording.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>{formatDuration(recording.duration)}</span>
                            </div>
                            <div className="flex items-center gap-1 hidden md:flex">
                              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate max-w-[150px]">{recording.recordedBy?.firstName} {recording.recordedBy?.lastName}</span>
                            </div>
                            <div className="text-gray-500">
                              {formatFileSize(recording.fileSize)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto sm:ml-4">
                          <button
                            onClick={() => handleWatch(recording._id)}
                            className="tap-target flex-1 sm:flex-none p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            title="Watch"
                          >
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
                          </button>
                          <button
                            onClick={() => handleDownload(recording._id, recording.fileName)}
                            className="tap-target flex-1 sm:flex-none p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
                          </button>
                          <button
                            onClick={() => handleDelete(recording._id)}
                            className="tap-target flex-1 sm:flex-none p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassroomRecordingsPage;

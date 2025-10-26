import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Play, Download, Trash2, Clock, Calendar, User, Video, X } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { recordingAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const ClassroomRecordingsPage = () => {
  const { classroomId } = useParams();
  const currentClassroom = useSelector((state) => state.classroom.currentClassroom);
  const effectiveClassroomId = classroomId || currentClassroom?._id || currentClassroom;
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, recordingId: null, title: '' });
  const { showNotification } = useNotification();

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
      showNotification('Recording downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading recording:', error);
      showNotification('Failed to download recording', 'error');
    }
  };

  const handleDeleteClick = (id, title) => {
    setDeleteModal({ show: true, recordingId: id, title });
  };

  const handleDeleteConfirm = async () => {
    try {
      await recordingAPI.deleteRecording(deleteModal.recordingId);
      setRecordings(recordings.filter(r => r._id !== deleteModal.recordingId));
      showNotification('Recording deleted successfully', 'success');
      setDeleteModal({ show: false, recordingId: null, title: '' });
    } catch (error) {
      console.error('Error deleting recording:', error);
      showNotification('Failed to delete recording', 'error');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, recordingId: null, title: '' });
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
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Session Recordings</h1>
                <p className="text-gray-600 mt-2">View and manage recorded classroom sessions</p>
              </div>

              {recordings.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
                >
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No recordings yet</h3>
                  <p className="text-gray-600">Recordings from live sessions will appear here</p>
                </motion.div>
              ) : (
                <div className="grid gap-4">
                  {recordings.map((recording, index) => (
                    <motion.div 
                      key={recording._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Video className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{recording.title}</h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{new Date(recording.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{formatDuration(recording.duration)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{recording.recordedBy?.firstName} {recording.recordedBy?.lastName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">{formatFileSize(recording.fileSize)}</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleWatch(recording._id)}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium"
                              >
                                <Play className="w-4 h-4" />
                                Watch
                              </button>
                              <button
                                onClick={() => handleDownload(recording._id, recording.fileName)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                              <button
                                onClick={() => handleDeleteClick(recording._id, recording.title)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Delete Recording</h3>
                </div>
                <button
                  onClick={handleDeleteCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this recording?
              </p>
              <p className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg mb-6">
                {deleteModal.title}
              </p>
              <p className="text-sm text-red-600 mb-6">
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClassroomRecordingsPage;

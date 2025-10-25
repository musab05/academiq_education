import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Download, Trash2, Clock, Calendar, User, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { recordingAPI, teamAPI } from '../services/api';

const TeamRecordingsPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [teamId]);

  const fetchData = async () => {
    try {
      const [teamRes, recordingsRes] = await Promise.all([
        teamAPI.getTeams(),
        recordingAPI.getRecordings()
      ]);
      
      const foundTeam = teamRes.data.find(t => t._id === teamId);
      setTeam(foundTeam);
      
      const teamRecordings = recordingsRes.data.filter(r => r.team?._id === teamId);
      setRecordings(teamRecordings);
    } catch (error) {
      console.error('Error fetching data:', error);
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

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => {
          if (window.innerWidth < 1024) setSidebarOpen(true);
          else setSidebarCollapsed(!sidebarCollapsed);
        }} />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <button
                onClick={() => navigate(`/teams/${teamId}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 tap-target"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm sm:text-base">Back to Team</span>
              </button>

        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{team?.name} - Recordings</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Meeting recordings for this team</p>
        </div>

              {recordings.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
                  <Play className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No recordings yet</h3>
                  <p className="text-sm sm:text-base text-gray-600">Recordings from team meetings will appear here</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {recordings.map((recording) => (
                    <div key={recording._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 truncate">{recording.title}</h3>
                          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{new Date(recording.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              {formatDuration(recording.duration)}
                            </div>
                            <div className="flex items-center gap-1 min-w-0">
                              <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{recording.recordedBy?.firstName} {recording.recordedBy?.lastName}</span>
                            </div>
                            <div className="text-gray-500">
                              {formatFileSize(recording.fileSize)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 sm:ml-4">
                          <button
                            onClick={() => handleWatch(recording._id)}
                            className="flex-1 sm:flex-none p-2 sm:p-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors tap-target"
                            title="Watch"
                          >
                            <Play className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
                          </button>
                          <button
                            onClick={() => handleDownload(recording._id, recording.fileName)}
                            className="flex-1 sm:flex-none p-2 sm:p-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors tap-target"
                            title="Download"
                          >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
                          </button>
                          <button
                            onClick={() => handleDelete(recording._id)}
                            className="flex-1 sm:flex-none p-2 sm:p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors tap-target"
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

export default TeamRecordingsPage;

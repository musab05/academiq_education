import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, List, Trash2, Edit, BookOpen, Globe, Lock } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { playlistAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', isPublic: false });
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await playlistAPI.getPlaylists();
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylist.name.trim()) return;
    try {
      await playlistAPI.createPlaylist(newPlaylist);
      showNotification({ type: 'success', message: 'Playlist created' });
      setShowCreateModal(false);
      setNewPlaylist({ name: '', description: '', isPublic: false });
      fetchPlaylists();
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to create playlist' });
    }
  };

  const handleDeletePlaylist = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this playlist?')) return;
    try {
      await playlistAPI.deletePlaylist(id);
      showNotification({ type: 'success', message: 'Playlist deleted' });
      fetchPlaylists();
    } catch (error) {
      showNotification({ type: 'error', message: error.response?.data?.error || 'Failed to delete playlist' });
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />
        
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">My Playlists</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Organize your courses into playlists</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2 transition-colors text-sm tap-target w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                Create Playlist
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {playlists.map((playlist) => (
                  <motion.div
                    key={playlist._id}
                    whileHover={{ y: -2 }}
                    onClick={() => navigate(`/playlists/${playlist._id}`)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <List className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      {!playlist.isDefault && (
                        <button
                          onClick={(e) => handleDeletePlaylist(playlist._id, e)}
                          className="text-gray-400 hover:text-red-500 transition-colors tap-target p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{playlist.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{playlist.description || 'No description'}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{playlist.courses?.length || 0} courses</span>
                      </div>
                      {playlist.isPublic ? (
                        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" title="Public" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" title="Private" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Create Playlist</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  placeholder="Enter playlist name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                  rows={3}
                  placeholder="Enter description (optional)"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer tap-target">
                  <input
                    type="checkbox"
                    checked={newPlaylist.isPublic}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, isPublic: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Make this playlist public</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Public playlists can be shared with others</p>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm tap-target"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm tap-target"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;

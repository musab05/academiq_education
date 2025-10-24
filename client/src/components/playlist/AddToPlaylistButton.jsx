import React, { useState, useEffect, useRef } from 'react';
import { Plus, List, Check } from 'lucide-react';
import { playlistAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const AddToPlaylistButton = ({ courseId, compact = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const menuRef = useRef(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (showMenu) {
      fetchPlaylists();
    }
  }, [showMenu]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      await playlistAPI.getDefaultPlaylist();
      const response = await playlistAPI.getPlaylists();
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      await playlistAPI.createPlaylist({ name: newPlaylistName, description: '', isPublic: false });
      showNotification({ type: 'success', message: 'Playlist created' });
      setNewPlaylistName('');
      setShowCreateModal(false);
      fetchPlaylists();
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to create playlist' });
    }
  };

  const handleAddToPlaylist = async (playlistId, e) => {
    e.stopPropagation();
    try {
      await playlistAPI.addCourse(playlistId, courseId);
      showNotification({ type: 'success', message: 'Added to playlist' });
      fetchPlaylists();
    } catch (error) {
      showNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to add to playlist' 
      });
    }
  };

  const isInPlaylist = (playlist) => {
    return playlist.courses?.some(c => c._id === courseId || c === courseId);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className={compact 
          ? "p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-md"
          : "px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
        }
      >
        <List className="w-4 h-4" />
        {!compact && <span>Add to Playlist</span>}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-[100] max-h-80 overflow-y-auto">
          <div className="p-2">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              <>
                {playlists.map((playlist) => (
                  <button
                    key={playlist._id}
                    onClick={(e) => !isInPlaylist(playlist) && handleAddToPlaylist(playlist._id, e)}
                    disabled={isInPlaylist(playlist)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      isInPlaylist(playlist)
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <List className="w-4 h-4" />
                      <span className="text-sm">{playlist.name}</span>
                    </div>
                    {isInPlaylist(playlist) && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </button>
                ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-orange-500 hover:bg-orange-50 transition-colors mt-1 border-t border-gray-100"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Create New Playlist</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Create Playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              placeholder="Playlist name"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToPlaylistButton;

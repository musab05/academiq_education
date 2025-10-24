import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { setCourseListSource } from '../../store/slices/navigationSlice';
import { ArrowLeft, Globe, Lock, Share2, Copy, BookOpen, Trash2, Edit2 } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';
import { playlistAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useSelector } from 'react-redux';

const PlaylistDetailPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '', isPublic: false });
  const isOwner = playlist?.isOwner || false;

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    try {
      const response = await playlistAPI.getPlaylistById(playlistId);
      setPlaylist(response.data);
      setEditData({
        name: response.data.name,
        description: response.data.description || '',
        isPublic: response.data.isPublic || false,
      });
    } catch (error) {
      showNotification({ type: 'error', message: error.response?.data?.error || 'Failed to load playlist' });
      navigate('/playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPlaylist = async () => {
    if (!isOwner) {
      try {
        await playlistAPI.copyPlaylist(playlistId);
        showNotification({ type: 'success', message: 'Playlist copied to your library' });
        navigate('/playlists');
      } catch (error) {
        showNotification({ type: 'error', message: error.response?.data?.error || 'Failed to copy playlist' });
      }
    }
  };

  const handleShareLink = () => {
    const link = `${window.location.origin}/playlists/${playlistId}`;
    navigator.clipboard.writeText(link);
    showNotification({ type: 'success', message: 'Link copied to clipboard' });
  };

  const handleUpdatePlaylist = async () => {
    try {
      await playlistAPI.updatePlaylist(playlistId, editData);
      showNotification({ type: 'success', message: 'Playlist updated' });
      setShowEditModal(false);
      fetchPlaylist();
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to update playlist' });
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!window.confirm('Remove this course from playlist?')) return;
    try {
      await playlistAPI.removeCourse(playlistId, courseId);
      showNotification({ type: 'success', message: 'Course removed' });
      fetchPlaylist();
    } catch (error) {
      showNotification({ type: 'error', message: 'Failed to remove course' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mt-4 sm:mt-6">
            <button
              onClick={() => navigate('/playlists')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 tap-target"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm sm:text-base">Back to Playlists</span>
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">{playlist.name}</h1>
                    {playlist.isPublic ? (
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" title="Public" />
                    ) : (
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" title="Private" />
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{playlist.description || 'No description'}</p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{playlist.courses?.length || 0} courses</span>
                    </div>
                    {!isOwner && playlist.user && (
                      <span>By {playlist.user.firstName} {playlist.user.lastName}</span>
                    )}
                  </div>
                  {isOwner && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <button
                        onClick={async () => {
                          if (playlist.isDefault) return;
                          try {
                            await playlistAPI.updatePlaylist(playlistId, { ...playlist, isPublic: !playlist.isPublic });
                            showNotification({ type: 'success', message: 'Playlist visibility updated' });
                            fetchPlaylist();
                          } catch (error) {
                            showNotification({ type: 'error', message: 'Failed to update visibility' });
                          }
                        }}
                        disabled={playlist.isDefault}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed tap-target ${
                          playlist.isPublic ? 'bg-orange-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            playlist.isPublic ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-xs sm:text-sm text-gray-700">{playlist.isPublic ? 'Public' : 'Private'}</span>
                      {playlist.isDefault && (
                        <span className="text-xs text-gray-500">Default playlist cannot be made public</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                  {isOwner ? (
                    <>
                      {playlist.isPublic && (
                        <button
                          onClick={handleShareLink}
                          className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm tap-target"
                        >
                          <Share2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Share</span>
                        </button>
                      )}
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="flex-1 lg:flex-initial px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 text-sm tap-target"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    </>
                  ) : (
                    playlist.isPublic && (
                      <button
                        onClick={handleCopyPlaylist}
                        className="w-full lg:w-auto px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 text-sm tap-target"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">Add to My Playlists</span>
                        <span className="sm:hidden">Add to Library</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {playlist.courses?.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm sm:text-base text-gray-500">No courses in this playlist</p>
                </div>
              ) : (
                playlist.courses?.map((course) => (
                  <motion.div
                    key={course._id}
                    whileHover={{ x: 2 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
                  >
                    <img
                      src={course.thumbnail || '/placeholder-course.jpg'}
                      alt={course.title}
                      className="w-full sm:w-24 h-32 sm:h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{course.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-1">{course.description}</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          dispatch(setCourseListSource(`/playlists/${playlistId}`));
                          navigate(`/course-preview/${course.slug}`);
                        }}
                        className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors text-sm tap-target"
                      >
                        View
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveCourse(course._id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors tap-target"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Edit Playlist</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer tap-target">
                  <input
                    type="checkbox"
                    checked={editData.isPublic}
                    onChange={(e) => setEditData({ ...editData, isPublic: e.target.checked })}
                    disabled={playlist?.isDefault}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-700">Make this playlist public</span>
                </label>
                {playlist?.isDefault && (
                  <p className="text-xs text-gray-500 mt-1 ml-6">Default playlist cannot be made public</p>
                )}
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm tap-target"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePlaylist}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm tap-target"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetailPage;

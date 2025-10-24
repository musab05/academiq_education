import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, Lock, Key } from 'lucide-react';

const EditSessionModal = ({ isOpen, onClose, session, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
    recordingLink: '',
    maxParticipants: 100,
    isPrivate: false,
    accessCode: '',
    status: 'upcoming'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title || '',
        description: session.description || '',
        startTime: session.startTime ? new Date(session.startTime).toISOString().slice(0, 16) : '',
        endTime: session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '',
        meetingLink: session.meetingLink || '',
        recordingLink: session.recordingLink || '',
        maxParticipants: session.maxParticipants || 100,
        isPrivate: session.isPrivate || false,
        accessCode: session.accessCode || '',
        status: session.status || 'upcoming'
      });
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        alert('Title is required');
        return;
      }

      if (!formData.startTime || !formData.endTime) {
        alert('Start and end times are required');
        return;
      }

      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        alert('End time must be after start time');
        return;
      }

      await onUpdate(formData);
      onClose();
    } catch (error) {
      console.error('Error updating session:', error);
      alert(error.response?.data?.error || 'Failed to update session');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        >
          <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 rounded-t-lg z-10">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Session</h2>
            <button
              onClick={onClose}
              className="tap-target p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Enter session title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base resize-none"
                placeholder="Enter session description"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Meeting Link */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Meeting Link
              </label>
              <input
                type="url"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                placeholder="https://meet.example.com/room"
              />
            </div>

            {/* Recording Link */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Recording Link
              </label>
              <input
                type="url"
                name="recordingLink"
                value={formData.recordingLink}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                placeholder="https://recordings.example.com/session"
              />
            </div>

            {/* Max Participants and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
                  Max Participants
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPrivate"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="isPrivate" className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-700 flex items-center">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                  Private Session
                </label>
              </div>

              {formData.isPrivate && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
                    Access Code
                  </label>
                  <input
                    type="text"
                    name="accessCode"
                    value={formData.accessCode}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter access code for private session"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="tap-target w-full sm:flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="tap-target w-full sm:flex-1 px-4 py-2.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? 'Updating...' : 'Update Session'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditSessionModal;

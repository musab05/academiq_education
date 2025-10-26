import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { classroomAPI, courseAPI } from '../../services/api';
import CourseSelector from '../../components/department/CourseSelector';

const CreateSessionModal = ({ classroomId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    meetingLink: '',
    maxParticipants: 100,
    isPrivate: false,
    accessCode: '',
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [minDateTime, setMinDateTime] = useState('');

  useEffect(() => {
    fetchCourses();
    // Set minimum date/time to current time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setMinDateTime(now.toISOString().slice(0, 16));
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getMyCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...formData };
      if (classroomId) {
        payload.classroomId = classroomId;
        delete payload.courseId;
      }
      await classroomAPI.createSession(payload);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-200 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Schedule Live Session</h2>
            <button onClick={onClose} className="tap-target p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {!classroomId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
              <CourseSelector
                courses={courses}
                selected={formData.courseId}
                onSelect={(courseId) => setFormData({ ...formData, courseId })}
                placeholder="Select a course"
              />
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Session Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              placeholder="e.g., Introduction to React Hooks"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Brief description of the session"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Start Time *</label>
              <input
                type="datetime-local"
                required
                min={minDateTime}
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">End Time *</label>
              <input
                type="datetime-local"
                required
                min={formData.startTime || minDateTime}
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Meeting Link (Optional)</label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              placeholder="https://meet.jit.si/your-room"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate a Jitsi meeting link</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Max Participants</label>
              <input
                type="number"
                min="1"
                max="500"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-xs sm:text-sm font-medium text-gray-700">Private Session</span>
              </label>
            </div>
          </div>

          {formData.isPrivate && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Access Code (Optional)</label>
              <input
                type="text"
                value={formData.accessCode}
                onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Enter a code for participants to join"
              />
              <p className="text-xs text-gray-500 mt-1">Participants will need this code to join the session</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="tap-target w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="tap-target w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Creating...' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateSessionModal;

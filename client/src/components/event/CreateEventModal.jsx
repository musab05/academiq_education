import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, MapPin, Users, Hash } from 'lucide-react';
import DateTimeSelector from './DateTimeSelector';
import EventTypeSelector from './EventTypeSelector';
import EventStatusSelector from './EventStatusSelector';
import UserSelector from '../department/UserSelector';

const CreateEventModal = ({ isOpen, onClose, onCreateEvent, loading, users = [], event = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: null,
    endDate: null,
    location: '',
    type: 'other',
    status: 'draft',
    maxAttendees: '',
    organizerId: ''
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        startDate: event.startDate ? new Date(event.startDate) : null,
        endDate: event.endDate ? new Date(event.endDate) : null,
        location: event.location || '',
        type: event.type || 'other',
        status: event.status || 'draft',
        maxAttendees: event.maxAttendees || '',
        organizerId: event.organizer?._id || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startDate: null,
        endDate: null,
        location: '',
        type: 'other',
        status: 'draft',
        maxAttendees: '',
        organizerId: ''
      });
    }
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreateEvent(formData);
    setFormData({
      title: '',
      description: '',
      startDate: null,
      endDate: null,
      location: '',
      type: 'other',
      status: 'draft',
      maxAttendees: '',
      organizerId: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-2">{event ? 'Edit Event' : 'Create Event'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 tap-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Event Title *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
                  placeholder="Enter event title"
                />
              </div>
            </div>

            <EventTypeSelector
              selected={formData.type}
              onSelect={(value) => setFormData(prev => ({ ...prev, type: value }))}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-xs sm:text-sm"
                placeholder="Event description (optional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <DateTimeSelector
              label="Start Date & Time"
              value={formData.startDate}
              onChange={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
              required
            />

            <DateTimeSelector
              label="End Date & Time"
              value={formData.endDate}
              onChange={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
                  placeholder="Event location (optional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Max Attendees
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-2.5 sm:top-3.5 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                  className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs sm:text-sm"
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Event Organizer
              </label>
              <UserSelector
                users={users}
                selected={formData.organizerId}
                onSelect={(value) => setFormData(prev => ({ ...prev, organizerId: value }))}
                placeholder="Select organizer (optional)"
              />
            </div>

            {event && (
              <EventStatusSelector
                selected={formData.status}
                onSelect={(value) => setFormData(prev => ({ ...prev, status: value }))}
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base tap-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm sm:text-base tap-target"
            >
              {loading ? (event ? 'Updating...' : 'Creating...') : (event ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
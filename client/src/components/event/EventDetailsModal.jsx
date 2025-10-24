import React from 'react';
import { X, Calendar, Clock, MapPin, Users, User, Tag, Circle } from 'lucide-react';

const EventDetailsModal = ({ isOpen, onClose, event, onEdit, onRegister }) => {
  if (!isOpen || !event) return null;

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (type) => {
    const colors = {
      workshop: 'bg-blue-100 text-blue-800',
      seminar: 'bg-green-100 text-green-800',
      conference: 'bg-purple-100 text-purple-800',
      meeting: 'bg-yellow-100 text-yellow-800',
      training: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventPast = () => {
    return new Date(event.endDate) < new Date();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Event Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Event Title and Badges */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{event.title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full ${getTypeBadge(event.type)}`}>
                {event.type}
              </span>
              <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full ${getStatusBadge(event.status)}`}>
                {event.status}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Description</h4>
              <p className="text-sm sm:text-base text-gray-600">{event.description}</p>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date & Time
              </h4>
              <p className="text-sm sm:text-base text-gray-900">{formatDateTime(event.startDate)}</p>
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                End Date & Time
              </h4>
              <p className="text-sm sm:text-base text-gray-900">{formatDateTime(event.endDate)}</p>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h4>
              <p className="text-sm sm:text-base text-gray-900">{event.location}</p>
            </div>
          )}

          {/* Organizer */}
          {event.organizer && (
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Organizer
              </h4>
              <p className="text-sm sm:text-base text-gray-900">
                {event.organizer.firstName} {event.organizer.lastName}
              </p>
            </div>
          )}

          {/* Attendees */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Attendees ({event.attendees?.length || 0}
              {event.maxAttendees && `/${event.maxAttendees}`})
            </h4>
            {event.attendees && event.attendees.length > 0 ? (
              <div className="space-y-2">
                {event.attendees.slice(0, 5).map((attendee) => (
                  <div key={attendee.user._id} className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-orange-600" />
                    </div>
                    <span className="truncate">{attendee.user.firstName} {attendee.user.lastName}</span>
                    <span className="text-gray-500 flex-shrink-0">({attendee.status})</span>
                  </div>
                ))}
                {event.attendees.length > 5 && (
                  <p className="text-xs sm:text-sm text-gray-500">+{event.attendees.length - 5} more attendees</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">No attendees yet</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base tap-target"
            >
              Close
            </button>
            {!isEventPast() && event.status === 'published' && onRegister && (
              <button
                onClick={() => {
                  onRegister(event._id);
                  onClose();
                }}
                className="w-full sm:flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base tap-target"
              >
                Register
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(event);
                  onClose();
                }}
                className="w-full sm:flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base tap-target"
              >
                Edit Event
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
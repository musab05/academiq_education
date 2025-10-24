import React from 'react';
import { Calendar, MapPin, Edit, Trash2, UserPlus, Users, Clock } from 'lucide-react';

const EventTableRow = ({ event, onEdit, onDelete, onRegister }) => {
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventPast = () => {
    return new Date(event.endDate) < new Date();
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">{event.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadge(event.type)}`}>
                {event.type}
              </span>
              {event.location && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-24">{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>Start: {formatDateTime(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>End: {formatDateTime(event.endDate)}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(event.status)}`}>
          {event.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {event.attendees?.length || 0}
            {event.maxAttendees && `/${event.maxAttendees}`}
          </span>
          {event.organizer && (
            <div className="text-xs text-gray-500 ml-2">
              by {event.organizer.firstName} {event.organizer.lastName}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          {!isEventPast() && event.status === 'published' && (
            <button
              onClick={() => onRegister(event._id)}
              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
              title="Register"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(event)}
            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event._id)}
            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default EventTableRow;
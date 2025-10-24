import React from 'react';
import { Clock, MapPin } from 'lucide-react';

const EventCalendarItem = ({ event, onClick, dayIndex, totalDays }) => {
  const getEventColor = (type) => {
    const colors = {
      workshop: 'bg-orange-500',
      seminar: 'bg-orange-600',
      conference: 'bg-orange-700',
      meeting: 'bg-orange-400',
      training: 'bg-orange-800',
      other: 'bg-orange-500'
    };
    return colors[type] || 'bg-orange-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'opacity-50',
      published: 'opacity-100',
      cancelled: 'opacity-30 line-through',
      completed: 'opacity-75'
    };
    return colors[status] || 'opacity-100';
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(event);
    }
  };

  const isFirstDay = dayIndex === 0;
  const isLastDay = dayIndex === totalDays - 1;

  return (
    <div
      onClick={handleClick}
      className={`
        ${getEventColor(event.type)} text-white text-xs p-1 cursor-pointer
        hover:shadow-md ${getStatusColor(event.status)}
        ${isFirstDay ? 'rounded-l' : ''} ${isLastDay ? 'rounded-r' : ''}
        ${totalDays === 1 ? 'rounded' : ''}
      `}
      style={{
        minHeight: '24px'
      }}
      title={`${event.title} - ${formatTime(event.startDate)} to ${formatTime(event.endDate)}`}
    >
      <div className="font-medium truncate">{event.title}</div>
      {isFirstDay && (
        <div className="flex items-center gap-1 mt-1 opacity-90">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{formatTime(event.startDate)}</span>
          {event.location && (
            <>
              <MapPin className="w-3 h-3 ml-1" />
              <span className="text-xs truncate">{event.location}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCalendarItem;
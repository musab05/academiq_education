import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import EventCalendarItem from './EventCalendarItem';

const EventCalendar = ({ events = [], onEventClick, onEventUpdate, onCreateEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    
    // Next month's leading days
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const checkDate = new Date(date);
      
      return checkDate >= new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate()) &&
             checkDate <= new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
    });
  };

  const handleDateClick = (date) => {
    if (onCreateEvent) {
      onCreateEvent(date);
    }
  };



  const getEventPosition = (event, days) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    let startIndex = -1;
    let endIndex = -1;
    
    days.forEach((day, index) => {
      const dayDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
      const eventStartDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const eventEndDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      
      // Find start index - use first day of month if event starts before
      if (dayDate.getTime() === eventStartDate.getTime()) {
        startIndex = index;
      } else if (startIndex === -1 && dayDate > eventStartDate && day.isCurrentMonth) {
        startIndex = index;
      }
      
      // Find end index - use last day of month if event ends after
      if (dayDate.getTime() === eventEndDate.getTime()) {
        endIndex = index;
      }
    });
    
    // If event starts before current month, use first current month day
    if (startIndex === -1) {
      const firstCurrentMonthIndex = days.findIndex(day => day.isCurrentMonth);
      if (firstCurrentMonthIndex !== -1 && eventStart < days[firstCurrentMonthIndex].date) {
        startIndex = firstCurrentMonthIndex;
      }
    }
    
    // If event ends after current month, use last current month day
    if (endIndex === -1) {
      const lastCurrentMonthIndex = days.map((day, index) => day.isCurrentMonth ? index : -1)
        .filter(index => index !== -1).pop();
      if (lastCurrentMonthIndex !== undefined && eventEnd > days[lastCurrentMonthIndex].date) {
        endIndex = lastCurrentMonthIndex;
      }
    }
    
    return { startIndex, endIndex };
  };

  const renderEventBlocks = () => {
    const eventRows = [];
    const processedEvents = new Set();
    
    events.forEach((event, eventIndex) => {
      if (processedEvents.has(event._id)) return;
      
      const { startIndex, endIndex } = getEventPosition(event, days);
      if (startIndex === -1 && endIndex === -1) return;
      
      const rowIndex = Math.floor(eventIndex / 3); // Simple row calculation
      const startCol = startIndex % 7;
      const endCol = endIndex % 7;
      const startRow = Math.floor(startIndex / 7);
      const endRow = Math.floor(endIndex / 7);
      
      // Handle multi-row events
      for (let row = startRow; row <= endRow; row++) {
        const isFirstRow = row === startRow;
        const isLastRow = row === endRow;
        const colStart = isFirstRow ? startCol : 0;
        const colEnd = isLastRow ? endCol : 6;
        const span = colEnd - colStart + 1;
        
        eventRows.push(
          <div
            key={`${event._id}-${row}`}
            className="absolute pointer-events-auto"
            style={{
              left: `${(colStart / 7) * 100}%`,
              width: `${(span / 7) * 100}%`,
              top: `${row * 96 + 32 + (eventIndex % 3) * 28}px`,
              height: '24px',
              zIndex: 2
            }}
          >
            <EventCalendarItem
              event={event}
              onClick={onEventClick}
              dayIndex={isFirstRow ? 0 : (isLastRow ? span - 1 : -1)}
              totalDays={span}
            />
          </div>
        );
      }
      
      processedEvents.add(event._id);
    });
    
    return eventRows;
  };

  const days = getDaysInMonth();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {['month', 'week', 'day'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {daysOfWeek.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="relative">
        {/* Day cells */}
        <div className="grid grid-cols-7" style={{ minHeight: '600px' }}>
          {days.map((day, index) => {
            const isToday = new Date().toDateString() === day.date.toDateString();
            
            return (
              <div
                key={index}
                className={`border-r border-b border-gray-100 p-2 min-h-24 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday ? 'bg-blue-50' : ''}`}
                onClick={() => handleDateClick(day.date)}

              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                  {day.date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Event overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {renderEventBlocks()}
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
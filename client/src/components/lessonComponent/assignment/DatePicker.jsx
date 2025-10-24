import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const DatePicker = ({ value, onChange, label, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('23:59');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (date) => {
    if (!date) return 'Select date and time';
    return new Date(date).toLocaleString();
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day) => {
    const [hours, minutes] = selectedTime.split(':');
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, hours, minutes);
    onChange(newDate);
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date().setHours(0,0,0,0);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          disabled={isPast}
          className={`w-8 h-8 text-sm rounded hover:bg-orange-100 ${
            isToday ? 'bg-orange-500 text-white' : ''
          } ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'}`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:ring-2 focus:ring-orange-500 focus:border-orange-500 flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {formatDisplayDate(value)}
        </span>
        <Calendar size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft size={16} />
            </button>
            <h3 className="font-medium">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="w-8 h-8 text-xs text-gray-500 flex items-center justify-center font-medium">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
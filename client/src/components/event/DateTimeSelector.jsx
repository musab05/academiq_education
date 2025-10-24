import React from 'react';
import { Calendar } from 'lucide-react';

const DateTimeSelector = ({ label, value, onChange, required = false }) => {
  const formatDateTimeLocal = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        <Calendar className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
        <input
          type="datetime-local"
          required={required}
          value={formatDateTimeLocal(value)}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        />
      </div>
    </div>
  );
};

export default DateTimeSelector;
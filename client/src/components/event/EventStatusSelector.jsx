import React from 'react';
import { Circle } from 'lucide-react';

const EventStatusSelector = ({ selected, onSelect }) => {
  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'published', label: 'Published', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Status
      </label>
      <div className="relative">
        <Circle className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
        <select
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        >
          {statusOptions.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EventStatusSelector;
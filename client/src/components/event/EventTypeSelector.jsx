import React from 'react';
import { Tag } from 'lucide-react';

const EventTypeSelector = ({ selected, onSelect }) => {
  const eventTypes = [
    { value: 'workshop', label: 'Workshop', color: 'bg-blue-100 text-blue-800' },
    { value: 'seminar', label: 'Seminar', color: 'bg-green-100 text-green-800' },
    { value: 'conference', label: 'Conference', color: 'bg-purple-100 text-purple-800' },
    { value: 'meeting', label: 'Meeting', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'training', label: 'Training', color: 'bg-red-100 text-red-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Event Type *
      </label>
      <div className="relative">
        <Tag className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
        <select
          required
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
        >
          {eventTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EventTypeSelector;
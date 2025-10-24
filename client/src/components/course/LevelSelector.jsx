import React from 'react';
import { BookOpen, TrendingUp, Award } from 'lucide-react';

const levels = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'Perfect for those just starting out',
    icon: BookOpen,
    color: 'green'
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'For learners with some experience',
    icon: TrendingUp,
    color: 'yellow'
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'For experienced learners',
    icon: Award,
    color: 'red'
  }
];

const LevelSelector = ({ selected, onSelect }) => {
  return (
    <div className="space-y-3">
      {levels.map((level) => {
        const Icon = level.icon;
        const isSelected = selected === level.value;
        
        return (
          <label
            key={level.value}
            className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
              isSelected
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="level"
              value={level.value}
              checked={isSelected}
              onChange={() => onSelect(level.value)}
              className="text-orange-500 focus:ring-orange-500"
            />
            
            <div className={`p-2 rounded-lg ${
              level.color === 'green' ? 'bg-green-100 text-green-600' :
              level.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1">
              <div className="font-medium text-gray-900">{level.label}</div>
              <div className="text-sm text-gray-500">{level.description}</div>
            </div>
          </label>
        );
      })}
    </div>
  );
};

export default LevelSelector;
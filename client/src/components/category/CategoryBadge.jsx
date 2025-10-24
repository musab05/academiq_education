import React from 'react';

const CategoryBadge = ({ type, count, className = "" }) => {
  const getBadgeStyles = () => {
    switch (type) {
      case 'root':
        return 'bg-orange-100 text-orange-700';
      case 'child':
        return 'bg-gray-100 text-gray-700';
      case 'count':
        return 'bg-orange-50 text-orange-600 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBadgeStyles()} ${className}`}>
      {type === 'root' && 'Root'}
      {type === 'child' && 'Child'}
      {type === 'count' && count}
    </span>
  );
};

export default CategoryBadge;
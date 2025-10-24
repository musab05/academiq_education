import React from 'react';

const LessonNavigation = ({ onNextLesson, onPreviousLesson, hasNext, hasPrevious }) => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <button 
          onClick={onPreviousLesson}
          disabled={!hasPrevious}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous Lesson
        </button>
        <button 
          onClick={onNextLesson}
          disabled={!hasNext}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Lesson →
        </button>
      </div>
    </div>
  );
};

export default LessonNavigation;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SidebarCard = ({ price, lectures, level, language, onEnroll, isEnrolled, enrolling }) => {
  
  return (
  <aside className="w-full md:w-96">
    <div className="bg-white rounded-md shadow p-4 sm:p-6 sticky top-4 sm:top-6 border">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <div className="text-xl sm:text-2xl font-bold">{price}</div>
          <div className="text-xs text-gray-500">One time payment</div>
        </div>
        <div className="text-xs sm:text-sm text-gray-500">{lectures} lectures</div>
      </div>

      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-gray-600">Level</div>
          <div className="font-medium">{level}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-gray-600">Language</div>
          <div className="font-medium">{language}</div>
        </div>
        <div className="pt-3 sm:pt-4">
          <button 
            onClick={onEnroll} 
            disabled={enrolling}
            className="w-full bg-orange-500 text-white py-2 sm:py-3 rounded-md font-medium shadow hover:bg-orange-600 disabled:opacity-50 tap-target"
          >
            {enrolling ? 'Enrolling...' : isEnrolled ? 'Start Course' : 'Enroll Now'}
          </button>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 text-xs text-gray-400">Full lifetime access • Certificate of completion</div>
    </div>
  </aside>
  );
};

export default SidebarCard;
import React from 'react';
import { ArrowLeft, Menu, X } from 'lucide-react';

const LearningHeader = ({ courseTitle, onBack, onToggleSidebar, sidebarOpen }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <button
          onClick={onBack}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        </button>
        
        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">
            {courseTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target lg:hidden"
        >
          {sidebarOpen ? (
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          ) : (
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          )}
        </button>
        
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors tap-target"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default LearningHeader;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Courses from '../components/courseComponent/Courses';
import RightFilters from '../components/courseComponent/RightFilters';
import AdminRightSidebar from '../components/courseComponent/AdminRightSidebar';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';

const CreateCoursePage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ categories: [], levels: [] });
  const { user } = useSelector(state => state.user);

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({ categories: [], levels: [] });
    // Trigger a reset in RightFilters
    setFilterReset(prev => prev + 1);
  };

  const [filterReset, setFilterReset] = useState(0);

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />
        <div className="flex flex-1 relative">
          <div className="main-scroll flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <Courses filters={filters} onClearFilters={clearFilters} onToggleFilters={() => setShowFilters(!showFilters)} />
          </div>
          
          {/* Desktop Filters */}
          <div className="hidden lg:block filter-scroll w-80 overflow-y-auto shadow-lg mt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {user?.role === 'student' ? <RightFilters onFiltersChange={handleFiltersChange} resetTrigger={filterReset} /> : <AdminRightSidebar onFiltersChange={handleFiltersChange} />}
          </div>
          
          {/* Mobile Filters */}
          {showFilters && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowFilters(false)} />
              <div className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white z-50 overflow-y-auto lg:hidden">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg tap-target">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  {user?.role === 'student' ? <RightFilters onFiltersChange={handleFiltersChange} resetTrigger={filterReset} /> : <AdminRightSidebar onFiltersChange={handleFiltersChange} />}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;

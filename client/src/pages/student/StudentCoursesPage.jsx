import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, Play } from 'lucide-react';
import AddToPlaylistButton from '../../components/playlist/AddToPlaylistButton';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import RightFilters from '../../components/courseComponent/RightFilters';
import { courseAPI } from '../../services/api';
import { setCurrentCourse } from '../../store/slices/lessonSlice';
import { pushNavigation } from '../../store/slices/navigationSlice';
import thumbnail from '../../public/images/thumbnail.jpg';

const StudentCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ categories: [], levels: [] });
  const [filterReset, setFilterReset] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await courseAPI.getEnrolledCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = !searchTerm || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filters.categories.length === 0 || 
        (course.categories && course.categories.some(cat => 
          filters.categories.includes(cat._id || cat)
        ));
      
      const matchesLevel = filters.levels.length === 0 || 
        filters.levels.includes(course.level);
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchTerm, filters]);
  console.log(filteredCourses);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header onMenuClick={() => { setSidebarCollapsed(!sidebarCollapsed); setSidebarOpen(!sidebarOpen); }} />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">My Courses</h1>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full sm:w-64 h-10 pl-4 pr-10 rounded-md border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                  <Search size={16} className="absolute right-3 top-2.5 text-gray-400" />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 rounded-md border border-gray-200 hover:bg-gray-100 tap-target"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <p className="text-gray-500 mb-2">No enrolled courses yet</p>
                <p className="text-sm text-gray-400">Contact your instructor to get enrolled</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCourses.map((course) => (
                  <motion.div
                    key={course._id}
                    whileHover={{ scale: 1.02, boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="bg-white rounded-xl overflow-hidden cursor-pointer border border-gray-100 relative"
                    onClick={() => {
                      dispatch(setCurrentCourse(course._id));
                      dispatch(pushNavigation('/my-courses'));
                      navigate(`/course-preview/${course.slug}`);
                    }}
                  >
                    <div className="relative">
                      <img 
                        src={course.thumbnail || thumbnail} 
                        alt={course.title} 
                        className="w-full h-40 sm:h-48 object-cover"
                        onError={(e) => { e.target.src = thumbnail; }}
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">
                        by <span className="font-medium">{course.author?.firstName} {course.author?.lastName}</span>
                      </p>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">{course.description || 'No description'}</p>
                    </div>
                    <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                      <AddToPlaylistButton courseId={course._id} compact={true} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            </div>
          </div>
          
          {/* Desktop Filters */}
          <div className="hidden lg:block w-80 overflow-y-auto shadow-lg" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <RightFilters onFiltersChange={handleFiltersChange} resetTrigger={filterReset} />
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto lg:hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-md tap-target"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <RightFilters onFiltersChange={handleFiltersChange} resetTrigger={filterReset} />
          </div>
        </>
      )}
    </div>
  );
};

export default StudentCoursesPage;

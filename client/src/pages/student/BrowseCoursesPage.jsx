import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, Grid, List, ChevronLeft, ChevronRight, BookmarkPlus, Clock, BarChart } from 'lucide-react';
import AddToPlaylistButton from '../../components/playlist/AddToPlaylistButton';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import RightFilters from '../../components/courseComponent/RightFilters';
import { courseAPI, playlistAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { setCurrentCourse } from '../../store/slices/lessonSlice';
import { pushNavigation } from '../../store/slices/navigationSlice';
import thumbnail from '../../public/images/thumbnail.jpg';
import { debounce } from 'lodash';
import Navbar from '../../components/Navbar';

const BrowseCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState({ categories: [], levels: [], ratings: [], price: [] });
  const [filterReset, setFilterReset] = useState(0);
  const [view, setView] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 12;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);

  useEffect(() => {
    fetchAllCourses();
    fetchPlaylists();
  }, []);

  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const fetchAllCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await playlistAPI.getPlaylists();
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handleAddToPlaylist = async (playlistId, courseId, e) => {
    e.stopPropagation();
    try {
      await playlistAPI.addCourse(playlistId, courseId);
      showNotification({ type: 'success', message: 'Added to playlist' });
      setShowPlaylistMenu(null);
    } catch (error) {
      showNotification({ type: 'error', message: error.response?.data?.error || 'Failed to add to playlist' });
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = !debouncedQuery || 
        course.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(debouncedQuery.toLowerCase());
      
      const matchesCategory = filters.categories.length === 0 || 
        (course.categories && course.categories.some(cat => 
          filters.categories.includes(cat._id || cat)
        ));
      
      const matchesLevel = filters.levels.length === 0 || 
        filters.levels.includes(course.level);
      
      const matchesRating = filters.ratings.length === 0 || 
        filters.ratings.some(rating => {
          if (!course.reviews || course.reviews.length === 0) return false;
          const avgRating = course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length;
          return avgRating >= rating && avgRating < rating + 1;
        });
      
      const matchesPrice = filters.price.length === 0 || 
        filters.price.some(priceType => {
          if (priceType === 'free') return !course.price || course.price === 0;
          if (priceType === 'paid') return course.price && course.price > 0;
          return true;
        });
      
      return matchesSearch && matchesCategory && matchesLevel && matchesRating && matchesPrice;
    });
  }, [courses, debouncedQuery, filters]);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    return filteredCourses.slice(startIndex, startIndex + coursesPerPage);
  }, [filteredCourses, currentPage, coursesPerPage]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ categories: [], levels: [], ratings: [], price: [] });
    setCurrentPage(1);
    setFilterReset(prev => prev + 1);
  };

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="border border-gray-100">
            <div className="bg-white shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">All Courses</h1>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full sm:w-64 h-10 pl-4 pr-10 rounded-md border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                  <Search size={16} className="absolute right-3 top-2.5 text-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView('grid')}
                    className={'p-2 rounded-md ' + (view === 'grid' ? 'bg-orange-500 text-white' : 'border border-gray-100 hover:bg-gray-100')}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={'p-2 rounded-md hidden sm:flex ' + (view === 'list' ? 'bg-orange-500 text-white' : 'border border-gray-100 hover:bg-gray-100')}
                  >
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden p-2 rounded-md border border-gray-100 hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="text-xs sm:text-sm text-gray-600">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8a7.962 7.962 0 01-2 5.291z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500 mb-6">No courses match your current filters</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8' : 'flex flex-col gap-4 mb-6 sm:mb-8'}>
                  {paginatedCourses.map((course) => (
                    <motion.div
                      key={course._id}
                      whileHover={{ y: -4, boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)' }}
                      transition={{ duration: 0.2 }}
                      className={`bg-white rounded-lg overflow-hidden cursor-pointer border border-gray-200 hover:border-orange-300 transition-all relative ${view === 'list' ? 'hidden sm:flex' : ''}`}
                      onClick={() => {
                        dispatch(setCurrentCourse(course._id));
                        dispatch(pushNavigation('/all-courses'));
                        navigate(`/course-preview/${course.slug}`);
                      }}
                    >
                      <div className={`relative ${view === 'list' ? 'w-56 flex-shrink-0' : ''}`}>
                        <img src={course.thumbnail || thumbnail} alt={course.title} className={`object-cover ${view === 'list' ? 'w-full h-full' : 'w-full h-36 sm:h-44'}`} />
                        {course.category && (
                          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-medium px-2.5 py-1 rounded">
                            {course.category}
                          </span>
                        )}
                      </div>
                      <div className="p-3 sm:p-4 flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <img 
                            src={course.instructor?.profilePicture || `https://ui-avatars.com/api/?name=${course.instructor?.firstName}+${course.instructor?.lastName}&background=FF5A00&color=fff`} 
                            alt={`${course.instructor?.firstName} ${course.instructor?.lastName}`}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs font-medium text-gray-700">{course.instructor?.firstName} {course.instructor?.lastName}</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">{course.title}</h3>
                        <p className={`text-xs sm:text-sm text-gray-600 leading-relaxed ${view === 'grid' ? 'line-clamp-2' : 'line-clamp-3'}`}>{course.description || 'No description'}</p>
                      </div>
                      <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                        <AddToPlaylistButton courseId={course._id} compact={true} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-1 sm:gap-2 pt-4 border-t border-gray-200 flex-wrap">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[32px] sm:min-w-[40px] px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
        {/* Desktop Filters */}
        <div className="hidden lg:block w-80 overflow-y-auto bg-white border-l border-gray-200" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="sticky top-0">
            <RightFilters onFiltersChange={handleFiltersChange} resetTrigger={filterReset} />
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
                  className="p-2 hover:bg-gray-100 rounded-md"
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
    </div>
  );
};

export default BrowseCoursesPage;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Video, Calendar, Users, Search, Grid, List } from 'lucide-react';
import { classroomManagementAPI } from '../../services/api';

import { debounce } from 'lodash';
import Navbar from '../../components/Navbar';

const BrowseClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [view, setView] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const classroomsPerPage = 12;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllClassrooms();
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

  const fetchAllClassrooms = async () => {
    try {
      const response = await classroomManagementAPI.getAllPublic();
      setClassrooms(response.data || []);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClassroom = (classroom) => {
    navigate(`/classroom-preview/${classroom._id}`);
  };

  const filteredClassrooms = useMemo(() => {
    return classrooms.filter(classroom => {
      // Apply search filter
      if (!debouncedQuery) return true;
      return classroom.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
             classroom.description?.toLowerCase().includes(debouncedQuery.toLowerCase());
    });
  }, [classrooms, debouncedQuery]);

  const totalPages = Math.ceil(filteredClassrooms.length / classroomsPerPage);
  const paginatedClassrooms = useMemo(() => {
    const startIndex = (currentPage - 1) * classroomsPerPage;
    return filteredClassrooms.slice(startIndex, startIndex + classroomsPerPage);
  }, [filteredClassrooms, currentPage, classroomsPerPage]);



  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="border border-gray-100">
            <div className="bg-white shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">All Classrooms</h1>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search classrooms..."
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
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="text-xs sm:text-sm text-gray-600">
                  {filteredClassrooms.length} classroom{filteredClassrooms.length !== 1 ? 's' : ''} found
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                </div>
              ) : filteredClassrooms.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                    <Video className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No public classrooms found</h3>
                  <p className="text-gray-500">No public classrooms match your search</p>
                </div>
              ) : (
                <>
                  <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8' : 'flex flex-col gap-4 mb-6 sm:mb-8'}>
                    {paginatedClassrooms.map((classroom) => (
                      <motion.div
                        key={classroom._id}
                        whileHover={{ y: -4, boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)' }}
                        transition={{ duration: 0.2 }}
                        className={`bg-white rounded-lg overflow-hidden cursor-pointer border border-gray-200 hover:border-orange-300 transition-all ${view === 'list' ? 'hidden sm:flex' : ''}`}
                        onClick={() => handleOpenClassroom(classroom)}
                      >
                        <div className={`relative ${view === 'list' ? 'w-56 flex-shrink-0' : ''}`}>
                          <div className={`bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ${view === 'list' ? 'w-full h-full' : 'w-full h-36 sm:h-44'}`}>
                            <Video className="w-12 h-12 sm:w-16 sm:h-16 text-white opacity-80" />
                          </div>
                        </div>
                        <div className="p-3 sm:p-4 flex-1">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{classroom.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{classroom.description}</p>
                          
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-gray-400" />
                              {classroom.enrolledStudents?.length || 0} students enrolled
                            </div>
                            <div className="flex items-center text-xs sm:text-sm text-gray-600">
                              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-gray-400" />
                              {classroom.instructor?.firstName} {classroom.instructor?.lastName}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                      >
                        Previous
                      </button>
                      <span className="text-xs sm:text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseClassroomsPage;

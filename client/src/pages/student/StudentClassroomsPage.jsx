import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Video, Calendar, Users, Play } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { classroomManagementAPI } from '../../services/api';
import { setCurrentClassroom, setCurrentClassroomData } from '../../store/slices/classroomSlice';

const StudentClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledClassrooms();
  }, []);

  const fetchEnrolledClassrooms = async () => {
    try {
      const response = await classroomManagementAPI.getMyClassrooms();
      setClassrooms(response.data);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClassroom = (classroom) => {
    // Store the classroom data in Redux before navigating
    dispatch(setCurrentClassroom(classroom._id));
    dispatch(setCurrentClassroomData(classroom));
    navigate(`/classroom/${classroom._id}`);
  };

  return (
    <div className="flex bg-gray-50 min-h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.div 
        animate={{ width: sidebarCollapsed ? '5rem' : '18rem' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:block sidebar-scroll sticky top-0 h-screen overflow-y-auto bg-white shadow-lg"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </motion.div>

      {/* Mobile Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onMenuClick={() => {
            if (window.innerWidth >= 1024) {
              setSidebarCollapsed(!sidebarCollapsed);
            } else {
              setSidebarOpen(true);
            }
          }} 
        />
        
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">My Classrooms</h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">Join live sessions and interact with instructors</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            ) : classrooms.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
                <Video className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium text-sm sm:text-base">No classrooms enrolled yet</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">Contact your instructor to get enrolled</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {classrooms.map((classroom) => (
                  <div key={classroom._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Video className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 truncate" title={classroom.title}>{classroom.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{classroom.description}</p>

                    <div className="space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{classroom.enrolledStudents?.length || 0} students</span>
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{classroom.instructor?.firstName} {classroom.instructor?.lastName}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenClassroom(classroom)}
                      className="tap-target w-full px-4 py-2.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      View Sessions
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClassroomsPage;

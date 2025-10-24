import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Calendar, Clock, Users, Plus, Play, Edit, Trash2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { classroomManagementAPI } from '../../services/api';
import { setCurrentClassroom, setCurrentClassroomData } from '../../store/slices/classroomSlice';
import CreateClassroomModal from './CreateClassroomModal';

const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const currentUser = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await classroomManagementAPI.getAll();
      setClassrooms(response.data);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this classroom?')) return;
    try {
      await classroomManagementAPI.delete(id);
      fetchClassrooms();
    } catch (error) {
      console.error('Error deleting classroom:', error);
    }
  };

  const handleOpenClassroom = (classroom) => {
    // Store the classroom data in Redux before navigating
    dispatch(setCurrentClassroom(classroom._id));
    dispatch(setCurrentClassroomData(classroom));
    navigate(`/classroom/${classroom._id}`);
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Live Classrooms</h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">Create and manage live-only courses</p>
              </div>
              {currentUser?.role !== 'student' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-sm font-medium flex items-center justify-center gap-2 tap-target flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Create Classroom
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {classrooms.map((classroom) => (
                <div key={classroom._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 truncate">{classroom.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">{classroom.description}</p>

                  <div className="space-y-2 mb-3 sm:mb-4">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{classroom.enrolledStudents?.length || 0} students</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{classroom.instructor?.firstName} {classroom.instructor?.lastName}</span>
                    </div>
                    {classroom.institute && (
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium truncate">
                          {classroom.institute.name}
                        </span>
                      </div>
                    )}
                    {classroom.department && (
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-medium truncate">
                          {classroom.department.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenClassroom(classroom)}
                      className="flex-1 px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-xs sm:text-sm font-medium flex items-center justify-center gap-2 tap-target"
                    >
                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                      Open
                    </button>
                    {currentUser?.role !== 'student' && classroom.instructor._id === currentUser?._id && (
                      <button
                        onClick={() => handleDelete(classroom._id)}
                        className="px-2 sm:px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all tap-target"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {classrooms.length === 0 && (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No classrooms found</p>
                <p className="text-gray-400 text-sm mt-1">Create your first live classroom</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateClassroomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchClassrooms();
          }}
        />
      )}
    </div>
  );
};

export default ClassroomsPage;

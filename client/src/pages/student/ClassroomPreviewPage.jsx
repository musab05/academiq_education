import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Video, Users, Calendar, ArrowLeft } from 'lucide-react';
import { classroomManagementAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Navbar from '../../components/Navbar';

const ClassroomPreviewPage = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    fetchClassroom();
  }, [classroomId]);

  const fetchClassroom = async () => {
    try {
      const response = await classroomManagementAPI.getAllPublic();
      const found = response.data.find(c => c._id === classroomId);
      setClassroom(found);
      
      if (found && currentUser) {
        const enrolled = found.enrolledStudents?.some(s => 
          s._id === currentUser._id || s === currentUser._id
        );
        setIsEnrolled(enrolled);
      }
    } catch (error) {
      console.error('Error fetching classroom:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await classroomManagementAPI.enroll(classroomId, {});
      showNotification({ type: 'success', message: 'Successfully enrolled in classroom!' });
      navigate('/my-classrooms');
    } catch (error) {
      console.error('Error enrolling:', error);
      showNotification({ type: 'error', message: error.response?.data?.error || 'Failed to enroll' });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Classroom not found</h2>
            <button
              onClick={() => navigate('/all-classrooms')}
              className="tap-target text-orange-500 hover:text-orange-600 text-sm sm:text-base"
            >
              Back to classrooms
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex-1">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-6 sm:py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <button
              onClick={() => navigate('/all-classrooms')}
              className="tap-target flex items-center gap-2 text-white hover:text-orange-100 mb-4 sm:mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Back to classrooms</span>
            </button>
            
            <div className="flex flex-col lg:flex-row items-start gap-6 lg:justify-between">
              <div className="flex-1 w-full lg:w-auto">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{classroom.title}</h1>
                <p className="text-orange-100 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">{classroom.description}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{classroom.enrolledStudents?.length || 0} students enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base truncate">Instructor: {classroom.instructor?.firstName} {classroom.instructor?.lastName}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg w-full lg:w-auto lg:min-w-[280px]">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Video className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm">Live Classroom</p>
                </div>
                
                {isEnrolled ? (
                  <button
                    onClick={() => navigate('/my-classrooms')}
                    className="tap-target w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm sm:text-base"
                  >
                    Already Enrolled
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="tap-target w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">About this Classroom</h2>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{classroom.description}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">What you'll learn</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base">Participate in live interactive sessions</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base">Engage with instructors and peers in real-time</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base">Access recorded sessions for review</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Classroom Details</h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Instructor</p>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img
                        src={classroom.instructor?.profilePicture || `https://ui-avatars.com/api/?name=${classroom.instructor?.firstName}+${classroom.instructor?.lastName}&background=FF5A00&color=fff`}
                        alt={`${classroom.instructor?.firstName} ${classroom.instructor?.lastName}`}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {classroom.instructor?.firstName} {classroom.instructor?.lastName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Students Enrolled</p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{classroom.enrolledStudents?.length || 0} students</p>
                  </div>

                  {classroom.institute && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Institute</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate" title={classroom.institute.name}>{classroom.institute.name}</p>
                    </div>
                  )}

                  {classroom.department && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Department</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate" title={classroom.department.name}>{classroom.department.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomPreviewPage;
